import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CampaignStatus } from "@prisma/client";
import { z } from "zod";

const patchSchema = z.object({
  status: z.nativeEnum(CampaignStatus).optional(),
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).optional(),
  deadline: z.string().datetime().nullable().optional(),
  maxApplications: z.number().int().positive().nullable().optional(),
});

async function getBrandCampaign(userId: string, campaignId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { brandProfile: true },
  });
  if (!user?.brandProfile) return null;

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brandProfileId: user.brandProfile.id },
    include: {
      applications: {
        include: {
          creatorProfile: {
            include: { platforms: true, user: { select: { email: true } } },
          },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { applications: true } },
    },
  });
  return campaign;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const campaign = await getBrandCampaign(userId, id);
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(campaign);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { brandProfile: true },
  });
  if (!user?.brandProfile) return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });

  const campaign = await prisma.campaign.findFirst({
    where: { id, brandProfileId: user.brandProfile.id },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.campaign.update({
    where: { id },
    data: {
      ...(parsed.data.status && { status: parsed.data.status }),
      ...(parsed.data.title && { title: parsed.data.title }),
      ...(parsed.data.description && { description: parsed.data.description }),
      ...(parsed.data.deadline !== undefined && {
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      }),
      ...(parsed.data.maxApplications !== undefined && {
        maxApplications: parsed.data.maxApplications,
      }),
    },
  });

  return NextResponse.json(updated);
}
