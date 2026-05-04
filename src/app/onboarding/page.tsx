import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

  if (user?.role === "CREATOR") redirect("/creator");
  if (user?.role === "BRAND") redirect("/brand");
  if (user?.role === "ADMIN") redirect("/admin");

  return <OnboardingForm />;
}
