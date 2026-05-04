import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Platform } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(3).max(100),
  artistName: z.string().min(1),
  songTitle: z.string().min(1),
  songUrl: z.string().url().optional(),
  genre: z.string().min(1),
  targetPlatforms: z.array(z.nativeEnum(Platform)).min(1),
  geoTargets: z.array(z.string()).default([]),
  description: z.string().max(2000).optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await prisma.outreachCampaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { contacts: true } } },
  });

  return NextResponse.json(campaigns);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const campaign = await prisma.outreachCampaign.create({
    data: {
      ...parsed.data,
      createdBy: user.id,
    },
  });

  return NextResponse.json({ campaign }, { status: 201 });
}
