import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CampaignStatus, CampaignType } from "@prisma/client";
import { Search, Calendar, DollarSign } from "lucide-react";

export default async function ExploreCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; platform?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });
  if (!user?.creatorProfile) redirect("/onboarding");

  const { genre, platform } = await searchParams;

  const campaigns = await prisma.campaign.findMany({
    where: {
      status: CampaignStatus.OPEN,
      campaignType: CampaignType.OPEN_CALL,
      ...(genre && { genres: { has: genre } }),
      ...(platform && { platforms: { has: platform as never } }),
      applications: {
        none: { creatorProfileId: user.creatorProfile.id },
      },
    },
    include: {
      brandProfile: { select: { companyName: true, logoUrl: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const allGenres = await prisma.campaign.findMany({
    where: { status: CampaignStatus.OPEN, campaignType: CampaignType.OPEN_CALL },
    select: { genres: true },
  });
  const genreSet = [...new Set(allGenres.flatMap((c) => c.genres))].sort();

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse Campaigns</h1>
        <p className="text-sm text-gray-500 mt-1">
          {campaigns.length} open campaign{campaigns.length !== 1 ? "s" : ""}
        </p>
      </div>

      {genreSet.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/creator/campaigns">
            <Badge variant={!genre ? "default" : "outline"} className="cursor-pointer">
              All
            </Badge>
          </Link>
          {genreSet.map((g) => (
            <Link key={g} href={`/creator/campaigns?genre=${encodeURIComponent(g)}`}>
              <Badge variant={genre === g ? "default" : "outline"} className="cursor-pointer">
                {g}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="py-20 text-center">
          <Search className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500">No open campaigns at the moment.</p>
          {genre && (
            <Link href="/creator/campaigns" className="mt-3 inline-block">
              <Button variant="outline" size="sm">Clear filter</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((c) => (
            <Card key={c.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col gap-4 p-5">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{c.brandProfile.companyName}</p>
                  <h3 className="font-semibold text-gray-900 leading-snug">{c.title}</h3>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>

                <div className="flex flex-wrap gap-1">
                  {c.platforms.map((p) => (
                    <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {c.genres.map((g) => (
                    <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(c.budgetCents)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    {c._count.applications} application{c._count.applications !== 1 ? "s" : ""}
                  </span>
                  {c.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(c.deadline).toLocaleDateString("en-US")}
                    </span>
                  )}
                </div>

                <Link href={`/creator/campaigns/${c.id}`} className="mt-auto">
                  <Button className="w-full" size="sm">View campaign</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
