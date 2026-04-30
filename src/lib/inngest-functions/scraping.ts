import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { spotifyDiscover } from "@/lib/scrapers/spotify";
import { youtubeDiscover } from "@/lib/scrapers/youtube";

export const runScrapingJob = inngest.createFunction(
  {
    id: "run-scraping-job",
    retries: 2,
    triggers: [{ event: "scraping/job.created" as const }],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ({ event, step }: any) => {
    const { scrapingJobId, source, query, genre, outreachCampaignId } = event.data as {
      scrapingJobId: string;
      source: string;
      query: string;
      genre: string;
      outreachCampaignId: string;
    };

    await step.run("mark-running", async () => {
      await prisma.scrapingJob.update({
        where: { id: scrapingJobId },
        data: { status: "RUNNING", startedAt: new Date() },
      });
    });

    const discovered = await step.run("discover-creators", async () => {
      if (source === "SPOTIFY") return spotifyDiscover({ query, genre });
      if (source === "YOUTUBE") return youtubeDiscover({ query, genre });
      return [];
    });

    const { newCount, cachedCount } = await step.run("upsert-creators", async () => {
      let newCount = 0;
      let cachedCount = 0;

      for (const creator of discovered) {
        const existing = await prisma.discoveredCreator.findUnique({
          where: {
            source_externalId: { source: creator.source, externalId: creator.externalId },
          },
        });

        if (existing) {
          await prisma.discoveredCreator.update({
            where: { id: existing.id },
            data: { lastScrapedAt: new Date(), recentContent: creator.recentContent },
          });
          cachedCount++;
          await prisma.outreachContact.upsert({
            where: {
              outreachCampaignId_discoveredCreatorId: {
                outreachCampaignId,
                discoveredCreatorId: existing.id,
              },
            },
            update: {},
            create: { outreachCampaignId, discoveredCreatorId: existing.id },
          });
        } else {
          const newCreator = await prisma.discoveredCreator.create({ data: creator });
          await prisma.outreachContact.create({
            data: { outreachCampaignId, discoveredCreatorId: newCreator.id },
          });
          newCount++;
        }
      }

      return { newCount, cachedCount };
    });

    await step.run("mark-completed", async () => {
      await prisma.scrapingJob.update({
        where: { id: scrapingJobId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          totalFound: discovered.length,
          totalNew: newCount,
          totalCached: cachedCount,
        },
      });
    });

    return { totalFound: discovered.length, newCount, cachedCount };
  }
);
