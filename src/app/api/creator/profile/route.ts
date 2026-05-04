import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const putSchema = z.object({
  displayName: z.string().min(1, "Nome de exibição obrigatório"),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  genres: z.array(z.string()),
  mediaKitUrl: z.string().url().nullable().optional(),
});

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });
  if (!user?.creatorProfile) return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });

  const body = await req.json();
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { displayName, bio, location, genres, mediaKitUrl } = parsed.data;

  const updated = await prisma.creatorProfile.update({
    where: { id: user.creatorProfile.id },
    data: {
      displayName,
      bio: bio ?? null,
      location: location ?? null,
      genres,
      mediaKitUrl: mediaKitUrl ?? null,
    },
  });

  return NextResponse.json(updated);
}
