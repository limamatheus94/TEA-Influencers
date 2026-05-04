"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";

export function PitchForm({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [pitch, setPitch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pitch.trim().length < 20) {
      setError("Your pitch must be at least 20 characters.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/creator/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, pitch: pitch.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to submit application");
      }

      router.push("/creator/applications");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="pitch">Your pitch *</Label>
        <Textarea
          id="pitch"
          rows={6}
          placeholder="Tell us why you're the ideal creator for this campaign. Mention your audience, engagement, genres you cover, and why you believe in this project…"
          value={pitch}
          onChange={(e) => setPitch(e.target.value)}
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-400">{pitch.length}/2000 characters</p>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading || pitch.length < 20} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit application
          </>
        )}
      </Button>
    </form>
  );
}
