import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Platform } from "@prisma/client";

const locationSchema = z.object({
  rank: z.number().int().min(1).max(5),
  country: z.string().max(100),
  pct: z.number().min(0).max(100),
});

const upsertSchema = z.object({
  platform: z.nativeEnum(Platform),
  handle: z.string().min(1),
  url: z.string().url(),
  followersCount: z.number().int().nonnegative().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  profileCategory: z.enum(["COMMUNITY", "CREATOR"]).optional(),
  genres: z.array(z.string()).default([]),
  keyTopics: z.array(z.string()).default([]),
  topLocations: z.array(locationSchema).max(5).default([]),
  pricePerPostCents: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).default("EUR"),
});

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });
  if (!user?.creatorProfile) {
    return NextResponse.json({ error: "Creator profile not found" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { platform, handle, url, followersCount, logoUrl, profileCategory, genres, keyTopics, topLocations, pricePerPostCents, currency } = parsed.data;

  const record = await prisma.creatorPlatform.upsert({
    where: { creatorProfileId_platform: { creatorProfileId: user.creatorProfile.id, platform } },
    create: {
      creatorProfileId: user.creatorProfile.id,
      platform,
      handle,
      url,
      followersCount: followersCount ?? null,
      logoUrl: logoUrl || null,
      profileCategory: profileCategory ?? null,
      genres,
      keyTopics,
      topLocations: topLocations.length > 0 ? topLocations : undefined,
      pricePerPostCents: pricePerPostCents ?? null,
      currency,
    },
    update: {
      handle,
      url,
      followersCount: followersCount ?? null,
      logoUrl: logoUrl || null,
      profileCategory: profileCategory ?? null,
      genres,
      keyTopics,
      topLocations: topLocations.length > 0 ? topLocations : undefined,
      pricePerPostCents: pricePerPostCents ?? null,
      currency,
    },
  });

  // Set creator to PENDING approval whenever they update a platform profile
  await prisma.creatorProfile.update({
    where: { id: user.creatorProfile.id },
    data: { approvalStatus: "PENDING", approvedAt: null, rejectedReason: null },
  });

  return NextResponse.json({ platform: record });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: { include: { platforms: true } } },
  });
  if (!user?.creatorProfile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ platforms: user.creatorProfile.platforms });
}
