"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle, Loader2, Music, ExternalLink } from "lucide-react";

const PLATFORM_OPTIONS = [
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "SPOTIFY", label: "Spotify" },
  { value: "SOUNDCLOUD", label: "SoundCloud" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "PRESS", label: "Press" },
] as const;

const GENRE_OPTIONS = [
  "Techno Melodic/Minimal",
  "Techno Hard/Peak",
  "House Tech House",
  "House Melodic/Afro",
  "EDM",
  "D&B",
  "Bass",
  "Psy/Trance",
  "Dubstep",
  "Pop",
  "Hip-hop",
  "Dance Pop",
];

type Platform = (typeof PLATFORM_OPTIONS)[number]["value"];

type FormData = {
  title: string;
  artistName: string;
  songTitle: string;
  songLink: string;
  description: string;
  platforms: Platform[];
  genres: string[];
  budgetCents: string;
  deliverables: string;
  deadline: string;
  maxApplications: string;
};

const STEPS = ["Campaign", "Music", "Platforms & Genres", "Requirements", "Review"];

const EMPTY: FormData = {
  title: "",
  artistName: "",
  songTitle: "",
  songLink: "",
  description: "",
  platforms: [],
  genres: [],
  budgetCents: "",
  deliverables: "",
  deadline: "",
  maxApplications: "",
};

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#3a51fb] focus:outline-none ${props.className ?? ""}`}
    />
  );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#3a51fb] focus:outline-none resize-none ${props.className ?? ""}`}
    />
  );
}

export function OpenCallForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function togglePlatform(p: Platform) {
    set(
      "platforms",
      data.platforms.includes(p)
        ? data.platforms.filter((x) => x !== p)
        : [...data.platforms, p]
    );
  }

  function toggleGenre(g: string) {
    set(
      "genres",
      data.genres.includes(g) ? data.genres.filter((x) => x !== g) : [...data.genres, g]
    );
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (step === 0) {
      if (!data.title.trim()) e.title = "Required";
      else if (data.title.trim().length < 3) e.title = "At least 3 characters";
      if (!data.description.trim()) e.description = "Required";
      else if (data.description.trim().length < 20) e.description = "At least 20 characters";
    }
    if (step === 1) {
      if (!data.artistName.trim()) e.artistName = "Required";
    }
    if (step === 2) {
      if (data.platforms.length === 0) e.platforms = "Select at least one platform";
      if (data.genres.length === 0) e.genres = "Select at least one genre";
    }
    if (step === 3) {
      if (!data.budgetCents || isNaN(Number(data.budgetCents)) || Number(data.budgetCents) <= 0)
        e.budgetCents = "Enter a valid budget";
      if (!data.deliverables.trim()) e.deliverables = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validate()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function submit() {
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/brand/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title.trim(),
          artistName: data.artistName.trim(),
          songTitle: data.songTitle.trim() || undefined,
          songLink: data.songLink.trim() || undefined,
          description: data.description.trim(),
          platforms: data.platforms,
          genres: data.genres,
          budgetCents: Math.round(Number(data.budgetCents) * 100),
          deliverables: data.deliverables.trim(),
          deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
          maxApplications: data.maxApplications ? Number(data.maxApplications) : undefined,
          campaignType: "OPEN_CALL",
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(typeof json.error === "string" ? json.error : "Failed to create campaign");
      }
      const { campaign } = await res.json();
      router.push(`/brand/campaigns/${campaign.id}`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Unknown error");
      setLoading(false);
    }
  }

  const budgetNum = Number(data.budgetCents);
  const currencySymbol = "€";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/brand/campaigns/new" className="text-xs text-[#3a51fb] hover:underline">
            ← Back
          </Link>
          <p className="text-xs font-bold tracking-widest text-[#3a51fb] uppercase mt-3 mb-1">
            Open Call Campaign
          </p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
            {STEPS[step]}
          </h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  i < step
                    ? "bg-[#3a51fb] text-white"
                    : i === step
                    ? "bg-[#3a51fb]/10 text-[#3a51fb] border-2 border-[#3a51fb]"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? "text-[#3a51fb] font-medium" : "text-gray-400"}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className="h-px w-6 bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm space-y-6">

          {/* Step 0 — Campaign info */}
          {step === 0 && (
            <>
              <Field label="Campaign Title" required error={errors.title}>
                <Input
                  value={data.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Summer Techno Push 2025"
                />
              </Field>
              <Field label="Description" required error={errors.description}>
                <Textarea
                  rows={5}
                  value={data.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Describe what the campaign is about, what kind of influencers you're looking for, and what success looks like…"
                />
              </Field>
            </>
          )}

          {/* Step 1 — Music */}
          {step === 1 && (
            <>
              <Field label="Artist Name" required error={errors.artistName}>
                <Input
                  value={data.artistName}
                  onChange={(e) => set("artistName", e.target.value)}
                  placeholder="e.g. DJ Matheus"
                />
              </Field>
              <Field label="Track / Song Title" error={errors.songTitle}>
                <div className="relative">
                  <Music className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm focus:border-[#3a51fb] focus:outline-none"
                    value={data.songTitle}
                    onChange={(e) => set("songTitle", e.target.value)}
                    placeholder="e.g. Midnight Resonance"
                  />
                </div>
              </Field>
              <Field label="Music Link" error={errors.songLink}>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm focus:border-[#3a51fb] focus:outline-none"
                    value={data.songLink}
                    onChange={(e) => set("songLink", e.target.value)}
                    placeholder="Spotify, SoundCloud, YouTube link…"
                  />
                </div>
              </Field>
            </>
          )}

          {/* Step 2 — Platforms & Genres */}
          {step === 2 && (
            <>
              <Field label="Target Platforms" required error={errors.platforms}>
                <div className="flex flex-wrap gap-2 mt-1">
                  {PLATFORM_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => togglePlatform(value)}
                      className={`rounded-full px-4 py-1.5 text-sm font-bold border-2 transition-colors ${
                        data.platforms.includes(value)
                          ? "bg-[#3a51fb] border-[#3a51fb] text-white"
                          : "bg-white border-gray-200 text-gray-700 hover:border-[#3a51fb]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Music Genres" required error={errors.genres}>
                <div className="flex flex-wrap gap-2 mt-1">
                  {GENRE_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={`rounded-full px-3 py-1 text-xs font-bold border-2 transition-colors ${
                        data.genres.includes(g)
                          ? "bg-[#3a51fb] border-[#3a51fb] text-white"
                          : "bg-white border-gray-200 text-gray-600 hover:border-[#3a51fb]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {/* Step 3 — Requirements */}
          {step === 3 && (
            <>
              <Field label="Budget" required error={errors.budgetCents}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">€</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    className="w-full rounded-xl border border-gray-200 pl-7 pr-4 py-2.5 text-sm focus:border-[#3a51fb] focus:outline-none"
                    value={data.budgetCents}
                    onChange={(e) => set("budgetCents", e.target.value)}
                    placeholder="e.g. 500"
                  />
                </div>
                {budgetNum > 0 && (
                  <p className="text-xs text-gray-400">{currencySymbol}{budgetNum.toFixed(2)} total campaign budget</p>
                )}
              </Field>
              <Field label="What is expected from influencers" required error={errors.deliverables}>
                <Textarea
                  rows={4}
                  value={data.deliverables}
                  onChange={(e) => set("deliverables", e.target.value)}
                  placeholder="e.g. 1 feed post + 2 stories, include the song link in bio for 48h, tag @artistname, screenshot analytics…"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Application Deadline">
                  <Input
                    type="date"
                    value={data.deadline}
                    onChange={(e) => set("deadline", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </Field>
                <Field label="Max Applications">
                  <Input
                    type="number"
                    min="1"
                    value={data.maxApplications}
                    onChange={(e) => set("maxApplications", e.target.value)}
                    placeholder="Unlimited"
                  />
                </Field>
              </div>
            </>
          )}

          {/* Step 4 — Review */}
          {step === 4 && (
            <div className="space-y-4 text-sm">
              {[
                ["Campaign Title", data.title],
                ["Artist", data.artistName],
                ...(data.songTitle ? [["Track", data.songTitle]] : []),
                ...(data.songLink ? [["Music Link", data.songLink]] : []),
                ["Description", data.description],
                ["Platforms", data.platforms.join(", ")],
                ["Genres", data.genres.join(", ")],
                ["Budget", `${currencySymbol}${Number(data.budgetCents).toFixed(2)}`],
                ["Deliverables", data.deliverables],
                ...(data.deadline ? [["Deadline", new Date(data.deadline).toLocaleDateString("en-GB")]] : []),
                ...(data.maxApplications ? [["Max Applications", data.maxApplications]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                  <span className="w-32 flex-shrink-0 font-bold text-gray-400 text-xs uppercase tracking-wide pt-0.5">{label}</span>
                  <span className="text-gray-800">{value || "—"}</span>
                </div>
              ))}

              {submitError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <p className="text-xs text-gray-400 pt-2">
                The campaign will be published as <strong>Open</strong> immediately — influencers can start applying right away.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => (step === 0 ? router.push("/brand/campaigns/new") : setStep((s) => s - 1))}
            className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {step === 0 ? "Cancel" : "Back"}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-1 rounded-xl bg-[#3a51fb] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#2a41eb] transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#3a51fb] px-6 py-2.5 text-sm font-black uppercase tracking-wide text-white hover:bg-[#2a41eb] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing…
                </>
              ) : (
                "Publish Campaign"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
