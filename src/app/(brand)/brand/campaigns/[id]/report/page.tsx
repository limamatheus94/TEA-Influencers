import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChevronLeft } from "lucide-react";
import { ReportClient } from "./report-client";

export default async function CampaignReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { brandProfile: true },
  });
  if (!user?.brandProfile) redirect("/onboarding");

  const campaign = await prisma.campaign.findFirst({
    where: { id, brandProfileId: user.brandProfile.id },
    include: {
      applications: {
        where: { status: "APPROVED" },
        include: {
          creatorProfile: {
            include: { platforms: true },
          },
          deliveryItems: { orderBy: { createdAt: "asc" } },
          payment: true,
        },
      },
    },
  });

  if (!campaign) notFound();

  const rows = campaign.applications.flatMap((app) =>
    app.deliveryItems.map((d) => {
      const platformProfile = app.creatorProfile.platforms.find(
        (p) => p.platform === d.platform
      );
      return {
        id: d.id,
        network: app.creatorProfile.displayName,
        platform: d.platform,
        followersCount: d.followersCount ?? platformProfile?.followersCount ?? null,
        postDate: d.submittedAt ? new Date(d.submittedAt).toLocaleDateString("en-GB").replace(/\//g, ".") : "ASAP",
        postUrl: d.url,
        screenshotUrl: d.screenshotUrl ?? null,
        postDescription: d.postDescription ?? null,
        storyTag: d.storyTag ?? null,
        storyLink: d.storyLink ?? null,
        impressions: d.impressions ?? null,
        likes: d.likes ?? null,
      };
    })
  );

  const totalImpressions = rows.reduce((s, r) => s + (r.impressions ?? 0), 0);
  const totalLikes = rows.reduce((s, r) => s + (r.likes ?? 0), 0);
  const totalFollowers = rows.reduce((s, r) => s + (r.followersCount ?? 0), 0);
  const budgetEuros = campaign.budgetCents / 100;
  const cpm = totalImpressions > 0 ? (budgetEuros / totalImpressions) * 1000 : null;

  function cpmResult(cpm: number | null): string {
    if (cpm === null) return "—";
    if (cpm < 5) return "Highly Above Average";
    if (cpm < 8) return "Above Average";
    if (cpm <= 12) return "Average";
    return "Below Average";
  }

  const reportData = {
    campaignId: campaign.id,
    campaignTitle: campaign.title,
    dateSubmitted: new Date(campaign.createdAt).toLocaleDateString("en-GB").replace(/\//g, "."),
    budgetEuros,
    postsCount: rows.length,
    totalFollowers,
    totalImpressions,
    totalLikes,
    cpm,
    cpmResult: cpmResult(cpm),
    rows,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-8 pt-6 print:hidden">
        <Link
          href={`/brand/campaigns/${id}`}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to campaign
        </Link>
      </div>
      <ReportClient data={reportData} />
    </div>
  );
}
