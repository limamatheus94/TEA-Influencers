import Link from "next/link";
import { Users, Handshake, Music, Radio, Newspaper, Disc3, Globe, Share2, Play } from "lucide-react";

// ─── Mode selector (step 0) ───────────────────────────────────────────────────

const CAMPAIGN_MODES = [
  {
    id: "open-call",
    href: "/brand/campaigns/new/open-call",
    label: "Open Call",
    description:
      "Publish your campaign and let influencers apply with a pitch. You review and pick who to work with.",
    icon: Users,
    tag: "Recommended",
  },
  {
    id: "pick-and-choose",
    href: "/brand/campaigns/new/pick-and-choose",
    label: "Pick & Choose",
    description:
      "Browse our approved influencer roster, select who you want, and create the campaign instantly.",
    icon: Handshake,
    tag: null,
  },
];

// ─── Platform list for Pick & Choose sub-step ────────────────────────────────

const PLATFORMS = [
  { id: "MULTI", label: "Multi Platforms", icon: Globe, featured: true, available: true },
  { id: "INSTAGRAM", label: "Instagram", icon: Share2, available: true },
  { id: "TIKTOK", label: "TikTok", icon: Music, available: true },
  { id: "SPOTIFY", label: "Spotify", icon: Disc3, available: true },
  { id: "SOUNDCLOUD", label: "SoundCloud", icon: Play, available: true },
  { id: "YOUTUBE", label: "YouTube", icon: Play, available: true },
  { id: "FACEBOOK", label: "Facebook", icon: Users, available: true },
  { id: "RADIO", label: "Radio", icon: Radio, available: false, comingSoon: true },
  { id: "PRESS", label: "Press", icon: Newspaper, available: true },
  { id: "CLUB_DJS", label: "Club DJs", icon: Disc3, available: false, comingSoon: true },
] as const;

type SearchParams = Promise<{ mode?: string }>;

export default async function NewCampaignPage({ searchParams }: { searchParams: SearchParams }) {
  const { mode } = await searchParams;

  // Sub-step: platform selector for pick & choose
  if (mode === "pick-and-choose") {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-2">
            <Link
              href="/brand/campaigns/new"
              className="text-xs text-[#3a51fb] hover:underline"
            >
              ← Back to mode selection
            </Link>
          </div>
          <div className="mb-10">
            <p className="text-xs font-bold tracking-widest text-[#3a51fb] uppercase mb-1">
              Pick &amp; Choose
            </p>
            <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">
              Select Platform
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Choose the platform to browse influencers
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {PLATFORMS.map((p) => {
              const Icon = p.icon;
              const isFeatured = "featured" in p && p.featured;
              const isComingSoon = "comingSoon" in p && p.comingSoon;

              if (isFeatured) {
                return (
                  <Link
                    key={p.id}
                    href={`/brand/campaigns/new/${p.id}`}
                    className="col-span-2 sm:col-span-3 flex items-center gap-5 rounded-2xl border-2 border-[#3a51fb] bg-[#3a51fb] p-6 text-white shadow-lg transition hover:bg-[#2a41eb]"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-lg font-black uppercase tracking-wide">{p.label}</p>
                      <p className="text-sm text-white/70">Run across all platforms</p>
                    </div>
                  </Link>
                );
              }

              if (!p.available) {
                return (
                  <div
                    key={p.id}
                    className="relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 opacity-50 cursor-not-allowed"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                      <Icon className="h-6 w-6 text-gray-400" />
                    </div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                      {p.label}
                    </span>
                    {isComingSoon && (
                      <span className="absolute top-3 right-3 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Soon
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={p.id}
                  href={`/brand/campaigns/new/${p.id}`}
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-gray-200 bg-white p-6 transition hover:border-[#3a51fb] hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3a51fb]/10">
                    <Icon className="h-6 w-6 text-[#3a51fb]" />
                  </div>
                  <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    {p.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Default: mode selector
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold tracking-widest text-[#3a51fb] uppercase mb-2">
            New Campaign
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">
            How do you want to find influencers?
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Choose your campaign mode — you can always use both strategies
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CAMPAIGN_MODES.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.id}
                href={m.id === "pick-and-choose" ? "/brand/campaigns/new?mode=pick-and-choose" : m.href}
                className="group relative flex flex-col gap-5 rounded-2xl border-2 border-gray-200 bg-white p-7 transition hover:border-[#3a51fb] hover:shadow-lg"
              >
                {m.tag && (
                  <span className="absolute top-4 right-4 rounded-full bg-[#3a51fb] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    {m.tag}
                  </span>
                )}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3a51fb]/10 group-hover:bg-[#3a51fb]/20 transition-colors">
                  <Icon className="h-7 w-7 text-[#3a51fb]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900 mb-2">{m.label}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">{m.description}</p>
                </div>
                <div className="mt-auto pt-2 text-xs font-bold text-[#3a51fb] uppercase tracking-wide group-hover:underline">
                  Select →
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
