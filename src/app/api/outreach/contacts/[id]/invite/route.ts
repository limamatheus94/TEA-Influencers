import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, textToHtml } from "@/lib/brevo";
import { randomBytes } from "crypto";

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

  const creator = contact.discoveredCreator;

  if (!creator.email) {
    return NextResponse.json({ error: "Creator has no email address" }, { status: 422 });
  }

  if (!contact.emailBody || !contact.emailSubject) {
    return NextResponse.json({ error: "Generate a pitch first" }, { status: 422 });
  }

  // Generate invite token (expires in 7 days)
  const inviteToken = randomBytes(32).toString("hex");
  const inviteTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/sign-up?inviteToken=${inviteToken}`;

  // Build the email body: pitch + invite link appended
  const fullBody = `${contact.emailBody}\n\nSe tiver interesse, cadastre-se na plataforma pelo link: ${inviteUrl}`;

  const messageId = await sendEmail({
    to: { email: creator.email, name: creator.name },
    subject: contact.emailSubject,
    htmlContent: textToHtml(fullBody),
    tags: ["outreach", contact.outreachCampaign.genre],
  });

  await prisma.outreachContact.update({
    where: { id },
    data: {
      inviteToken,
      inviteTokenExpiresAt,
      inviteSentAt: new Date(),
      sentAt: new Date(),
      brevoMessageId: messageId,
      status: "SENT",
    },
  });

  return NextResponse.json({ sent: true, messageId });
}
