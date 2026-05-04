"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Platform } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Plus, Trash2 } from "lucide-react";

// ─── config per platform ──────────────────────────────────────────────────────

const PLATFORM_CONFIG: Record<string, {
  label: string;
  accountLabel: string;
  linkLabel: string;
  priceLabel: string;
  hasProfileCategory: boolean;
  hasTopLocations: boolean;
  hasKeyTopics: boolean;
  extraGenres: string[];
}> = {
  INSTAGRAM: {
    label: "Instagram", accountLabel: "Instagram account name", linkLabel: "Instagram link",
    priceLabel: "Price for 1 Post & Story", hasProfileCategory: true, hasTopLocations: true, hasKeyTopics: true,
    extraGenres: ["Pop", "Hip-hop"],
  },
  TIKTOK: {
    label: "TikTok", accountLabel: "TikTok account name", linkLabel: "TikTok link",
    priceLabel: "Price for 1 TikTok Post & Story", hasProfileCategory: true, hasTopLocations: true, hasKeyTopics: false,
    extraGenres: [],
  },
  SPOTIFY: {
    label: "Spotify", accountLabel: "Spotify playlist name", linkLabel: "Spotify playlist link",
    priceLabel: "Price for 1 Spotify Feedback+", hasProfileCategory: false, hasTopLocations: false, hasKeyTopics: false,
    extraGenres: ["Dance Pop", "Garage"],
  },
  SOUNDCLOUD: {
    label: "SoundCloud", accountLabel: "SoundCloud account name", linkLabel: "SoundCloud link",
    priceLabel: "Price for 1 Post", hasProfileCategory: false, hasTopLocations: true, hasKeyTopics: false,
    extraGenres: [],
  },
  YOUTUBE: {
    label: "YouTube", accountLabel: "YouTube account name", linkLabel: "YouTube link",
    priceLabel: "Price for 1 YouTube Post", hasProfileCategory: true, hasTopLocations: true, hasKeyTopics: true,
    extraGenres: [],
  },
  OTHER: {
    label: "Press / Other", accountLabel: "Brand account name", linkLabel: "Website link",
    priceLabel: "Price for 1 Article", hasProfileCategory: false, hasTopLocations: true, hasKeyTopics: false,
    extraGenres: [],
  },
};

const BASE_GENRES = [
  "Techno (Melodic, Minimal)", "Techno (Hard, Peak)", "House (Tech House)",
  "House (Melodic, Afro)", "EDM", "D&B", "Bass", "Psy, Trance", "Dubstep",
];

const KEY_TOPICS = ["Ibiza", "Dancing", "Meme"];

const LOCATION_PCT = ["19.4", "9.4", "4.4", "3.4", "1.4"];

const SUPPORTED_PLATFORMS = ["INSTAGRAM", "TIKTOK", "SPOTIFY", "SOUNDCLOUD", "YOUTUBE", "OTHER"] as const;

type TopLocation = { rank: number; country: string; pct: number };

type ExistingPlatform = {
  platform: Platform;
  handle: string;
  url: string;
  followersCount: number | null;
  logoUrl: string | null;
  profileCategory: string | null;
  genres: string[];
  keyTopics: string[];
  topLocations: TopLocation[] | null;
  pricePerPostCents: number | null;
  currency: string;
};

function emptyLocations(): TopLocation[] {
  return LOCATION_PCT.map((pct, i) => ({ rank: i + 1, country: "", pct: parseFloat(pct) }));
}

function PlatformTab({
  platformKey,
  existing,
  onSaved,
}: {
  platformKey: string;
  existing?: ExistingPlatform;
  onSaved: () => void;
}) {
  const cfg = PLATFORM_CONFIG[platformKey];
  const allGenres = [...BASE_GENRES, ...cfg.extraGenres];

  const [handle, setHandle] = useState(existing?.handle ?? "");
  const [url, setUrl] = useState(existing?.url ?? "");
  const [followers, setFollowers] = useState(existing?.followersCount?.toString() ?? "");
  const [logoUrl, setLogoUrl] = useState(existing?.logoUrl ?? "");
  const [profileCategory, setProfileCategory] = useState<"COMMUNITY" | "CREATOR">(
    (existing?.profileCategory as "COMMUNITY" | "CREATOR") ?? "COMMUNITY"
  );
  const [genres, setGenres] = useState<string[]>(existing?.genres ?? []);
  const [keyTopics, setKeyTopics] = useState<string[]>(existing?.keyTopics ?? []);
  const [locations, setLocations] = useState<TopLocation[]>(
    existing?.topLocations ?? emptyLocations()
  );
  const [price, setPrice] = useState(existing?.pricePerPostCents ? (existing.pricePerPostCents / 100).toString() : "");
  const [currency, setCurrency] = useState(existing?.currency ?? "EUR");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleGenre(g: string) {
    setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  }
  function toggleTopic(t: string) {
    setKeyTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }
  function setLocationCountry(rank: number, country: string) {
    setLocations((prev) => prev.map((l) => l.rank === rank ? { ...l, country } : l));
  }
  function setLocationPct(rank: number, pct: string) {
    setLocations((prev) => prev.map((l) => l.rank === rank ? { ...l, pct: parseFloat(pct) || 0 } : l));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!handle || !url) { setError("Account name and link are required."); return; }
    setLoading(true); setError(null); setSuccess(false);
    try {
      const res = await fetch("/api/creator/platforms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: platformKey,
          handle,
          url,
          followersCount: followers ? parseInt(followers) : undefined,
          logoUrl: logoUrl || undefined,
          profileCategory: cfg.hasProfileCategory ? profileCategory : undefined,
          genres,
          keyTopics: cfg.hasKeyTopics ? keyTopics : [],
          topLocations: cfg.hasTopLocations ? locations.filter((l) => l.country.trim()) : [],
          pricePerPostCents: price ? Math.round(parseFloat(price) * 100) : undefined,
          currency,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save");
      setSuccess(true);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {/* Basic fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">{cfg.accountLabel} *</Label>
          <Input value={handle} onChange={(e) => setHandle(e.target.value)} className="mt-1" required />
        </div>
        <div>
          <Label className="text-xs">{cfg.linkLabel} *</Label>
          <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="mt-1" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Followers Number</Label>
          <Input type="number" min={0} value={followers} onChange={(e) => setFollowers(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">Logo URL</Label>
          <Input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="mt-1" />
        </div>
      </div>

      {/* Profile category toggle */}
      {cfg.hasProfileCategory && (
        <div>
          <Label className="text-xs block mb-2">What's your profile category</Label>
          <div className="flex rounded-full border border-[#3a51fb] overflow-hidden w-fit">
            {(["COMMUNITY", "CREATOR"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setProfileCategory(cat)}
                className={`px-8 py-2 text-sm font-bold tracking-wide transition-colors ${
                  profileCategory === cat
                    ? "bg-[#3a51fb] text-white"
                    : "bg-white text-[#3a51fb]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Music genres + top locations side by side */}
      <div className={`grid gap-6 ${cfg.hasTopLocations ? "grid-cols-2" : "grid-cols-1"}`}>
        <div>
          <p className="text-sm font-bold text-[#3a51fb] uppercase tracking-wide mb-1">Music Genres</p>
          <p className="text-xs text-gray-500 mb-3">Select ALL the applicable</p>
          <div className="space-y-2">
            {allGenres.map((g) => (
              <label key={g} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={genres.includes(g)}
                  onChange={() => toggleGenre(g)}
                  className="h-4 w-4 rounded border-gray-300 text-[#3a51fb] focus:ring-[#3a51fb]"
                />
                <span className="text-sm text-gray-700">{g}</span>
              </label>
            ))}
          </div>
        </div>

        {cfg.hasTopLocations && (
          <div>
            <p className="text-sm font-bold text-[#3a51fb] uppercase tracking-wide mb-1">Top Locations</p>
            <p className="text-xs text-gray-500 mb-3">Enter the top 5 Countries, and their percentage</p>
            <div className="space-y-2">
              {locations.map((loc) => (
                <div key={loc.rank} className="flex items-center gap-2">
                  <span className="text-[#3a51fb] font-bold text-sm w-6">#{loc.rank}</span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={loc.pct}
                    onChange={(e) => setLocationPct(loc.rank, e.target.value)}
                    className="w-20 text-sm text-center"
                  />
                  <Input
                    value={loc.country}
                    onChange={(e) => setLocationCountry(loc.rank, e.target.value)}
                    placeholder="Find Country"
                    className="flex-1 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Key topics */}
      {cfg.hasKeyTopics && (
        <div>
          <p className="text-sm font-bold text-[#3a51fb] uppercase tracking-wide mb-1">Key Topics</p>
          <p className="text-xs text-gray-500 mb-3">Select THIS if the main core theme of the page</p>
          <div className="space-y-2">
            {KEY_TOPICS.map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keyTopics.includes(t)}
                  onChange={() => toggleTopic(t)}
                  className="h-4 w-4 rounded border-gray-300 text-[#3a51fb] focus:ring-[#3a51fb]"
                />
                <span className="text-sm text-gray-700">{t}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div>
        <Label className="text-xs">{cfg.priceLabel}, include your currency *</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="number"
            min={0}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="100"
            className="flex-1"
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {["EUR", "USD", "GBP", "BRL"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {error && <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          Saved! Your profile is pending admin approval.
        </div>
      )}

      <Button type="submit" disabled={loading} className="bg-[#3a51fb] hover:bg-[#2a41eb] w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Save {cfg.label} profile
      </Button>
    </form>
  );
}

export function PlatformProfileSection({ existingPlatforms }: { existingPlatforms: ExistingPlatform[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<typeof SUPPORTED_PLATFORMS[number]>(SUPPORTED_PLATFORMS[0]);

  const existingMap = Object.fromEntries(existingPlatforms.map((p) => [p.platform, p]));

  return (
    <div>
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 mb-0">
        {SUPPORTED_PLATFORMS.map((p) => {
          const cfg = PLATFORM_CONFIG[p];
          const hasData = !!existingMap[p];
          return (
            <button
              key={p}
              onClick={() => setActiveTab(p)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === p
                  ? "border-[#3a51fb] text-[#3a51fb]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {cfg.label}
              {hasData && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
            </button>
          );
        })}
      </div>

      <PlatformTab
        key={activeTab}
        platformKey={activeTab}
        existing={existingMap[activeTab] as ExistingPlatform | undefined}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
