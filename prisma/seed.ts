import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Fake creators data ───────────────────────────────────────────────────────
const FAKE_CREATORS = [
  {
    email: "alex.techno@demo.com",
    displayName: "Alex Rivera",
    platforms: [
      {
        platform: "INSTAGRAM" as const,
        handle: "alexrivera.music",
        url: "https://instagram.com/alexrivera.music",
        followersCount: 48200,
        logoUrl: "https://i.pravatar.cc/150?img=1",
        profileCategory: "CREATOR",
        genres: ["Techno Hard/Peak", "Techno Melodic/Minimal"],
        keyTopics: ["Ibiza", "Dancing"],
        topLocations: [
          { rank: 1, country: "Spain", pct: 24.1 },
          { rank: 2, country: "Germany", pct: 18.3 },
          { rank: 3, country: "Italy", pct: 9.7 },
          { rank: 4, country: "France", pct: 6.2 },
          { rank: 5, country: "Brazil", pct: 4.1 },
        ],
        pricePerPostCents: 18000,
        currency: "EUR",
      },
      {
        platform: "TIKTOK" as const,
        handle: "alexrivera.techno",
        url: "https://tiktok.com/@alexrivera.techno",
        followersCount: 125000,
        logoUrl: "https://i.pravatar.cc/150?img=1",
        profileCategory: "CREATOR",
        genres: ["Techno Hard/Peak", "Techno Melodic/Minimal"],
        keyTopics: [],
        topLocations: [
          { rank: 1, country: "Germany", pct: 31.2 },
          { rank: 2, country: "Spain", pct: 19.8 },
          { rank: 3, country: "USA", pct: 12.4 },
        ],
        pricePerPostCents: 35000,
        currency: "EUR",
      },
    ],
  },
  {
    email: "sofia.house@demo.com",
    displayName: "Sofia Martinez",
    platforms: [
      {
        platform: "INSTAGRAM" as const,
        handle: "sofiahouse_music",
        url: "https://instagram.com/sofiahouse_music",
        followersCount: 89500,
        logoUrl: "https://i.pravatar.cc/150?img=5",
        profileCategory: "COMMUNITY",
        genres: ["House Melodic/Afro", "House Tech House"],
        keyTopics: ["Dancing", "Meme"],
        topLocations: [
          { rank: 1, country: "Brazil", pct: 34.5 },
          { rank: 2, country: "Colombia", pct: 21.1 },
          { rank: 3, country: "Mexico", pct: 15.7 },
          { rank: 4, country: "Argentina", pct: 9.4 },
          { rank: 5, country: "Spain", pct: 5.2 },
        ],
        pricePerPostCents: 28000,
        currency: "EUR",
      },
      {
        platform: "SPOTIFY" as const,
        handle: "Sofia Beats Playlist",
        url: "https://open.spotify.com/user/sofiabeats",
        followersCount: 22400,
        logoUrl: "https://i.pravatar.cc/150?img=5",
        profileCategory: null,
        genres: ["House Melodic/Afro", "Dance Pop"],
        keyTopics: [],
        topLocations: [],
        pricePerPostCents: 12000,
        currency: "EUR",
      },
    ],
  },
  {
    email: "marcus.dnb@demo.com",
    displayName: "Marcus Chen",
    platforms: [
      {
        platform: "YOUTUBE" as const,
        handle: "MarcusChenDNB",
        url: "https://youtube.com/@MarcusChenDNB",
        followersCount: 312000,
        logoUrl: "https://i.pravatar.cc/150?img=11",
        profileCategory: "CREATOR",
        genres: ["D&B", "Bass"],
        keyTopics: ["Ibiza"],
        topLocations: [
          { rank: 1, country: "United Kingdom", pct: 29.8 },
          { rank: 2, country: "USA", pct: 22.5 },
          { rank: 3, country: "Australia", pct: 11.3 },
          { rank: 4, country: "Canada", pct: 8.7 },
          { rank: 5, country: "Germany", pct: 4.9 },
        ],
        pricePerPostCents: 75000,
        currency: "GBP",
      },
      {
        platform: "SOUNDCLOUD" as const,
        handle: "marcuschen",
        url: "https://soundcloud.com/marcuschen",
        followersCount: 45800,
        logoUrl: "https://i.pravatar.cc/150?img=11",
        profileCategory: null,
        genres: ["D&B", "Bass", "EDM"],
        keyTopics: [],
        topLocations: [
          { rank: 1, country: "United Kingdom", pct: 38.2 },
          { rank: 2, country: "USA", pct: 24.1 },
        ],
        pricePerPostCents: 20000,
        currency: "GBP",
      },
    ],
  },
  {
    email: "lena.edm@demo.com",
    displayName: "Lena Fischer",
    platforms: [
      {
        platform: "INSTAGRAM" as const,
        handle: "lena.edm.official",
        url: "https://instagram.com/lena.edm.official",
        followersCount: 210000,
        logoUrl: "https://i.pravatar.cc/150?img=20",
        profileCategory: "CREATOR",
        genres: ["EDM", "House Tech House"],
        keyTopics: ["Ibiza", "Dancing"],
        topLocations: [
          { rank: 1, country: "Germany", pct: 41.2 },
          { rank: 2, country: "Austria", pct: 16.3 },
          { rank: 3, country: "Switzerland", pct: 12.1 },
          { rank: 4, country: "Netherlands", pct: 7.8 },
          { rank: 5, country: "France", pct: 5.4 },
        ],
        pricePerPostCents: 60000,
        currency: "EUR",
      },
      {
        platform: "FACEBOOK" as const,
        handle: "LenaFischerEDM",
        url: "https://facebook.com/LenaFischerEDM",
        followersCount: 56000,
        logoUrl: "https://i.pravatar.cc/150?img=20",
        profileCategory: null,
        genres: ["EDM"],
        keyTopics: ["Dancing"],
        topLocations: [
          { rank: 1, country: "Germany", pct: 52.1 },
          { rank: 2, country: "Austria", pct: 18.4 },
        ],
        pricePerPostCents: 15000,
        currency: "EUR",
      },
    ],
  },
  {
    email: "kai.psy@demo.com",
    displayName: "Kai Andersen",
    platforms: [
      {
        platform: "SPOTIFY" as const,
        handle: "Kai Psy Playlists",
        url: "https://open.spotify.com/user/kaipsy",
        followersCount: 8900,
        logoUrl: "https://i.pravatar.cc/150?img=33",
        profileCategory: null,
        genres: ["Psy/Trance", "EDM"],
        keyTopics: [],
        topLocations: [],
        pricePerPostCents: 8000,
        currency: "EUR",
      },
      {
        platform: "SOUNDCLOUD" as const,
        handle: "kaiandersen",
        url: "https://soundcloud.com/kaiandersen",
        followersCount: 31200,
        logoUrl: "https://i.pravatar.cc/150?img=33",
        profileCategory: null,
        genres: ["Psy/Trance", "Dubstep"],
        keyTopics: [],
        topLocations: [
          { rank: 1, country: "Denmark", pct: 28.5 },
          { rank: 2, country: "Netherlands", pct: 22.1 },
          { rank: 3, country: "Germany", pct: 14.7 },
        ],
        pricePerPostCents: 11000,
        currency: "EUR",
      },
    ],
  },
  {
    email: "priya.afrohouse@demo.com",
    displayName: "Priya Nair",
    platforms: [
      {
        platform: "TIKTOK" as const,
        handle: "priya.afrohouse",
        url: "https://tiktok.com/@priya.afrohouse",
        followersCount: 780000,
        logoUrl: "https://i.pravatar.cc/150?img=47",
        profileCategory: "COMMUNITY",
        genres: ["House Melodic/Afro", "Techno Melodic/Minimal"],
        keyTopics: ["Dancing", "Meme"],
        topLocations: [
          { rank: 1, country: "India", pct: 38.4 },
          { rank: 2, country: "USA", pct: 21.2 },
          { rank: 3, country: "United Kingdom", pct: 11.8 },
          { rank: 4, country: "Canada", pct: 8.1 },
          { rank: 5, country: "Australia", pct: 4.3 },
        ],
        pricePerPostCents: 120000,
        currency: "EUR",
      },
    ],
  },
  {
    email: "james.press@demo.com",
    displayName: "James O'Brien",
    platforms: [
      {
        platform: "PRESS" as const,
        handle: "Electronic Groove Magazine",
        url: "https://electronicgroove.net",
        followersCount: 95000,
        logoUrl: "https://i.pravatar.cc/150?img=52",
        profileCategory: null,
        genres: ["Techno Hard/Peak", "House Tech House", "D&B"],
        keyTopics: ["Ibiza"],
        topLocations: [
          { rank: 1, country: "United Kingdom", pct: 45.2 },
          { rank: 2, country: "Ireland", pct: 18.7 },
          { rank: 3, country: "USA", pct: 14.3 },
        ],
        pricePerPostCents: 25000,
        currency: "GBP",
      },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding fake creators...");

  for (const creator of FAKE_CREATORS) {
    // Upsert user (fake clerkId based on email)
    const clerkId = `fake_${creator.email.replace(/[@.]/g, "_")}`;

    const user = await prisma.user.upsert({
      where: { email: creator.email },
      update: {},
      create: {
        clerkId,
        email: creator.email,
        role: "CREATOR",
      },
    });

    // Upsert creator profile
    const profile = await prisma.creatorProfile.upsert({
      where: { userId: user.id },
      update: { approvalStatus: "APPROVED", approvedAt: new Date() },
      create: {
        userId: user.id,
        displayName: creator.displayName,
        bio: `Electronic music creator & influencer.`,
        genres: [...new Set(creator.platforms.flatMap((p) => p.genres))],
        approvalStatus: "APPROVED",
        approvedAt: new Date(),
        isPublic: true,
      },
    });

    // Upsert each platform
    for (const p of creator.platforms) {
      await prisma.creatorPlatform.upsert({
        where: { creatorProfileId_platform: { creatorProfileId: profile.id, platform: p.platform } },
        update: {
          handle: p.handle,
          url: p.url,
          followersCount: p.followersCount,
          logoUrl: p.logoUrl,
          profileCategory: p.profileCategory,
          genres: p.genres,
          keyTopics: p.keyTopics,
          topLocations: p.topLocations,
          pricePerPostCents: p.pricePerPostCents,
          currency: p.currency,
        },
        create: {
          creatorProfileId: profile.id,
          platform: p.platform,
          handle: p.handle,
          url: p.url,
          followersCount: p.followersCount,
          logoUrl: p.logoUrl,
          profileCategory: p.profileCategory,
          genres: p.genres,
          keyTopics: p.keyTopics,
          topLocations: p.topLocations,
          pricePerPostCents: p.pricePerPostCents,
          currency: p.currency,
        },
      });
    }

    console.log(`  ✅ ${creator.displayName} (${creator.platforms.length} platforms)`);
  }

  // ─── Fake brand + campaign ───────────────────────────────────────────────────
  console.log("\n🌱 Seeding fake brand and campaigns...");

  const brandUser = await prisma.user.upsert({
    where: { email: "brand.demo@soundwave.com" },
    update: {},
    create: {
      clerkId: "fake_brand_demo_soundwave_com",
      email: "brand.demo@soundwave.com",
      role: "BRAND",
    },
  });

  const brand = await prisma.brandProfile.upsert({
    where: { userId: brandUser.id },
    update: {},
    create: {
      userId: brandUser.id,
      companyName: "SoundWave Records",
      website: "https://soundwaverecords.com",
      bio: "Independent electronic music label based in Berlin.",
    },
  });

  // Get some approved platform IDs for selections
  const technoIG = await prisma.creatorPlatform.findFirst({
    where: { platform: "INSTAGRAM", handle: "alexrivera.music" },
  });
  const houseIG = await prisma.creatorPlatform.findFirst({
    where: { platform: "INSTAGRAM", handle: "sofiahouse_music" },
  });
  const lenaIG = await prisma.creatorPlatform.findFirst({
    where: { platform: "INSTAGRAM", handle: "lena.edm.official" },
  });
  const priyaTT = await prisma.creatorPlatform.findFirst({
    where: { platform: "TIKTOK", handle: "priya.afrohouse" },
  });
  const marcusYT = await prisma.creatorPlatform.findFirst({
    where: { platform: "YOUTUBE", handle: "MarcusChenDNB" },
  });

  // Campaign 1 — Pick & choose with selections
  const campaign1 = await prisma.campaign.upsert({
    where: { id: "seed-campaign-001" },
    update: {},
    create: {
      id: "seed-campaign-001",
      brandProfileId: brand.id,
      title: "Berlin Calling — Summer Drop",
      artistName: "DJ Matheus",
      songTitle: "Midnight Resonance",
      songLink: "https://open.spotify.com/track/example",
      description: "Summer techno release targeting European festival crowds. Looking for authentic creator content.",
      genres: ["Techno Melodic/Minimal", "Techno Hard/Peak"],
      platforms: ["INSTAGRAM", "TIKTOK"],
      budgetCents: technoIG && houseIG && priyaTT
        ? (technoIG.pricePerPostCents ?? 0) + (houseIG.pricePerPostCents ?? 0) + (priyaTT.pricePerPostCents ?? 0)
        : 166000,
      deliverables: "Influencer post as selected",
      status: "OPEN",
      selections: technoIG && houseIG && priyaTT ? {
        create: [
          { creatorPlatformId: technoIG.id, agreedPriceCents: technoIG.pricePerPostCents ?? 18000 },
          { creatorPlatformId: houseIG.id, agreedPriceCents: houseIG.pricePerPostCents ?? 28000 },
          { creatorPlatformId: priyaTT.id, agreedPriceCents: priyaTT.pricePerPostCents ?? 120000 },
        ],
      } : undefined,
    },
  });
  console.log(`  ✅ Campaign: ${campaign1.title}`);

  // Campaign 2 — Multi-platform EDM push
  const campaign2 = await prisma.campaign.upsert({
    where: { id: "seed-campaign-002" },
    update: {},
    create: {
      id: "seed-campaign-002",
      brandProfileId: brand.id,
      title: "EDM Worldwide Push",
      artistName: "Electra Pulse",
      songTitle: "Voltage",
      songLink: "https://open.spotify.com/track/example2",
      description: "Cross-platform push for our biggest EDM release of the year. Targeting YouTube, Instagram and TikTok simultaneously.",
      genres: ["EDM", "House Tech House"],
      platforms: ["YOUTUBE", "INSTAGRAM"],
      budgetCents: lenaIG && marcusYT
        ? (lenaIG.pricePerPostCents ?? 0) + (marcusYT.pricePerPostCents ?? 0)
        : 135000,
      deliverables: "Influencer post as selected",
      status: "OPEN",
      selections: lenaIG && marcusYT ? {
        create: [
          { creatorPlatformId: lenaIG.id, agreedPriceCents: lenaIG.pricePerPostCents ?? 60000 },
          { creatorPlatformId: marcusYT.id, agreedPriceCents: marcusYT.pricePerPostCents ?? 75000 },
        ],
      } : undefined,
    },
  });
  console.log(`  ✅ Campaign: ${campaign2.title}`);

  // Campaign 3 — Draft (em progresso)
  const campaign3 = await prisma.campaign.upsert({
    where: { id: "seed-campaign-003" },
    update: {},
    create: {
      id: "seed-campaign-003",
      brandProfileId: brand.id,
      title: "Afro House Series",
      artistName: "Nkosi Beat",
      description: "Looking for afro house specialists to promote new EP across social media.",
      genres: ["House Melodic/Afro"],
      platforms: ["INSTAGRAM", "TIKTOK"],
      budgetCents: 50000,
      deliverables: "1 Post + 1 Story",
      status: "DRAFT",
    },
  });
  console.log(`  ✅ Campaign: ${campaign3.title} (DRAFT)`);

  console.log("\n✨ Seed complete!");
  console.log("\n📋 Summary:");
  console.log(`  - ${FAKE_CREATORS.length} creators with ${FAKE_CREATORS.reduce((s, c) => s + c.platforms.length, 0)} platform profiles`);
  console.log("  - 1 brand (SoundWave Records)");
  console.log("  - 3 campaigns (2 OPEN with selections, 1 DRAFT)");
  console.log("\n🔑 Brand demo account: brand.demo@soundwave.com");
  console.log("   (use Clerk admin to set this email or create a new account on the platform)");
}

main().catch(console.error).finally(() => prisma.$disconnect());
