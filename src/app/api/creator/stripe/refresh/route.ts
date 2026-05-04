import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// Stripe calls this URL when the account link expires — we regenerate one and redirect
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL!));

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });

  if (!user?.creatorProfile?.stripeAccountId) {
    return NextResponse.redirect(new URL("/creator/stripe", process.env.NEXT_PUBLIC_APP_URL!));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const accountLink = await stripe.accountLinks.create({
    account: user.creatorProfile.stripeAccountId,
    refresh_url: `${appUrl}/api/creator/stripe/refresh`,
    return_url: `${appUrl}/creator/stripe?onboarded=1`,
    type: "account_onboarding",
  });

  return NextResponse.redirect(accountLink.url);
}
