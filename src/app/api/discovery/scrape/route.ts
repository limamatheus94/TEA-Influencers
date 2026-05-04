import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/lib/inngest";
import { ScrapingSource } from "@prisma/client";
import { z } from "zod";

const scrapeSchema = z.object({
  outreachCampaignId: z.string().min(1),
  source: z.nativeEnum(ScrapingSource),
  query: z.string().min(2),
  genre: z.string().min(1),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = scrapeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { outreachCampaignId, source, query, genre } = parsed.data;

  const campaign = await prisma.outreachCampaign.findUnique({
    where: { id: outreachCampaignId },
    select: { id: true },
  });

  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  const job = await prisma.scrapingJob.create({
    data: {
      outreachCampaignId,
      source,
      query,
      genre,
      status: "PENDING",
    },
  });

  const event = await inngest.send({
    name: "scraping/job.created",
    data: {
      scrapingJobId: job.id,
      source: source as "SPOTIFY" | "YOUTUBE" | "MANUAL",
      query,
      genre,
      outreachCampaignId,
    },
  });

  await prisma.scrapingJob.update({
    where: { id: job.id },
    data: { inngestEventId: event.ids[0] },
  });

  return NextResponse.json({ job }, { status: 201 });
}
