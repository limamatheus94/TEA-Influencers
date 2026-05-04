import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CampaignStatus } from "@prisma/client";
import { CampaignStatusActions } from "./campaign-status-actions";

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

export default async function AdminCampaignsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "ADMIN") redirect("/");

  const campaigns = await prisma.campaign.findMany({
    include: {
      brandProfile: { select: { companyName: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <p className="text-sm text-gray-500 mt-1">{campaigns.length} total</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {campaigns.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No campaigns found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Title</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Brand</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Budget</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Applications</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Deadline</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 max-w-[200px] truncate">{campaign.title}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{campaign.brandProfile.companyName}</td>
                      <td className="px-5 py-4">
                        <Badge variant={statusVariant[campaign.status]}>{statusLabel[campaign.status]}</Badge>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{formatCurrency(campaign.budgetCents)}</td>
                      <td className="px-5 py-4 text-gray-600">{campaign._count.applications}</td>
                      <td className="px-5 py-4 text-gray-600">
                        {campaign.deadline
                          ? new Date(campaign.deadline).toLocaleDateString("en-US")
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <CampaignStatusActions
                          campaignId={campaign.id}
                          currentStatus={campaign.status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
