import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CampaignStatus } from "@prisma/client";
import { z } from "zod";

const patchSchema = z.object({
  status: z.nativeEnum(CampaignStatus),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.campaign.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json(updated);
}
