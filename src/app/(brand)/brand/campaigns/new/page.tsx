import Link from "next/link";
import { Music, Radio, Newspaper, Disc3, Globe, Share2, Play, Users } from "lucide-react";

const PLATFORMS = [
  {
    id: "MULTI",
    label: "Multi Platforms",
    icon: Globe,
    description: "Run across all platforms",
    featured: true,
    available: true,
  },
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

export default function NewCampaignPlatformPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-bold tracking-widest text-[#3a51fb] uppercase mb-1">
            Service Offered — Influencers Post for Clients
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">
            Create a Campaign
          </h1>
          <p className="mt-2 text-sm text-gray-500">Select the platform for your campaign</p>
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
                  className="col-span-2 sm:col-span-3 flex items-center gap-5 rounded-2xl border-2 border-[#3a51fb] bg-[#3a51fb] p-6 text-white shadow-lg transition hover:bg-[#2a41eb] hover:border-[#2a41eb]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-lg font-black uppercase tracking-wide">{p.label}</p>
                    <p className="text-sm text-white/70">{p.description}</p>
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
