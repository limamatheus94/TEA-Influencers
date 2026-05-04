"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Search, FileText, Wallet, User, CreditCard } from "lucide-react";

const navItems = [
  { href: "/creator", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/creator/campaigns", label: "Browse Campaigns", icon: Search },
  { href: "/creator/applications", label: "My Applications", icon: FileText },
  { href: "/creator/stripe", label: "Stripe Account", icon: Wallet },
  { href: "/creator/payouts", label: "Earnings", icon: CreditCard },
  { href: "/creator/profile", label: "My Profile", icon: User },
];

export function CreatorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-[#e5e5e5] bg-white">
      <div className="flex h-16 items-center border-b border-[#e5e5e5] px-5">
        <Image
          src="/logos/TEA_Global_Black.png"
          alt="TEA Global Media"
          width={100}
          height={28}
          className="object-contain"
          priority
        />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[#3a51fb]/8 text-[#3a51fb]"
                  : "text-[#666666] hover:bg-[#f4f4f4] hover:text-black"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#e5e5e5] p-4">
        <UserButton />
      </div>
    </aside>
  );
}
