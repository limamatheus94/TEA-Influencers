import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const patchSchema = z.object({
  role: z.nativeEnum(UserRole),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const actor = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!actor || actor.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const updated = await prisma.user.update({
    where: { id },
    data: { role: parsed.data.role },
  });

  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(target.clerkId, {
    publicMetadata: { role: parsed.data.role },
  });

  return NextResponse.json(updated);
}
