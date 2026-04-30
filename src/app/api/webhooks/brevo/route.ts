import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();

  // Verify HMAC-SHA256 signature
  const signature = req.headers.get("x-sib-signature");
  const expected = createHmac("sha256", process.env.BREVO_WEBHOOK_SECRET ?? "")
    .update(body)
    .digest("hex");

  if (signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body) as {
    event: string;
    "message-id": string;
    date: string;
  };

  const messageId = event["message-id"];
  if (!messageId) return NextResponse.json({ ok: true });

  if (event.event === "opened") {
    await prisma.outreachContact.updateMany({
      where: { brevoMessageId: messageId, openedAt: null },
      data: { openedAt: new Date(event.date), status: "OPENED" },
    });
  }

  return NextResponse.json({ ok: true });
}
