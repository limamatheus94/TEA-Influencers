"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OutreachStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, Mail, Send, UserPlus } from "lucide-react";

interface ContactActionsProps {
  contactId: string;
  status: OutreachStatus;
  hasEmail: boolean;
  hasPitch: boolean;
}

export function ContactActions({ contactId, status, hasEmail, hasPitch }: ContactActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(action: "score" | "pitch" | "invite") {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/outreach/contacts/${contactId}/${action}`, { method: "POST" });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? `Erro ao ${action}`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(null);
    }
  }

  const canScore = status === "PENDING";
  const canPitch = status === "SCORED" || (status === "PENDING" && !hasPitch);
  const canSendEmail = hasPitch && hasEmail && !["SENT", "OPENED", "RESPONDED", "INVITED", "REGISTERED"].includes(status);
  const canInvite = ["RESPONDED"].includes(status);

  return (
    <div className="flex items-center gap-1.5">
      {canScore && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => call("score")}
          disabled={!!loading}
          title="Calcular fit score com AI"
        >
          {loading === "score" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
        </Button>
      )}

      {canPitch && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => call("pitch")}
          disabled={!!loading}
          title="Gerar cold email com AI"
        >
          {loading === "pitch" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
        </Button>
      )}

      {canSendEmail && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => call("invite")}
          disabled={!!loading}
          title="Enviar email via Brevo"
        >
          {loading === "invite" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </Button>
      )}

      {canInvite && (
        <Button
          size="sm"
          onClick={() => call("invite")}
          disabled={!!loading}
          title="Enviar convite de cadastro"
        >
          {loading === "invite" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
        </Button>
      )}

      {error && <span className="text-xs text-red-500 max-w-[120px] truncate" title={error}>{error}</span>}
    </div>
  );
}
