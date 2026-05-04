import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { CampaignStatus, CampaignType, Platform } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(1).max(2000),
  genres: z.array(z.string()).optional(),
  platforms: z.array(z.nativeEnum(Platform)).optional(),
  budgetCents: z.number().int().min(0).optional(),
  deliverables: z.string().optional(),
  deadline: z.string().datetime().optional(),
  maxApplications: z.number().int().positive().optional(),
  // Pick & choose fields
  artistName: z.string().optional(),
  songTitle: z.string().optional(),
  songLink: z.string().optional(),
  platformSlug: z.string().optional(),
  selectedPlatformIds: z.array(z.string()).optional(),
  totalCents: z.number().int().min(0).optional(),
  campaignType: z.nativeEnum(CampaignType).optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { brandProfile: true },
  });

  if (!user?.brandProfile) {
    return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: { brandProfileId: user.brandProfile.id },
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(campaigns);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { brandProfile: true },
  });

  if (!user?.brandProfile) {
    return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
  }

  const body = await req.json();
  console.log("[campaigns POST] body:", JSON.stringify(body));

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    const messages = parsed.error.issues.map((e) => e.message).join(", ");
    console.log("[campaigns POST] zod error:", messages);
    return NextResponse.json({ error: messages }, { status: 400 });
  }

  const data = parsed.data;
  console.log("[campaigns POST] parsed ok, genres:", data.genres, "platforms:", data.platforms, "budget:", data.budgetCents, "deliverables:", data.deliverables);
  const isPickAndChoose = Array.isArray(data.selectedPlatformIds) && data.selectedPlatformIds.length > 0;

  if (isPickAndChoose) {
    // Pick & choose flow: resolve platforms and prices from selected CreatorPlatforms
    const creatorPlatforms = await prisma.creatorPlatform.findMany({
      where: { id: { in: data.selectedPlatformIds! } },
      select: { id: true, platform: true, pricePerPostCents: true, genres: true },
    });

    const resolvedPlatforms = [...new Set(creatorPlatforms.map((cp) => cp.platform))];
    const resolvedGenres = [...new Set(creatorPlatforms.flatMap((cp) => cp.genres))];
    const budget = data.totalCents ?? creatorPlatforms.reduce((sum, cp) => sum + (cp.pricePerPostCents ?? 0), 0);

    const campaign = await prisma.campaign.create({
      data: {
        brandProfileId: user.brandProfile.id,
        title: data.title,
        artistName: data.artistName,
        songTitle: data.songTitle,
        songLink: data.songLink || null,
        description: data.description,
        genres: resolvedGenres,
        platforms: resolvedPlatforms,
        budgetCents: budget,
        deliverables: "Influencer post as selected",
        status: CampaignStatus.OPEN,
        campaignType: CampaignType.PICK_AND_CHOOSE,
        selections: {
          create: creatorPlatforms.map((cp) => ({
            creatorPlatformId: cp.id,
            agreedPriceCents: cp.pricePerPostCents ?? 0,
          })),
        },
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  }

  // Open Call flow
  if (!data.genres?.length || !data.platforms?.length || !data.budgetCents || !data.deliverables) {
    console.log("[campaigns POST] missing fields check failed:", {
      genres: data.genres?.length,
      platforms: data.platforms?.length,
      budgetCents: data.budgetCents,
      deliverables: data.deliverables,
    });
    return NextResponse.json({
      error: `Missing required fields: ${[
        !data.genres?.length && "genres",
        !data.platforms?.length && "platforms",
        !data.budgetCents && "budget",
        !data.deliverables && "deliverables",
      ].filter(Boolean).join(", ")}`,
    }, { status: 400 });
  }

  try {
    const campaign = await prisma.campaign.create({
      data: {
        brandProfileId: user.brandProfile.id,
        title: data.title,
        artistName: data.artistName,
        songTitle: data.songTitle,
        songLink: data.songLink || null,
        description: data.description,
        genres: data.genres,
        platforms: data.platforms,
        budgetCents: data.budgetCents,
        deliverables: data.deliverables,
        deadline: data.deadline ? new Date(data.deadline) : null,
        maxApplications: data.maxApplications,
        status: CampaignStatus.OPEN,
        campaignType: data.campaignType ?? CampaignType.OPEN_CALL,
      },
    });
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[campaigns POST] prisma error:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
