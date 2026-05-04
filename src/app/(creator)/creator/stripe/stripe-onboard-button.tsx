"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";

export function StripeOnboardButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/creator/stripe/onboard", { method: "POST" });
      if (!res.ok) throw new Error("Erro ao iniciar onboarding");
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Aguarde…
          </>
        ) : (
          <>
            <ExternalLink className="mr-2 h-4 w-4" />
            Conectar conta bancária
          </>
        )}
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
