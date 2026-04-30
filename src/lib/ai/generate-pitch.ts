import Anthropic from "@anthropic-ai/sdk";
import { DiscoveredCreator, OutreachCampaign } from "@prisma/client";

const client = new Anthropic();

export async function generatePitch({
  campaign,
  creator,
}: {
  campaign: OutreachCampaign;
  creator: DiscoveredCreator;
}): Promise<{ subject: string; body: string }> {
  const systemPrompt = `You are writing cold outreach emails for a music promotion platform.
Campaign:
- Artist: ${campaign.artistName}
- Song: "${campaign.songTitle}"
- Genre: ${campaign.genre}
- Song link: ${campaign.songUrl ?? "link to be included"}
- Brief: ${campaign.description ?? "N/A"}

Rules:
- Email body: ~150 words, conversational, no buzzwords
- Reference the creator's specific content (playlist name or channel topic)
- Clear single CTA: reply to express interest
- Subject line: under 60 chars, no emojis, no ALL CAPS
- Do NOT mention money or payment amounts
Return ONLY valid JSON: {"subject": "<subject>", "body": "<email body>"}`;

  const creatorContext = `
Creator name: ${creator.name}
Platform: ${creator.platform}
Recent content: ${JSON.stringify(creator.recentContent ?? []).slice(0, 500)}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: creatorContext }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";
  const parsed = JSON.parse(text) as { subject: string; body: string };

  return { subject: parsed.subject ?? "", body: parsed.body ?? "" };
}
