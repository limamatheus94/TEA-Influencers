import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Platform, ApprovalStatus } from "@prisma/client";
import { InfluencerGrid } from "./influencer-grid";

const PLATFORM_LABELS: Record<string, string> = {
  MULTI: "Multi Platforms",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  SPOTIFY: "Spotify",
  SOUNDCLOUD: "SoundCloud",
  YOUTUBE: "YouTube",
  FACEBOOK: "Facebook",
  PRESS: "Press",
};

const VALID_PLATFORMS = ["MULTI", "INSTAGRAM", "TIKTOK", "SPOTIFY", "SOUNDCLOUD", "YOUTUBE", "FACEBOOK", "PRESS"];

type Params = Promise<{ platform: string }>;
type SearchParams = Promise<{ genre?: string; category?: string; q?: string }>;

export default async function PickAndChoosePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { platform: platformParam } = await params;
  const { genre, category, q } = await searchParams;

  const platformSlug = platformParam.toUpperCase();
  if (!VALID_PLATFORMS.includes(platformSlug)) redirect("/brand/campaigns/new");

  const isMulti = platformSlug === "MULTI";

  // Fetch approved creators with their platform profiles
  const whereClause = isMulti
    ? { approvalStatus: ApprovalStatus.APPROVED }
    : {
        approvalStatus: ApprovalStatus.APPROVED,
        platforms: { some: { platform: platformSlug as Platform } },
      };

  const creators = await prisma.creatorProfile.findMany({
    where: whereClause,
    include: {
      platforms: {
        where: isMulti ? {} : { platform: platformSlug as Platform },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Flatten to individual platform entries for pick & choose
  const influencers = creators.flatMap((creator) =>
    creator.platforms.map((cp) => ({
      creatorProfileId: creator.id,
      creatorPlatformId: cp.id,
      displayName: creator.displayName,
      avatarUrl: creator.avatarUrl,
      platform: cp.platform,
      handle: cp.handle,
      logoUrl: cp.logoUrl,
      followersCount: cp.followersCount ?? cp.subscribersCount ?? 0,
      pricePerPostCents: cp.pricePerPostCents ?? 0,
      currency: cp.currency,
      profileCategory: cp.profileCategory,
      genres: cp.genres,
      keyTopics: cp.keyTopics,
      topLocations: cp.topLocations as { rank: number; country: string; pct: number }[] | null,
    }))
  );

  // Extract unique genres and categories for filters
  const allGenres = [...new Set(influencers.flatMap((i) => i.genres))].sort();
  const allPlatforms = [...new Set(influencers.map((i) => i.platform))].sort();

  // Apply filters from search params
  let filtered = influencers;
  if (genre) filtered = filtered.filter((i) => i.genres.includes(genre));
  if (category) filtered = filtered.filter((i) => i.profileCategory === category);
  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.displayName.toLowerCase().includes(lower) ||
        i.handle.toLowerCase().includes(lower)
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-5">
        <p className="text-xs font-bold tracking-widest text-[#3a51fb] uppercase">
          Service Offered — Influencers Post for Clients
        </p>
        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
          Pick &amp; Choose — {PLATFORM_LABELS[platformSlug] ?? platformSlug}
        </h1>
      </div>

      <InfluencerGrid
        influencers={filtered}
        allGenres={allGenres}
        allPlatforms={isMulti ? allPlatforms : []}
        isMulti={isMulti}
        platformSlug={platformSlug}
        currentGenre={genre ?? null}
        currentCategory={category ?? null}
        currentQ={q ?? null}
      />
    </div>
  );
}
