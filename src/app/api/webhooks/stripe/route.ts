import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { CampaignStatus } from "@prisma/client";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    await prisma.campaign.updateMany({
      where: { stripePaymentIntentId: pi.id, status: CampaignStatus.DRAFT },
      data: { status: CampaignStatus.OPEN },
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    await prisma.campaign.updateMany({
      where: { stripePaymentIntentId: pi.id },
      data: { status: CampaignStatus.CANCELLED },
    });
  }

  return NextResponse.json({ received: true });
}
