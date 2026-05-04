"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";

const schema = z.object({
  outreachCampaignId: z.string().min(1, "Selecione uma campanha"),
  source: z.enum(["SPOTIFY", "YOUTUBE"]),
  query: z.string().min(2, "Informe a query de busca"),
  genre: z.string().min(1, "Informe o gênero"),
});

type FormData = z.infer<typeof schema>;

interface Campaign {
  id: string;
  title: string;
  genre: string;
  targetPlatforms: string[];
}

interface ScrapeFormProps {
  campaigns: Campaign[];
  defaultCampaignId?: string;
}

export function ScrapeForm({ campaigns, defaultCampaignId }: ScrapeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      outreachCampaignId: defaultCampaignId ?? "",
      source: "SPOTIFY",
      genre: "",
    },
  });

  const selectedCampaignId = watch("outreachCampaignId");
  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  function onCampaignChange(id: string) {
    setValue("outreachCampaignId", id, { shouldValidate: true });
    const c = campaigns.find((x) => x.id === id);
    if (c) setValue("genre", c.genre, { shouldValidate: true });
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/discovery/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Erro ao disparar scraping");
      }

      const { job } = await res.json();
      setSuccess(`Job criado (ID: ${job.id.slice(0, 8)}…). O scraping está em execução.`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Search className="h-4 w-4 text-[#3a51fb]" />
          Novo Job de Scraping
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="campaign">Campanha *</Label>
            <select
              id="campaign"
              value={selectedCampaignId}
              onChange={(e) => onCampaignChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Selecione…</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            {errors.outreachCampaignId && (
              <p className="mt-1 text-xs text-red-500">{errors.outreachCampaignId.message}</p>
            )}
          </div>

          <div>
            <Label>Fonte *</Label>
            <div className="mt-1 flex gap-2">
              {(["SPOTIFY", "YOUTUBE"] as const).map((src) => {
                const isSelected = watch("source") === src;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setValue("source", src, { shouldValidate: true })}
                    className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-[#3a51fb] border-[#3a51fb] text-white"
                        : "bg-white border-gray-300 text-gray-700 hover:border-[#3a51fb]/50"
                    }`}
                  >
                    {src === "SPOTIFY" ? "🎵 Spotify" : "▶️ YouTube"}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="query">Query de busca *</Label>
            <Input
              id="query"
              placeholder={
                watch("source") === "SPOTIFY"
                  ? "ex: hip-hop brasil playlists"
                  : "ex: hip-hop brasileiro canal"
              }
              {...register("query")}
            />
            {errors.query && <p className="mt-1 text-xs text-red-500">{errors.query.message}</p>}
            {selectedCampaign && (
              <p className="mt-1 text-xs text-gray-400">
                Plataformas-alvo: {selectedCampaign.targetPlatforms.join(", ")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="genre">Gênero *</Label>
            <Input id="genre" placeholder="ex: hip-hop" {...register("genre")} />
            {errors.genre && <p className="mt-1 text-xs text-red-500">{errors.genre.message}</p>}
          </div>

          {error && (
            <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-red-700 text-xs">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-green-700 text-xs">
              {success}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disparando…
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Iniciar Scraping
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
