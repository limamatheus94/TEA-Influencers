import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const schema = z.object({
  amountCents: z.number().int().min(100, "Mínimo de $1,00"),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: applicationId } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { brandProfile: true },
  });
  if (!user?.brandProfile) return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      status: "APPROVED",
      campaign: { brandProfileId: user.brandProfile.id },
      payment: null, // not yet paid
    },
    include: {
      campaign: true,
      creatorProfile: true,
    },
  });

  if (!application) {
    return NextResponse.json(
      { error: "Candidatura não encontrada, não aprovada ou já paga" },
      { status: 404 }
    );
  }

  if (!application.creatorProfile.stripeAccountId || !application.creatorProfile.stripeOnboarded) {
    return NextResponse.json(
      { error: "Creator ainda não conectou conta Stripe" },
      { status: 422 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { amountCents } = parsed.data;

  // Get commission rate — prefer PlatformConfig, fallback to campaign rate
  const platformConfig = await prisma.platformConfig.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  const commissionRate = platformConfig?.commissionRate ?? application.campaign.commissionRate;
  const commissionCents = Math.round(amountCents * commissionRate);
  const netCents = amountCents - commissionCents;

  // Create Stripe Transfer to the creator's Express account
  const transfer = await stripe.transfers.create({
    amount: netCents,
    currency: "usd",
    destination: application.creatorProfile.stripeAccountId,
    metadata: {
      applicationId: application.id,
      campaignId: application.campaign.id,
      creatorProfileId: application.creatorProfile.id,
    },
  });

  // Record payment in DB
  const payment = await prisma.payment.create({
    data: {
      campaignId: application.campaign.id,
      applicationId: application.id,
      creatorProfileId: application.creatorProfile.id,
      amountCents,
      commissionCents,
      netCents,
      status: "RELEASED",
      stripeTransferId: transfer.id,
      releasedAt: new Date(),
    },
  });

  return NextResponse.json(payment, { status: 201 });
}
