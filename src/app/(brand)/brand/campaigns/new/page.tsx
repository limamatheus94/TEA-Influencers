"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Platform } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from "lucide-react";

const schema = z.object({
  title: z.string().min(3, "At least 3 characters").max(100),
  description: z.string().min(10, "At least 10 characters").max(2000),
  genres: z.string().min(1, "Enter at least one genre"),
  platforms: z.array(z.nativeEnum(Platform)).min(1, "Select at least one platform"),
  budgetCents: z.number().int().min(1000, "Minimum $10.00"),
  deliverables: z.string().min(5, "Describe the expected deliverables"),
  deadline: z.string().optional(),
  maxApplications: z.number().int().positive().optional(),
});

type FormData = z.infer<typeof schema>;

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "SPOTIFY", label: "Spotify" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "APPLE_MUSIC", label: "Apple Music" },
  { value: "SOUNDCLOUD", label: "SoundCloud" },
];

const STEPS = ["Basic Info", "Platforms & Genres", "Budget & Deadline", "Review & Pay"];

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { platforms: [] },
  });

  const platforms = watch("platforms") ?? [];

  function togglePlatform(p: Platform) {
    const current = platforms;
    if (current.includes(p)) {
      setValue("platforms", current.filter((x) => x !== p), { shouldValidate: true });
    } else {
      setValue("platforms", [...current, p], { shouldValidate: true });
    }
  }

  async function nextStep() {
    const fieldsPerStep: (keyof FormData)[][] = [
      ["title", "description"],
      ["genres", "platforms"],
      ["budgetCents", "deliverables", "deadline", "maxApplications"],
      [],
    ];
    const ok = await trigger(fieldsPerStep[step]);
    if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/brand/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          genres: data.genres.split(",").map((g) => g.trim()).filter(Boolean),
          budgetCents: Number(data.budgetCents),
          maxApplications: data.maxApplications ? Number(data.maxApplications) : undefined,
          deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
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
    } finally {
      setLoading(false);
    }
  }

  const budgetValue = watch("budgetCents");

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Campaign</h1>
        <p className="text-sm text-gray-500 mt-1">Step {step + 1} of {STEPS.length}</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Step 0 — Basic Info */}
            {step === 0 && (
              <>
                <div>
                  <Label htmlFor="title">Campaign title *</Label>
                  <Input id="title" placeholder="e.g. Hip-Hop playlist feature" {...register("title")} />
                  {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    placeholder="Describe the campaign, the artist, and what you're looking for…"
                    {...register("description")}
                  />
                  {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
                </div>
              </>
            )}

            {/* Step 1 — Platforms & Genres */}
            {step === 1 && (
              <>
                <div>
                  <Label>Platforms *</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PLATFORM_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => togglePlatform(value)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                          platforms.includes(value)
                            ? "bg-[#3a51fb] border-[#3a51fb] text-white"
                            : "bg-white border-gray-300 text-gray-700 hover:border-[#3a51fb]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {errors.platforms && <p className="mt-1 text-xs text-red-500">{errors.platforms.message}</p>}
                </div>
                <div>
                  <Label htmlFor="genres">Music genres *</Label>
                  <Input
                    id="genres"
                    placeholder="e.g. hip-hop, r&b, trap (comma-separated)"
                    {...register("genres")}
                  />
                  {errors.genres && <p className="mt-1 text-xs text-red-500">{errors.genres.message}</p>}
                </div>
              </>
            )}

            {/* Step 2 — Budget & Deadline */}
            {step === 2 && (
              <>
                <div>
                  <Label htmlFor="budgetCents">Total budget (in cents) *</Label>
                  <Input
                    id="budgetCents"
                    type="number"
                    min={1000}
                    placeholder="e.g. 50000 = $500.00"
                    {...register("budgetCents", { valueAsNumber: true })}
                  />
                  {budgetValue > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      = ${(budgetValue / 100).toFixed(2)} USD
                    </p>
                  )}
                  {errors.budgetCents && <p className="mt-1 text-xs text-red-500">{errors.budgetCents.message}</p>}
                </div>
                <div>
                  <Label htmlFor="deliverables">Expected deliverables *</Label>
                  <Textarea
                    id="deliverables"
                    rows={3}
                    placeholder="e.g. 1 playlist feature with min. 5k followers, analytics screenshot…"
                    {...register("deliverables")}
                  />
                  {errors.deliverables && <p className="mt-1 text-xs text-red-500">{errors.deliverables.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input id="deadline" type="date" {...register("deadline")} />
                  </div>
                  <div>
                    <Label htmlFor="maxApplications">Max applications</Label>
                    <Input
                      id="maxApplications"
                      type="number"
                      min={1}
                      placeholder="Unlimited"
                      {...register("maxApplications", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3 — Review */}
            {step === 3 && (
              <div className="space-y-4 text-sm">
                <ReviewRow label="Title" value={watch("title")} />
                <ReviewRow label="Platforms" value={platforms.join(", ")} />
                <ReviewRow label="Genres" value={watch("genres")} />
                <ReviewRow
                  label="Budget"
                  value={`$${(Number(watch("budgetCents")) / 100).toFixed(2)} USD`}
                />
                <ReviewRow label="Deliverables" value={watch("deliverables")} />
                {watch("deadline") && (
                  <ReviewRow
                    label="Deadline"
                    value={new Date(watch("deadline")!).toLocaleDateString("en-US")}
                  />
                )}
                {error && (
                  <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
                    {error}
                  </p>
                )}
                <p className="text-gray-500 text-xs">
                  By confirming, a Stripe PaymentIntent will be created in escrow mode (test). Funds are only captured after you approve deliverables.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => (step === 0 ? router.push("/brand") : setStep((s) => s - 1))}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={nextStep}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create campaign"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="w-28 flex-shrink-0 font-medium text-gray-500">{label}</span>
      <span className="text-gray-900">{value || "—"}</span>
    </div>
  );
}
