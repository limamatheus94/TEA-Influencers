import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { scoreCreator } from "@/lib/ai/score-creator";

export const scoreCreators = inngest.createFunction(
  {
    id: "score-creators",
    concurrency: { limit: 5 },
    triggers: [{ event: "outreach/creators.score" as const }],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ({ event, step }: any) => {
    const { outreachCampaignId, contactIds } = event.data as {
      outreachCampaignId: string;
      contactIds: string[];
    };

    const campaign = await step.run("load-campaign", async () => {
      return prisma.outreachCampaign.findUniqueOrThrow({ where: { id: outreachCampaignId } });
    });

    for (const contactId of contactIds) {
      await step.run(`score-${contactId}`, async () => {
        const contact = await prisma.outreachContact.findUniqueOrThrow({
          where: { id: contactId },
          include: { discoveredCreator: true },
        });

        const { score, reasoning } = await scoreCreator({
          campaign,
          creator: contact.discoveredCreator,
        });

        await prisma.outreachContact.update({
          where: { id: contactId },
          data: {
            fitScore: score,
            fitReasoning: reasoning,
            scoredAt: new Date(),
            status: "SCORED",
          },
        });
      });
    }
  }
);
