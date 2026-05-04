"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function ApproveButton({ creatorId }: { creatorId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    await fetch(`/api/admin/creators/${creatorId}/approve`, { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  return (
    <Button size="sm" onClick={handle} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
      <span className="ml-1">Approve</span>
    </Button>
  );
}

export function RejectButton({ creatorId }: { creatorId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!reason.trim()) return;
    setLoading(true);
    await fetch(`/api/admin/creators/${creatorId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    router.refresh();
    setLoading(false);
    setOpen(false);
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="border-red-300 text-red-600 hover:bg-red-50">
        <XCircle className="h-3.5 w-3.5 mr-1" />
        Reject
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <Input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Rejection reason…"
        className="text-sm h-8"
        autoFocus
      />
      <Button size="sm" onClick={handle} disabled={loading || !reason.trim()} className="bg-red-600 hover:bg-red-700 text-white shrink-0">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm"}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
    </div>
  );
}
