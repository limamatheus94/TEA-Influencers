"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, CreditCard, Settings, Shield, UserCheck } from "lucide-react";

const navItems = [
  { href: "/admin/campaigns", label: "Campanhas", icon: LayoutDashboard },
  { href: "/admin/creators", label: "Creators", icon: UserCheck },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/payments", label: "Pagamentos", icon: CreditCard },
  { href: "/admin/config", label: "Configurações", icon: Settings },
];

export function AdminSidebar() {
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

      <div className="px-4 py-3 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-2">
          <Shield className="h-3 w-3 text-[#3a51fb]" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#999]">
            Admin
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
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
