import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/lib/inngest";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contact = await prisma.outreachContact.findUnique({
    where: { id },
    select: { id: true, outreachCampaignId: true, status: true },
  });

  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await inngest.send({
    name: "outreach/creators.score",
    data: {
      outreachCampaignId: contact.outreachCampaignId,
      contactIds: [contact.id],
    },
  });

  return NextResponse.json({ queued: true });
}
