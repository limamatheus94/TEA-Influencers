import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { CampaignStatus, Platform } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  genres: z.array(z.string()).min(1),
  platforms: z.array(z.nativeEnum(Platform)).min(1),
  budgetCents: z.number().int().min(1000),
  deliverables: z.string().min(5),
  deadline: z.string().datetime().optional(),
  maxApplications: z.number().int().positive().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { brandProfile: true },
  });

  if (!user?.brandProfile) {
    return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
  }

  const campaigns = await prisma.campaign.findMany({
    where: { brandProfileId: user.brandProfile.id },
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(campaigns);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { brandProfile: true },
  });

  if (!user?.brandProfile) {
    return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Create Stripe PaymentIntent in escrow (manual capture)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: data.budgetCents,
    currency: "usd",
    capture_method: "manual",
    metadata: {
      brandProfileId: user.brandProfile.id,
      brandUserId: user.id,
    },
    description: `Campaign: ${data.title}`,
  });

  const campaign = await prisma.campaign.create({
    data: {
      brandProfileId: user.brandProfile.id,
      title: data.title,
      description: data.description,
      genres: data.genres,
      platforms: data.platforms,
      budgetCents: data.budgetCents,
      deliverables: data.deliverables,
      deadline: data.deadline ? new Date(data.deadline) : null,
      maxApplications: data.maxApplications,
      status: CampaignStatus.DRAFT,
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  return NextResponse.json(
    { campaign, clientSecret: paymentIntent.client_secret },
    { status: 201 }
  );
}
