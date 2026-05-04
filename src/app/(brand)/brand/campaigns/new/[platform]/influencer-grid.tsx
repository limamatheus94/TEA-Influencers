"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, ChevronUp, Search, Users, MapPin } from "lucide-react";
import { ConfirmModal } from "./confirm-modal";

type Influencer = {
  creatorProfileId: string;
  creatorPlatformId: string;
  displayName: string;
  avatarUrl: string | null;
  platform: string;
  handle: string;
  logoUrl: string | null;
  followersCount: number;
  pricePerPostCents: number;
  currency: string;
  profileCategory: string | null;
  genres: string[];
  keyTopics: string[];
  topLocations: { rank: number; country: string; pct: number }[] | null;
};

type Props = {
  influencers: Influencer[];
  allGenres: string[];
  allPlatforms: string[];
  isMulti: boolean;
  platformSlug: string;
  currentGenre: string | null;
  currentCategory: string | null;
  currentQ: string | null;
};

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatPrice(cents: number, currency: string) {
  if (!cents) return "—";
  const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  return `${symbol}${(cents / 100).toFixed(0)}`;
}

function PlatformBadge({ platform }: { platform: string }) {
  const colors: Record<string, string> = {
    INSTAGRAM: "bg-pink-100 text-pink-700",
    TIKTOK: "bg-gray-900 text-white",
    SPOTIFY: "bg-green-100 text-green-700",
    SOUNDCLOUD: "bg-orange-100 text-orange-700",
    YOUTUBE: "bg-red-100 text-red-700",
    FACEBOOK: "bg-blue-100 text-blue-700",
    PRESS: "bg-gray-100 text-gray-700",
  };
  const color = colors[platform] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${color}`}>
      {platform}
    </span>
  );
}

function InfluencerCard({
  influencer,
  selected,
  onToggle,
}: {
  influencer: Influencer;
  selected: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const avatar = influencer.logoUrl ?? influencer.avatarUrl;

  return (
    <div
      className={`rounded-2xl border-2 bg-white transition-all ${
        selected ? "border-[#3a51fb] shadow-md shadow-[#3a51fb]/10" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={influencer.displayName}
                className="h-14 w-14 rounded-full object-cover border-2 border-gray-100"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-[#3a51fb]/10 flex items-center justify-center text-[#3a51fb] font-black text-lg uppercase">
                {influencer.displayName[0]}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-gray-900 truncate">@{influencer.handle}</span>
              <PlatformBadge platform={influencer.platform} />
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">{influencer.displayName}</p>
            {influencer.profileCategory && (
              <span className="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#3a51fb]/10 text-[#3a51fb]">
                {influencer.profileCategory}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-gray-700">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-lg font-black">{formatFollowers(influencer.followersCount)}</span>
            <span className="text-xs text-gray-400 font-medium">followers</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-gray-900">
              {formatPrice(influencer.pricePerPostCents, influencer.currency)}
            </p>
            <p className="text-[10px] text-gray-400 font-medium uppercase">per post</p>
          </div>
        </div>

        {/* Genres preview */}
        {influencer.genres.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {influencer.genres.slice(0, 3).map((g) => (
              <span key={g} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                {g}
              </span>
            ))}
            {influencer.genres.length > 3 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                +{influencer.genres.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Expandable section */}
        {expanded && (
          <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
            {influencer.topLocations && influencer.topLocations.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Top Countries
                </p>
                <div className="space-y-1">
                  {influencer.topLocations.slice(0, 5).map((loc) => (
                    <div key={loc.rank} className="flex items-center gap-2 text-xs">
                      <span className="w-4 text-gray-400 font-bold">#{loc.rank}</span>
                      <span className="flex-1 text-gray-700">{loc.country}</span>
                      <span className="font-bold text-gray-900">{loc.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {influencer.genres.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">All Genres</p>
                <div className="flex flex-wrap gap-1">
                  {influencer.genres.map((g) => (
                    <span key={g} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {influencer.keyTopics.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Key Topics</p>
                <div className="flex flex-wrap gap-1">
                  {influencer.keyTopics.map((t) => (
                    <span key={t} className="rounded-full bg-[#3a51fb]/10 px-2 py-0.5 text-[10px] font-medium text-[#3a51fb]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> See Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> See More
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onToggle}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
              selected
                ? "bg-[#3a51fb] text-white hover:bg-[#2a41eb]"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {selected ? "✓ Selected" : "Select"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function InfluencerGrid({
  influencers,
  allGenres,
  allPlatforms,
  isMulti,
  platformSlug,
  currentGenre,
  currentCategory,
  currentQ,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [selected, setSelected] = useState<Map<string, Influencer>>(new Map());
  const [budget, setBudget] = useState("");
  const [showModal, setShowModal] = useState(false);

  const toggle = useCallback((inf: Influencer) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(inf.creatorPlatformId)) {
        next.delete(inf.creatorPlatformId);
      } else {
        next.set(inf.creatorPlatformId, inf);
      }
      return next;
    });
  }, []);

  function applyFilter(key: string, value: string | null) {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
    startTransition(() => router.push(url.pathname + url.search));
  }

  function calculateBudget() {
    const budgetCents = parseFloat(budget) * 100;
    if (isNaN(budgetCents) || budgetCents <= 0) return;

    const sorted = [...influencers].sort(
      (a, b) => b.followersCount - a.followersCount
    );

    let remaining = budgetCents;
    const autoSelected = new Map<string, Influencer>();
    for (const inf of sorted) {
      if (remaining <= 0) break;
      if (inf.pricePerPostCents <= remaining) {
        autoSelected.set(inf.creatorPlatformId, inf);
        remaining -= inf.pricePerPostCents;
      }
    }
    setSelected(autoSelected);
  }

  const selectedList = [...selected.values()];
  const totalCents = selectedList.reduce((sum, i) => sum + i.pricePerPostCents, 0);
  const dominantCurrency = selectedList[0]?.currency ?? "EUR";
  const currencySymbol = dominantCurrency === "EUR" ? "€" : dominantCurrency === "GBP" ? "£" : "$";

  return (
    <>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar filters */}
        <aside className="w-64 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-6 space-y-8">
          {/* Budget calculator */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Budget</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-500">€</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Amount"
                  className="w-full rounded-lg border border-gray-200 pl-6 pr-2 py-2 text-sm focus:border-[#3a51fb] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={calculateBudget}
                className="rounded-lg bg-[#3a51fb] px-3 py-2 text-xs font-bold text-white hover:bg-[#2a41eb] transition-colors"
              >
                Calc
              </button>
            </div>
          </div>

          {/* Platform filter (only in multi) */}
          {isMulti && allPlatforms.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Platforms</p>
              <div className="space-y-1.5">
                {allPlatforms.map((p) => {
                  const count = influencers.filter((i) => i.platform === p).length;
                  return (
                    <label key={p} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="platform"
                        className="accent-[#3a51fb]"
                        checked={platformSlug === p}
                        onChange={() => applyFilter("platform", p)}
                      />
                      <span className="text-sm text-gray-700 group-hover:text-[#3a51fb] flex-1">{p}</span>
                      <span className="text-xs text-gray-400">{count}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Profile Category */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Profile Category</p>
            <div className="space-y-1.5">
              {["COMMUNITY", "CREATOR"].map((cat) => {
                const count = influencers.filter((i) => i.profileCategory === cat).length;
                return (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      className="accent-[#3a51fb]"
                      checked={currentCategory === cat}
                      onChange={() => applyFilter("category", currentCategory === cat ? null : cat)}
                    />
                    <span className="text-sm text-gray-700 group-hover:text-[#3a51fb] flex-1">{cat}</span>
                    <span className="text-xs text-gray-400">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Genres */}
          {allGenres.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Genres</p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {allGenres.map((g) => {
                  const count = influencers.filter((i) => i.genres.includes(g)).length;
                  return (
                    <label key={g} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="accent-[#3a51fb]"
                        checked={currentGenre === g}
                        onChange={() => applyFilter("genre", currentGenre === g ? null : g)}
                      />
                      <span className="text-sm text-gray-700 group-hover:text-[#3a51fb] flex-1 truncate">{g}</span>
                      <span className="text-xs text-gray-400">{count}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Main grid */}
        <div className="flex-1 overflow-y-auto pb-24 p-6">
          {/* Search bar */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                defaultValue={currentQ ?? ""}
                placeholder="Search by name or handle…"
                className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm focus:border-[#3a51fb] focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyFilter("q", (e.target as HTMLInputElement).value || null);
                  }
                }}
              />
            </div>
            <span className="text-sm text-gray-400">{influencers.length} influencers</span>
          </div>

          {influencers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Users className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No approved influencers yet</p>
              <p className="text-gray-400 text-sm mt-1">Creators need to fill their profile and be approved by admin first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {influencers.map((inf) => (
                <InfluencerCard
                  key={inf.creatorPlatformId}
                  influencer={inf}
                  selected={selected.has(inf.creatorPlatformId)}
                  onToggle={() => toggle(inf)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-64 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {selected.size === 0 ? "No Offer Selected" : `${selected.size} Offer${selected.size > 1 ? "s" : ""} Selected`}
              </p>
              <p className="text-sm text-gray-500">
                {selected.size} network{selected.size !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total</p>
              <p className="text-xl font-black text-gray-900">
                {currencySymbol}{(totalCents / 100).toFixed(0)}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={selected.size === 0}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#3a51fb] px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#2a41eb] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>

      {showModal && (
        <ConfirmModal
          selectedInfluencers={selectedList}
          totalCents={totalCents}
          currency={dominantCurrency}
          platformSlug={platformSlug}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
