"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Platform } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UploadCloud, ChevronDown, ChevronUp } from "lucide-react";

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "SPOTIFY", label: "Spotify" },
  { value: "SOUNDCLOUD", label: "SoundCloud" },
  { value: "APPLE_MUSIC", label: "Apple Music" },
];

export function DeliveryForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [platform, setPlatform] = useState<Platform>("INSTAGRAM");
  const [url, setUrl] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [storyTag, setStoryTag] = useState("");
  const [storyLink, setStoryLink] = useState("");
  const [impressions, setImpressions] = useState("");
  const [likes, setLikes] = useState("");
  const [followersCount, setFollowersCount] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/creator/applications/${applicationId}/deliveries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          url,
          screenshotUrl: screenshotUrl || undefined,
          postDescription: postDescription || undefined,
          storyTag: storyTag || undefined,
          storyLink: storyLink || undefined,
          impressions: impressions ? parseInt(impressions) : undefined,
          likes: likes ? parseInt(likes) : undefined,
          followersCount: followersCount ? parseInt(followersCount) : undefined,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to submit delivery");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-1.5 text-[#3a51fb] border-[#3a51fb]">
        <UploadCloud className="h-3.5 w-3.5" />
        Submit delivery
        <ChevronDown className="h-3.5 w-3.5" />
      </Button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-[#3a51fb]/20 bg-[#3a51fb]/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[#3a51fb]">Submit your delivery</p>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label className="text-xs">Platform *</Label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3a51fb]"
          >
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-xs">Post URL *</Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.instagram.com/p/..."
            className="mt-1 text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Impressions</Label>
            <Input
              type="number"
              min={0}
              value={impressions}
              onChange={(e) => setImpressions(e.target.value)}
              placeholder="e.g. 4420"
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Likes</Label>
            <Input
              type="number"
              min={0}
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
              placeholder="e.g. 34"
              className="mt-1 text-sm"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs">Your followers count (at time of post)</Label>
          <Input
            type="number"
            min={0}
            value={followersCount}
            onChange={(e) => setFollowersCount(e.target.value)}
            placeholder="e.g. 262600"
            className="mt-1 text-sm"
          />
        </div>

        <div>
          <Label className="text-xs">Post description (caption used)</Label>
          <Textarea
            value={postDescription}
            onChange={(e) => setPostDescription(e.target.value)}
            rows={2}
            placeholder="YES! Artist unleashes the..."
            className="mt-1 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Story tag (@handle)</Label>
            <Input
              value={storyTag}
              onChange={(e) => setStoryTag(e.target.value)}
              placeholder="@artist"
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Story link (swipe-up URL)</Label>
            <Input
              value={storyLink}
              onChange={(e) => setStoryLink(e.target.value)}
              placeholder="https://fanlink.tv/..."
              className="mt-1 text-sm"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs">Screenshot URL</Label>
          <Input
            value={screenshotUrl}
            onChange={(e) => setScreenshotUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 text-sm"
          />
        </div>

        <div>
          <Label className="text-xs">Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Any additional information..."
            className="mt-1 text-sm"
          />
        </div>

        {error && (
          <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</p>
        )}

        <Button type="submit" size="sm" disabled={loading} className="w-full">
          {loading ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Submitting…</> : "Submit delivery"}
        </Button>
      </form>
    </div>
  );
}
