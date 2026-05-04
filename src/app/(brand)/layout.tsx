import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BrandSidebar } from "@/components/layout/brand-sidebar";

export default async function BrandLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/onboarding");
  if (user.role !== "BRAND" && user.role !== "ADMIN") redirect("/onboarding");

  return (
    <div className="flex h-screen bg-gray-50">
      <BrandSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
