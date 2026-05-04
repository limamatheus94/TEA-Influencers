import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const putSchema = z.object({
  commissionRate: z.number().min(0).max(1),
  id: z.string().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!actor || actor.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const config = await prisma.platformConfig.findFirst({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const actor = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!actor || actor.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { commissionRate, id } = parsed.data;

  const config = await prisma.platformConfig.upsert({
    where: { id: id ?? "default" },
    update: { commissionRate, updatedBy: actor.id },
    create: { commissionRate, updatedBy: actor.id },
  });

  return NextResponse.json(config);
}
