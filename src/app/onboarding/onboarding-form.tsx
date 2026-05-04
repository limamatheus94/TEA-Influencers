"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const roles = [
  {
    value: "CREATOR",
    label: "Creator / Curator",
    description: "I own playlists or channels and want to be paid to feature music.",
  },
  {
    value: "BRAND",
    label: "Brand / Label / Artist",
    description: "I want to promote music by working with curators.",
  },
];

export default function OnboardingForm() {
  const { user } = useUser();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!selected || !user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selected }),
      });
      if (!res.ok) throw new Error("Failed to set role");
      await user.reload();
      router.push(selected === "CREATOR" ? "/creator" : "/brand");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold">Welcome! How will you use the platform?</h1>
        <div className="space-y-3">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelected(role.value)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                selected === role.value
                  ? "border-[#3a51fb] bg-[#3a51fb]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-semibold">{role.label}</div>
              <div className="text-sm text-gray-500 mt-1">{role.description}</div>
            </button>
          ))}
        </div>
        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full py-3 bg-[#3a51fb] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a41eb] transition-colors"
        >
          {loading ? "Setting up your account…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
