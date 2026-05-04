"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw } from "lucide-react";
import { PaymentStatus } from "@prisma/client";

export function PaymentActions({
  paymentId,
  status,
}: {
  paymentId: string;
  status: PaymentStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status !== "ESCROW" && status !== "RELEASED") {
    return <span className="text-xs text-gray-400">—</span>;
  }

  async function handleRefund() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to refund");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        size="sm"
        variant="outline"
        onClick={handleRefund}
        disabled={loading}
        className="h-7 text-xs"
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
        ) : (
          <RotateCcw className="h-3 w-3 mr-1" />
        )}
        Refund
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
