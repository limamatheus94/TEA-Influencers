import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CampaignStatus } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  campaignId: z.string().min(1),
  pitch: z.string().min(20, "Pitch deve ter ao menos 20 caracteres").max(2000),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });

  if (!user?.creatorProfile) {
    return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const messages = parsed.error.issues.map((e) => e.message).join(", ");
    return NextResponse.json({ error: messages }, { status: 400 });
  }

  const { campaignId, pitch } = parsed.data;

  // Campaign must be open
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.status !== CampaignStatus.OPEN) {
    return NextResponse.json({ error: "Campanha não está aberta para candidaturas" }, { status: 422 });
  }

  // Check maxApplications
  if (campaign.maxApplications) {
    const count = await prisma.application.count({ where: { campaignId } });
    if (count >= campaign.maxApplications) {
      return NextResponse.json({ error: "Limite de candidaturas atingido" }, { status: 422 });
    }
  }

  // Prevent duplicate
  const existing = await prisma.application.findUnique({
    where: {
      campaignId_creatorProfileId: {
        campaignId,
        creatorProfileId: user.creatorProfile.id,
      },
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Você já se candidatou a esta campanha" }, { status: 409 });
  }

  const application = await prisma.application.create({
    data: {
      campaignId,
      creatorProfileId: user.creatorProfile.id,
      pitch,
    },
  });

  return NextResponse.json(application, { status: 201 });
}
