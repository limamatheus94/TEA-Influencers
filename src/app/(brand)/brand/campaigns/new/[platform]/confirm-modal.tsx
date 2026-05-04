"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Music, ExternalLink } from "lucide-react";

type Influencer = {
  creatorPlatformId: string;
  displayName: string;
  handle: string;
  platform: string;
  pricePerPostCents: number;
  currency: string;
  followersCount: number;
};

type Props = {
  selectedInfluencers: Influencer[];
  totalCents: number;
  currency: string;
  platformSlug: string;
  onClose: () => void;
};

function formatPrice(cents: number, currency: string) {
  const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  return `${symbol}${(cents / 100).toFixed(0)}`;
}

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function ConfirmModal({ selectedInfluencers, totalCents, currency, platformSlug, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [songLink, setSongLink] = useState("");
  const [description, setDescription] = useState("");

  async function handleCreate() {
    if (!title.trim() || !artistName.trim()) {
      setError("Campaign title and artist name are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/brand/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          artistName: artistName.trim(),
          songTitle: songTitle.trim() || undefined,
          songLink: songLink.trim() || undefined,
          description: description.trim() || `Campaign for ${artistName.trim()}`,
          platformSlug,
          selectedPlatformIds: selectedInfluencers.map((i) => i.creatorPlatformId),
          totalCents,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to create campaign");
      }

      const { campaign } = await res.json();
      router.push(`/brand/campaigns/${campaign.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#3a51fb]">
              Almost there
            </p>
            <h2 className="text-xl font-black text-gray-900">Campaign Details</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Campaign fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Campaign Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Summer Techno Push"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#3a51fb] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Artist Name *
              </label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="e.g. DJ Matheus"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#3a51fb] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Song / Track Title
                </label>
                <input
                  type="text"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="e.g. Midnight Groove"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#3a51fb] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Music Link
                </label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="url"
                    value={songLink}
                    onChange={(e) => setSongLink(e.target.value)}
                    placeholder="https://…"
                    className="w-full rounded-xl border border-gray-200 pl-8 pr-4 py-2.5 text-sm focus:border-[#3a51fb] focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Additional notes for the influencers…"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#3a51fb] focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Selected influencers summary */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
              <Music className="h-3.5 w-3.5" /> Selected Influencers ({selectedInfluencers.length})
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedInfluencers.map((inf) => (
                <div key={inf.creatorPlatformId} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-bold text-gray-900">@{inf.handle}</span>
                    <span className="ml-2 text-[10px] font-bold uppercase text-gray-400 bg-gray-200 rounded px-1.5 py-0.5">
                      {inf.platform}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-gray-900">{formatPrice(inf.pricePerPostCents, inf.currency)}</span>
                    <span className="ml-1 text-xs text-gray-400">{formatFollowers(inf.followersCount)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Total</span>
              <span className="text-xl font-black text-gray-900">
                {formatPrice(totalCents, currency)}
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 rounded-xl bg-[#3a51fb] px-4 py-2.5 text-sm font-black uppercase tracking-wide text-white hover:bg-[#2a41eb] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create Campaign"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
