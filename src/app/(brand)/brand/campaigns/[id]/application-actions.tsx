"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Loader2, DollarSign } from "lucide-react";

// ─── Approve / Reject (shown while PENDING) ──────────────────────────────────

export function ApplicationActions({
  applicationId,
  campaignId,
}: {
  applicationId: string;
  campaignId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function update(status: "APPROVED" | "REJECTED") {
    setLoading(status === "APPROVED" ? "approve" : "reject");
    try {
      await fetch(`/api/brand/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => update("APPROVED")} disabled={loading !== null}>
        {loading === "approve" ? (
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
        ) : (
          <CheckCircle className="h-3 w-3 mr-1" />
        )}
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => update("REJECTED")}
        disabled={loading !== null}
      >
        {loading === "reject" ? (
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
        ) : (
          <XCircle className="h-3 w-3 mr-1" />
        )}
        Reject
      </Button>
    </div>
  );
}

// ─── Release payment (shown when APPROVED + no payment yet) ──────────────────

export function ReleasePaymentForm({
  applicationId,
  budgetCents,
}: {
  applicationId: string;
  budgetCents: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amountDollars, setAmountDollars] = useState((budgetCents / 100).toFixed(2));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRelease() {
    const amountCents = Math.round(parseFloat(amountDollars) * 100);
    if (!amountCents || amountCents < 100) {
      setError("Minimum amount: $1.00");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/brand/applications/${applicationId}/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to release payment");
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
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        <DollarSign className="h-3 w-3 mr-1" />
        Release payment
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 w-64">
      <Label className="text-xs">Amount to release (USD)</Label>
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-500">$</span>
        <Input
          type="number"
          min="1"
          step="0.01"
          value={amountDollars}
          onChange={(e) => setAmountDollars(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
      <p className="text-xs text-gray-400">
        15% commission deducted · creator receives ${(parseFloat(amountDollars || "0") * 0.85).toFixed(2)}
      </p>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleRelease} disabled={loading} className="flex-1">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
