import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  if (role === "CREATOR") redirect("/creator");
  if (role === "BRAND") redirect("/brand");
  if (role === "ADMIN") redirect("/admin");

  return <OnboardingForm />;
}
