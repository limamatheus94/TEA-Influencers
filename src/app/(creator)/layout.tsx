import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreatorSidebar } from "@/components/layout/creator-sidebar";

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/onboarding");
  if (user.role !== "CREATOR" && user.role !== "ADMIN") redirect("/onboarding");

  return (
    <div className="flex h-screen bg-gray-50">
      <CreatorSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
