import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });

  if (!user?.creatorProfile) {
    return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
  }

  const { creatorProfile } = user;

  // Create Stripe Express account if not exists
  let stripeAccountId = creatorProfile.stripeAccountId;
  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        transfers: { requested: true },
      },
      metadata: { creatorProfileId: creatorProfile.id },
    });
    stripeAccountId = account.id;
    await prisma.creatorProfile.update({
      where: { id: creatorProfile.id },
      data: { stripeAccountId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${appUrl}/api/creator/stripe/refresh`,
    return_url: `${appUrl}/creator/stripe?onboarded=1`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
