import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const status = req.nextUrl.searchParams.get("status") ?? "PENDING";

  const creators = await prisma.creatorProfile.findMany({
    where: { approvalStatus: status as "PENDING" | "APPROVED" | "REJECTED" },
    include: {
      platforms: true,
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ creators });
}
