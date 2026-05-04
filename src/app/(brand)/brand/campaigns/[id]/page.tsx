import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationStatus, CampaignStatus } from "@prisma/client";
import { ChevronLeft, Calendar, DollarSign, Users, BarChart2 } from "lucide-react";
import { ApplicationActions, ReleasePaymentForm } from "./application-actions";
import { CreatorProfilePanel } from "./creator-profile-panel";

const campaignStatusVariant: Record<CampaignStatus, "default" | "success" | "warning" | "secondary" | "destructive"> = {
  DRAFT: "secondary",
  OPEN: "success",
  IN_REVIEW: "warning",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

const campaignStatusLabel: Record<CampaignStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  IN_REVIEW: "In Review",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const appStatusVariant: Record<ApplicationStatus, "default" | "success" | "warning" | "secondary" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  WITHDRAWN: "secondary",
};

const appStatusLabel: Record<ApplicationStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export default async function CampaignDetailPage({
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
        include: {
          creatorProfile: {
            include: {
              platforms: true,
              user: { select: { email: true } },
            },
          },
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { applications: true } },
    },
  });

  if (!campaign) notFound();

  const pendingCount = campaign.applications.filter((a) => a.status === "PENDING").length;
  const approvedCount = campaign.applications.filter((a) => a.status === "APPROVED").length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/brand" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant={campaignStatusVariant[campaign.status]}>
                {campaignStatusLabel[campaign.status]}
              </Badge>
              <span className="text-sm text-gray-500">
                Created on {new Date(campaign.createdAt).toLocaleDateString("en-US")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/brand/campaigns/${campaign.id}/report`}>
              <Button variant="outline" size="sm">
                <BarChart2 className="mr-1.5 h-4 w-4" />
                View Report
              </Button>
            </Link>
            {campaign.status === "DRAFT" && (
              <PublishButton campaignId={campaign.id} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Budget</span>
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(campaign.budgetCents)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Applications</span>
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {pendingCount} pending · {approvedCount} approved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Deadline</span>
            </div>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString("en-US") : "No deadline"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.description}</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {campaign.platforms.map((p) => (
                  <Badge key={p} variant="outline">{p}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Genres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {campaign.genres.map((g) => (
                  <Badge key={g} variant="secondary">{g}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Deliverables</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.deliverables}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications ({campaign._count.applications})</CardTitle>
        </CardHeader>
        <CardContent>
          {campaign.applications.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No applications yet. The campaign must be open to receive applications.
            </p>
          ) : (
            <div className="space-y-4">
              {campaign.applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-lg border border-gray-200 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{app.creatorProfile.displayName}</p>
                      <p className="text-xs text-gray-500">{app.creatorProfile.user.email}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {app.creatorProfile.platforms.map((cp) => (
                          <Badge key={cp.id} variant="outline" className="text-xs">
                            {cp.platform} · {cp.followersCount?.toLocaleString() ?? "?"} followers
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge variant={appStatusVariant[app.status]}>{appStatusLabel[app.status]}</Badge>
                  </div>

                  <div className="bg-gray-50 rounded-md p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Pitch</p>
                    <p className="text-sm text-gray-700">{app.pitch}</p>
                  </div>

                  <CreatorProfilePanel creator={app.creatorProfile} />

                  {app.status === "PENDING" && (
                    <ApplicationActions applicationId={app.id} campaignId={campaign.id} />
                  )}

                  {app.status === "APPROVED" && !app.payment && (
                    <ReleasePaymentForm
                      applicationId={app.id}
                      budgetCents={campaign.budgetCents}
                    />
                  )}

                  {app.payment && (
                    <div className="flex items-center gap-2 text-xs text-green-700 font-medium">
                      <DollarSign className="h-3 w-3" />
                      Paid: {formatCurrency(app.payment.netCents)} net
                      · {new Date(app.payment.releasedAt!).toLocaleDateString("en-US")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PublishButton({ campaignId }: { campaignId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const { auth } = await import("@clerk/nextjs/server");
        const { prisma } = await import("@/lib/prisma");
        const { userId } = await auth();
        if (!userId) return;
        const user = await prisma.user.findUnique({
          where: { clerkId: userId },
          include: { brandProfile: true },
        });
        if (!user?.brandProfile) return;
        await prisma.campaign.updateMany({
          where: { id: campaignId, brandProfileId: user.brandProfile.id },
          data: { status: "OPEN" },
        });
      }}
    >
      <Button type="submit" size="sm">
        Publish campaign
      </Button>
    </form>
  );
}
