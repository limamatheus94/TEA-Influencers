import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Platform } from "@prisma/client";

const createSchema = z.object({
  platform: z.nativeEnum(Platform),
  url: z.string().url("Invalid post URL"),
  screenshotUrl: z.string().url().optional().or(z.literal("")),
  postDescription: z.string().max(500).optional(),
  storyTag: z.string().max(100).optional(),
  storyLink: z.string().url().optional().or(z.literal("")),
  impressions: z.number().int().nonnegative().optional(),
  likes: z.number().int().nonnegative().optional(),
  followersCount: z.number().int().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: applicationId } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });
  if (!user?.creatorProfile) {
    return NextResponse.json({ error: "Creator profile not found" }, { status: 403 });
  }

  const application = await prisma.application.findFirst({
    where: { id: applicationId, creatorProfileId: user.creatorProfile.id, status: "APPROVED" },
  });
  if (!application) {
    return NextResponse.json({ error: "Application not found or not approved" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { screenshotUrl, storyLink, ...rest } = parsed.data;

  const delivery = await prisma.deliveryItem.create({
    data: {
      applicationId,
      screenshotUrl: screenshotUrl || null,
      storyLink: storyLink || null,
      status: "SUBMITTED",
      submittedAt: new Date(),
      ...rest,
    },
  });

  return NextResponse.json({ delivery }, { status: 201 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: applicationId } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });
  if (!user?.creatorProfile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const application = await prisma.application.findFirst({
    where: { id: applicationId, creatorProfileId: user.creatorProfile.id },
    include: { deliveryItems: { orderBy: { createdAt: "desc" } } },
  });
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ deliveries: application.deliveryItems });
}
