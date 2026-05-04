import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ApplicationStatus } from "@prisma/client";
import { Search, FileText, DollarSign, Star } from "lucide-react";

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

export default async function CreatorDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      creatorProfile: {
        include: {
          applications: {
            include: {
              campaign: {
                include: { brandProfile: { select: { companyName: true } } },
              },
              payment: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          platforms: true,
        },
      },
    },
  });

  if (!user?.creatorProfile) redirect("/onboarding");

  const { creatorProfile } = user;
  const applications = creatorProfile.applications;

  const totalEarned = applications
    .flatMap((a) => (a.payment ? [a.payment] : []))
    .filter((p) => p.status === "RELEASED")
    .reduce((s, p) => s + p.netCents, 0);

  const pendingCount = applications.filter((a) => a.status === "PENDING").length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {creatorProfile.displayName}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Your creator dashboard</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#3a51fb]/10 p-2">
                <FileText className="h-5 w-5 text-[#3a51fb]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-50 p-2">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2">
                <Search className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#3a51fb]/10 p-2">
                <DollarSign className="h-5 w-5 text-[#3a51fb]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total earned</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalEarned)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent applications</CardTitle>
                <Link href="/creator/applications">
                  <Button variant="ghost" size="sm">View all</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="py-10 text-center">
                  <FileText className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No applications yet.</p>
                  <Link href="/creator/campaigns" className="mt-3 inline-block">
                    <Button size="sm">Browse campaigns</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{app.campaign.title}</p>
                        <p className="text-xs text-gray-500">{app.campaign.brandProfile.companyName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">
                          {formatCurrency(app.campaign.budgetCents)}
                        </span>
                        <Badge variant={appStatusVariant[app.status]}>
                          {appStatusLabel[app.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {creatorProfile.platforms.length === 0 ? (
                <p className="text-sm text-gray-500">No platforms added yet.</p>
              ) : (
                creatorProfile.platforms.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{p.platform}</Badge>
                    <span className="text-gray-600">
                      {p.followersCount?.toLocaleString() ?? "—"} followers
                    </span>
                  </div>
                ))
              )}
              {creatorProfile.genres.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Genres</p>
                  <div className="flex flex-wrap gap-1">
                    {creatorProfile.genres.map((g) => (
                      <Badge key={g} variant="secondary">{g}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Link href="/creator/campaigns">
            <Button className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Browse campaigns
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
