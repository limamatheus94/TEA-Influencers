import { Prisma } from "@prisma/client";

type YoutubeChannel = {
  id: { channelId: string };
  snippet: {
    channelTitle: string;
    description: string;
    thumbnails: { default: { url: string } };
    publishedAt: string;
  };
};

export async function youtubeDiscover({
  query,
  genre,
}: {
  query: string;
  genre: string;
}): Promise<Prisma.DiscoveredCreatorCreateInput[]> {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "channel");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "50");
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY ?? "");

  const res = await fetch(url.toString());
  const data = (await res.json()) as { items: YoutubeChannel[] };
  const channels = data.items ?? [];

  return channels.map((c) => ({
    source: "YOUTUBE" as const,
    externalId: c.id.channelId,
    name: c.snippet.channelTitle,
    profileUrl: `https://www.youtube.com/channel/${c.id.channelId}`,
    avatarUrl: c.snippet.thumbnails?.default?.url,
    platform: "YOUTUBE" as const,
    handle: c.id.channelId,
    genres: [genre],
    recentContent: [{ description: c.snippet.description?.slice(0, 300) }],
    rawData: c as unknown as Prisma.InputJsonValue,
  }));
}
