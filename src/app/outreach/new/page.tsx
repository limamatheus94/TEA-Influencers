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
import { Loader2, ChevronLeft } from "lucide-react";

const schema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres").max(100),
  artistName: z.string().min(1, "Obrigatório"),
  songTitle: z.string().min(1, "Obrigatório"),
  songUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  genre: z.string().min(1, "Obrigatório"),
  targetPlatforms: z.array(z.nativeEnum(Platform)).min(1, "Selecione ao menos uma"),
  geoTargets: z.string().optional(),
  description: z.string().max(2000).optional(),
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

export default function NewOutreachCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { targetPlatforms: [] },
  });

  const platforms = watch("targetPlatforms") ?? [];

  function togglePlatform(p: Platform) {
    if (platforms.includes(p)) {
      setValue("targetPlatforms", platforms.filter((x) => x !== p), { shouldValidate: true });
    } else {
      setValue("targetPlatforms", [...platforms, p], { shouldValidate: true });
    }
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/outreach/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          songUrl: data.songUrl || undefined,
          geoTargets: data.geoTargets
            ? data.geoTargets.split(",").map((g) => g.trim()).filter(Boolean)
            : [],
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Erro ao criar campanha");
      }

      const { campaign } = await res.json();
      router.push(`/outreach/${campaign.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/outreach")}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Campanha de Outreach</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure a música e o artista para prospectar criadores</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações da música</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título da campanha *</Label>
              <Input id="title" placeholder="ex: Outreach Hip-Hop Brasil — Maio 2026" {...register("title")} />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="artistName">Artista *</Label>
                <Input id="artistName" placeholder="ex: Djonga" {...register("artistName")} />
                {errors.artistName && <p className="mt-1 text-xs text-red-500">{errors.artistName.message}</p>}
              </div>
              <div>
                <Label htmlFor="songTitle">Música *</Label>
                <Input id="songTitle" placeholder="ex: Heresia" {...register("songTitle")} />
                {errors.songTitle && <p className="mt-1 text-xs text-red-500">{errors.songTitle.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="songUrl">Link da música (Spotify, YouTube…)</Label>
              <Input id="songUrl" type="url" placeholder="https://open.spotify.com/track/…" {...register("songUrl")} />
              {errors.songUrl && <p className="mt-1 text-xs text-red-500">{errors.songUrl.message}</p>}
            </div>

            <div>
              <Label htmlFor="genre">Gênero principal *</Label>
              <Input id="genre" placeholder="ex: hip-hop, afrobeat, samba" {...register("genre")} />
              {errors.genre && <p className="mt-1 text-xs text-red-500">{errors.genre.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Segmentação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Plataformas-alvo *</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => togglePlatform(value)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                      platforms.includes(value)
                        ? "bg-[#3a51fb] border-[#3a51fb] text-white"
                        : "bg-white border-gray-300 text-gray-700 hover:border-[#3a51fb]/50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {errors.targetPlatforms && (
                <p className="mt-1 text-xs text-red-500">{errors.targetPlatforms.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="geoTargets">Regiões geográficas</Label>
              <Input
                id="geoTargets"
                placeholder="ex: Brasil, Portugal, Angola (separados por vírgula)"
                {...register("geoTargets")}
              />
              <p className="mt-1 text-xs text-gray-400">Deixe em branco para sem restrição</p>
            </div>

            <div>
              <Label htmlFor="description">Briefing adicional</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Informações extras para o AI gerar pitches mais precisos…"
                {...register("description")}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando…
              </>
            ) : (
              "Criar campanha"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
