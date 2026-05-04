import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CampaignStatus } from "@prisma/client";
import { ChevronLeft, Calendar, DollarSign, Users, Building2 } from "lucide-react";
import { PitchForm } from "./pitch-form";

export default async function CampaignPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });
  if (!user?.creatorProfile) redirect("/onboarding");

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      brandProfile: { select: { companyName: true, website: true, bio: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!campaign || campaign.status !== CampaignStatus.OPEN) notFound();

  const existingApplication = await prisma.application.findUnique({
    where: {
      campaignId_creatorProfileId: {
        campaignId: id,
        creatorProfileId: user.creatorProfile.id,
      },
    },
  });

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/creator/campaigns" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to campaigns
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">{campaign.brandProfile.companyName}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{campaign.title}</h1>
        <div className="flex flex-wrap gap-2">
          {campaign.platforms.map((p) => (
            <Badge key={p} variant="outline">{p}</Badge>
          ))}
          {campaign.genres.map((g) => (
            <Badge key={g} variant="secondary">{g}</Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <DollarSign className="h-4 w-4" />
              Budget
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(campaign.budgetCents)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Users className="h-4 w-4" />
              Applications
            </div>
            <p className="text-xl font-bold text-gray-900">{campaign._count.applications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Calendar className="h-4 w-4" />
              Deadline
            </div>
            <p className="text-xl font-bold text-gray-900">
              {campaign.deadline
                ? new Date(campaign.deadline).toLocaleDateString("en-US")
                : "No deadline"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>About this campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.description}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What is expected</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.deliverables}</p>
        </CardContent>
      </Card>

      {campaign.brandProfile.bio && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>About {campaign.brandProfile.companyName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{campaign.brandProfile.bio}</p>
            {campaign.brandProfile.website && (
              <a
                href={campaign.brandProfile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#3a51fb] hover:underline mt-2 inline-block"
              >
                {campaign.brandProfile.website}
              </a>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {existingApplication ? "Already applied" : "Submit application"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {existingApplication ? (
            <div className="text-center py-4">
              <Badge variant="success" className="text-sm px-4 py-1.5">
                Application submitted
              </Badge>
              <p className="text-sm text-gray-500 mt-3">
                Waiting for the brand to review. Track it in{" "}
                <Link href="/creator/applications" className="text-[#3a51fb] hover:underline">
                  My Applications
                </Link>.
              </p>
            </div>
          ) : (
            <PitchForm campaignId={campaign.id} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
