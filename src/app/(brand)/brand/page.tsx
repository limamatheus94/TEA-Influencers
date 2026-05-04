import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignStatus } from "@prisma/client";
import { PlusCircle, Users, DollarSign, Megaphone } from "lucide-react";

const statusVariant: Record<CampaignStatus, "default" | "success" | "warning" | "secondary" | "destructive"> = {
  DRAFT: "secondary",
  OPEN: "success",
  IN_REVIEW: "warning",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

const statusLabel: Record<CampaignStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  IN_REVIEW: "In Review",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default async function BrandDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      brandProfile: {
        include: {
          campaigns: {
            include: { _count: { select: { applications: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!user?.brandProfile) redirect("/onboarding");

  const { brandProfile } = user;
  const campaigns = brandProfile.campaigns;

  const totalBudget = campaigns.reduce((s, c) => s + c.budgetCents, 0);
  const openCampaigns = campaigns.filter((c) => c.status === "OPEN").length;
  const totalApplications = campaigns.reduce((s, c) => s + c._count.applications, 0);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">{brandProfile.companyName}</p>
        </div>
        <Link href="/brand/campaigns/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#3a51fb]/10 p-2">
                <Megaphone className="h-5 w-5 text-[#3a51fb]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{openCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total applications</p>
                <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
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
                <p className="text-sm text-gray-500">Total budget</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="py-12 text-center">
              <Megaphone className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">No campaigns yet.</p>
              <Link href="/brand/campaigns/new" className="mt-4 inline-block">
                <Button size="sm">Create your first campaign</Button>
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Budget</th>
                  <th className="pb-3 font-medium">Applications</th>
                  <th className="pb-3 font-medium">Deadline</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {campaigns.map((c) => (
                  <tr key={c.id} className="group">
                    <td className="py-3 font-medium text-gray-900">{c.title}</td>
                    <td className="py-3">
                      <Badge variant={statusVariant[c.status]}>{statusLabel[c.status]}</Badge>
                    </td>
                    <td className="py-3 text-gray-700">{formatCurrency(c.budgetCents)}</td>
                    <td className="py-3 text-gray-700">{c._count.applications}</td>
                    <td className="py-3 text-gray-500">
                      {c.deadline ? new Date(c.deadline).toLocaleDateString("en-US") : "—"}
                    </td>
                    <td className="py-3 text-right">
                      <Link href={`/brand/campaigns/${c.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
