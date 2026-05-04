"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CampaignStatus } from "@prisma/client";

const statusOptions: { value: CampaignStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "OPEN", label: "Open" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function CampaignStatusActions({
  campaignId,
  currentStatus,
}: {
  campaignId: string;
  currentStatus: CampaignStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as CampaignStatus;
    if (status === currentStatus) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 className="h-3 w-3 animate-spin text-[#3a51fb]" />}
      <select
        defaultValue={currentStatus}
        onChange={handleChange}
        disabled={loading}
        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3a51fb] disabled:opacity-50"
      >
        {statusOptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
