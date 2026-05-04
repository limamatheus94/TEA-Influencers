import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const actor = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!actor || actor.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      campaign: { select: { stripePaymentIntentId: true } },
    },
  });

  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  if (payment.status === "REFUNDED") {
    return NextResponse.json({ error: "Já reembolsado" }, { status: 422 });
  }

  if (payment.status !== "ESCROW" && payment.status !== "RELEASED") {
    return NextResponse.json({ error: "Status não permite reembolso" }, { status: 422 });
  }

  if (payment.status === "ESCROW" && payment.campaign.stripePaymentIntentId) {
    await stripe.paymentIntents.cancel(payment.campaign.stripePaymentIntentId);
  }

  if (payment.status === "RELEASED" && payment.stripeTransferId) {
    await stripe.transfers.createReversal(payment.stripeTransferId, {
      amount: payment.netCents,
    });
  }

  const updated = await prisma.payment.update({
    where: { id },
    data: { status: "REFUNDED" },
  });

  return NextResponse.json(updated);
}
