import Anthropic from "@anthropic-ai/sdk";
import { DiscoveredCreator, OutreachCampaign } from "@prisma/client";

const client = new Anthropic();

export async function scoreCreator({
  campaign,
  creator,
}: {
  campaign: OutreachCampaign;
  creator: DiscoveredCreator;
}): Promise<{ score: number; reasoning: string }> {
  const systemPrompt = `You are a music marketing analyst evaluating whether a content creator is a good fit for a music promotion campaign.
Campaign details:
- Artist: ${campaign.artistName}
- Song: ${campaign.songTitle}
- Genre: ${campaign.genre}
- Target platforms: ${campaign.targetPlatforms.join(", ")}
- Target regions: ${campaign.geoTargets.join(", ") || "Global"}
- Description: ${campaign.description ?? "N/A"}

Score the creator from 0 to 100 based on:
1. Genre overlap (40 pts)
2. Platform match (20 pts)
3. Audience size and engagement (20 pts)
4. Geographic fit (20 pts)

Return ONLY valid JSON: {"score": <number>, "reasoning": "<2-3 sentences>"}`;

  const creatorSummary = `
Name: ${creator.name}
Platform: ${creator.platform}
Followers: ${creator.followersCount ?? "unknown"}
Genres: ${creator.genres.join(", ")}
Location: ${creator.location ?? "unknown"}
Recent content: ${JSON.stringify(creator.recentContent ?? [])}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: [
      {
        type: "text",
        text: systemPrompt,
        // Cache system prompt per outreach campaign (same for all creators in batch)
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: creatorSummary }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";
  const parsed = JSON.parse(text) as { score: number; reasoning: string };

  return { score: parsed.score ?? 0, reasoning: parsed.reasoning ?? "" };
}
