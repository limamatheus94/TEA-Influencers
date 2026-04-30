import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  role: z.enum(["CREATOR", "BRAND"]),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const { role } = parsed.data;

  // 1. Write role to Clerk publicMetadata
  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });

  // 2. Get user email from Clerk
  const clerkUser = await clerk.users.getUser(userId);
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return NextResponse.json({ error: "No email found" }, { status: 400 });

  // 3. Upsert User + profile in DB
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: { role: role as UserRole },
    create: {
      clerkId: userId,
      email,
      role: role as UserRole,
    },
  });

  if (role === "CREATOR") {
    await prisma.creatorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: clerkUser.fullName ?? clerkUser.username ?? email.split("@")[0],
        genres: [],
      },
    });
  } else {
    await prisma.brandProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        companyName: clerkUser.fullName ?? clerkUser.username ?? email.split("@")[0],
      },
    });
  }

  return NextResponse.json({ ok: true });
}
