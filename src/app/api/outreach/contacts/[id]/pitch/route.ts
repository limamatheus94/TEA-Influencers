import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePitch } from "@/lib/ai/generate-pitch";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contact = await prisma.outreachContact.findUnique({
    where: { id },
    include: {
      discoveredCreator: true,
      outreachCampaign: true,
    },
  });

  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { subject, body } = await generatePitch({
    campaign: contact.outreachCampaign,
    creator: contact.discoveredCreator,
  });

  await prisma.outreachContact.update({
    where: { id },
    data: {
      emailSubject: subject,
      emailBody: body,
      generatedAt: new Date(),
      status: contact.status === "PENDING" ? "SCORED" : contact.status,
    },
  });

  return NextResponse.json({ subject, body });
}
