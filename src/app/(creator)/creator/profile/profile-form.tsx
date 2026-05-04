"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";

type ProfileFormData = {
  id: string;
  displayName: string;
  bio: string;
  location: string;
  genres: string;
  mediaKitUrl: string;
};

export function ProfileForm({ profile }: { profile: ProfileFormData }) {
  const [form, setForm] = useState(profile);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.displayName.trim()) {
      setError("Display name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const genres = form.genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);

      const res = await fetch("/api/creator/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName,
          bio: form.bio || null,
          location: form.location || null,
          genres,
          mediaKitUrl: form.mediaKitUrl || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="displayName">Display name *</Label>
        <Input
          id="displayName"
          name="displayName"
          value={form.displayName}
          onChange={handleChange}
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={3}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Tell us about yourself and your channel..."
        />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={form.location}
          onChange={handleChange}
          className="mt-1"
          placeholder="New York, USA"
        />
      </div>

      <div>
        <Label htmlFor="genres">Music genres</Label>
        <Input
          id="genres"
          name="genres"
          value={form.genres}
          onChange={handleChange}
          className="mt-1"
          placeholder="Pop, Rock, R&B"
        />
        <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
      </div>

      <div>
        <Label htmlFor="mediaKitUrl">Media kit URL</Label>
        <Input
          id="mediaKitUrl"
          name="mediaKitUrl"
          type="url"
          value={form.mediaKitUrl}
          onChange={handleChange}
          className="mt-1"
          placeholder="https://..."
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          Profile updated successfully!
        </div>
      )}

      <Button type="submit" disabled={loading} className="bg-[#3a51fb] hover:bg-[#2a41eb]">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Save profile
      </Button>
    </form>
  );
}
