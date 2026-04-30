import { Prisma } from "@prisma/client";

type SpotifyToken = { access_token: string };
type SpotifyPlaylist = {
  id: string;
  name: string;
  owner: { id: string; display_name: string };
  external_urls: { spotify: string };
  tracks: { total: number };
};

async function getSpotifyToken(): Promise<string> {
  const creds = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = (await res.json()) as SpotifyToken;
  return data.access_token;
}

export async function spotifyDiscover({
  query,
  genre,
}: {
  query: string;
  genre: string;
}): Promise<Prisma.DiscoveredCreatorCreateInput[]> {
  const token = await getSpotifyToken();

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=50`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = (await res.json()) as { playlists: { items: SpotifyPlaylist[] } };
  const playlists = data.playlists?.items ?? [];

  return playlists
    .filter((p) => p?.owner?.id && p.owner.id !== "spotify") // exclude official Spotify playlists
    .map((p) => ({
      source: "SPOTIFY" as const,
      externalId: p.id,
      name: p.owner.display_name ?? p.owner.id,
      profileUrl: p.external_urls.spotify,
      platform: "SPOTIFY" as const,
      handle: p.owner.id,
      genres: [genre],
      recentContent: [{ title: p.name, url: p.external_urls.spotify, trackCount: p.tracks.total }],
      rawData: p as unknown as Prisma.InputJsonValue,
    }));
}
