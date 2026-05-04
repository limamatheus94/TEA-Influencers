import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { brandProfile: true },
  });
  if (!user?.brandProfile) return NextResponse.json({ error: "Brand profile not found" }, { status: 404 });

  // Ensure the application belongs to this brand's campaign
  const application = await prisma.application.findFirst({
    where: {
      id,
      campaign: { brandProfileId: user.brandProfile.id },
    },
    include: { campaign: true },
  });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.application.update({
    where: { id },
    data: { status: parsed.data.status as ApplicationStatus },
  });

  return NextResponse.json(updated);
}
