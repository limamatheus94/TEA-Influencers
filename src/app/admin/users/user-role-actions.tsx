"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { UserRole } from "@prisma/client";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "CREATOR", label: "Creator" },
  { value: "BRAND", label: "Brand" },
  { value: "ADMIN", label: "Admin" },
];

export function UserRoleActions({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: UserRole;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value as UserRole;
    if (role === currentRole) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
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
        defaultValue={currentRole}
        onChange={handleChange}
        disabled={loading}
        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3a51fb] disabled:opacity-50"
      >
        {roleOptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
