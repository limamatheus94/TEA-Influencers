"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, MapPin, Music, Tag, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Platform } from "@prisma/client";

const PLATFORM_LABELS: Record<Platform, string> = {
  SPOTIFY: "Spotify",
  YOUTUBE: "YouTube",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  APPLE_MUSIC: "Apple Music",
  SOUNDCLOUD: "SoundCloud",
  FACEBOOK: "Facebook",
  PRESS: "Press",
  OTHER: "Other",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  SPOTIFY: "bg-green-100 text-green-800",
  YOUTUBE: "bg-red-100 text-red-800",
  INSTAGRAM: "bg-pink-100 text-pink-800",
  TIKTOK: "bg-slate-100 text-slate-800",
  APPLE_MUSIC: "bg-rose-100 text-rose-800",
  SOUNDCLOUD: "bg-orange-100 text-orange-800",
  FACEBOOK: "bg-blue-100 text-blue-800",
  PRESS: "bg-amber-100 text-amber-800",
  OTHER: "bg-gray-100 text-gray-800",
};

interface TopLocation {
  rank: number;
  country: string;
  pct: number;
}

interface CreatorPlatformData {
  id: string;
  platform: Platform;
  handle: string;
  url: string;
  followersCount: number | null;
  subscribersCount: number | null;
  profileCategory: string | null;
  genres: string[];
  keyTopics: string[];
  topLocations: unknown;
  pricePerPostCents: number | null;
  currency: string;
  logoUrl: string | null;
}

interface CreatorProfileData {
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  genres: string[];
  mediaKitUrl: string | null;
  approvalStatus: string;
  platforms: CreatorPlatformData[];
  user: { email: string };
}

function parseLocations(raw: unknown): TopLocation[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.filter(
    (r): r is TopLocation =>
      typeof r === "object" && r !== null && "country" in r && "pct" in r
  );
}

function formatFollowers(n: number | null): string {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function PlatformCard({ p }: { p: CreatorPlatformData }) {
  const locations = parseLocations(p.topLocations);
  const followers = p.followersCount ?? p.subscribersCount;
  const colorClass = PLATFORM_COLORS[p.platform];

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
            {PLATFORM_LABELS[p.platform]}
          </span>
          {p.profileCategory && (
            <span className="text-xs text-gray-400 capitalize">{p.profileCategory.toLowerCase()}</span>
          )}
        </div>
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[#3a51fb] hover:underline"
        >
          @{p.handle}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm">
        <div>
          <span className="text-xs text-gray-400 block">Followers</span>
          <span className="font-semibold text-gray-900">{formatFollowers(followers)}</span>
        </div>
        {p.pricePerPostCents && (
          <div>
            <span className="text-xs text-gray-400 block">Price / post</span>
            <span className="font-semibold text-gray-900">
              {(p.pricePerPostCents / 100).toLocaleString("en-US", {
                style: "currency",
                currency: p.currency || "EUR",
                minimumFractionDigits: 0,
              })}
            </span>
          </div>
        )}
      </div>

      {/* Audience locations */}
      {locations.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-2">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">Audience by country</span>
          </div>
          <div className="space-y-1.5">
            {locations.slice(0, 5).map((loc) => (
              <div key={loc.country} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-24 truncate">{loc.country}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-[#3a51fb] h-1.5 rounded-full"
                    style={{ width: `${Math.min(loc.pct, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">{loc.pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Genres */}
      {p.genres.length > 0 && (
        <div className="flex items-start gap-1 flex-wrap">
          <Music className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
          {p.genres.map((g) => (
            <span key={g} className="text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-600">
              {g}
            </span>
          ))}
        </div>
      )}

      {/* Key topics */}
      {p.keyTopics.length > 0 && (
        <div className="flex items-start gap-1 flex-wrap">
          <Tag className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
          {p.keyTopics.map((t) => (
            <span key={t} className="text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-600">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function CreatorProfilePanel({ creator }: { creator: CreatorProfileData }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-xs text-[#3a51fb] hover:underline font-medium"
      >
        {open ? (
          <>
            <ChevronUp className="h-3.5 w-3.5" /> Hide profile
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5" /> View full profile
          </>
        )}
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-[#3a51fb]/15 bg-[#3a51fb]/[0.02] p-4 space-y-4">
          {/* Creator header */}
          <div className="flex items-start gap-3">
            {creator.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={creator.avatarUrl}
                alt={creator.displayName}
                className="h-12 w-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-[#3a51fb]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#3a51fb] font-bold text-lg">
                  {creator.displayName[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{creator.displayName}</span>
                {creator.approvalStatus === "APPROVED" && (
                  <Badge variant="success" className="text-[10px] py-0">Verified</Badge>
                )}
              </div>
              {creator.location && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{creator.location}</span>
                </div>
              )}
              {creator.bio && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-3">{creator.bio}</p>
              )}
              {creator.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {creator.genres.map((g) => (
                    <Badge key={g} variant="secondary" className="text-[10px] py-0">{g}</Badge>
                  ))}
                </div>
              )}
              {creator.mediaKitUrl && (
                <a
                  href={creator.mediaKitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#3a51fb] hover:underline mt-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  Media Kit
                </a>
              )}
            </div>
          </div>

          {/* Platform profiles */}
          {creator.platforms.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Platform profiles ({creator.platforms.length})
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {creator.platforms.map((p) => (
                  <PlatformCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
