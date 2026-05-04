"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";

export function ConfigForm({
  config,
}: {
  config: { id: string; commissionRate: number } | null;
}) {
  const [value, setValue] = useState(
    config ? (config.commissionRate * 100).toFixed(1) : "15.0"
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pct = parseFloat(value);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      setError("Enter a value between 0 and 100.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionRate: pct / 100, id: config?.id }),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="commissionRate">New commission rate (%)</Label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            id="commissionRate"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-32"
          />
          <span className="text-sm text-gray-500">%</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Creator receives {(100 - parseFloat(value || "0")).toFixed(1)}% of the released amount
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          Rate updated successfully!
        </div>
      )}

      <Button type="submit" disabled={loading} className="bg-[#3a51fb] hover:bg-[#2a41eb]">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Save settings
      </Button>
    </form>
  );
}
