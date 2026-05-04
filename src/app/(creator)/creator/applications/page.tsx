import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ApplicationStatus } from "@prisma/client";
import { FileText, Search } from "lucide-react";

const statusVariant: Record<ApplicationStatus, "default" | "success" | "warning" | "secondary" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  WITHDRAWN: "secondary",
};

const statusLabel: Record<ApplicationStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export default async function MyApplicationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });
  if (!user?.creatorProfile) redirect("/onboarding");

  const applications = await prisma.application.findMany({
    where: { creatorProfileId: user.creatorProfile.id },
    include: {
      campaign: {
        include: {
          brandProfile: { select: { companyName: true } },
        },
      },
      payment: true,
      deliveryItems: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const byStatus = {
    PENDING: applications.filter((a) => a.status === "PENDING"),
    APPROVED: applications.filter((a) => a.status === "APPROVED"),
    REJECTED: applications.filter((a) => a.status === "REJECTED"),
    WITHDRAWN: applications.filter((a) => a.status === "WITHDRAWN"),
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-sm text-gray-500 mt-1">{applications.length} total</p>
        </div>
        <Link href="/creator/campaigns">
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Browse campaigns
          </Button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="py-20 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500">You haven't applied to any campaigns yet.</p>
          <Link href="/creator/campaigns" className="mt-4 inline-block">
            <Button>Browse campaigns</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {(["APPROVED", "PENDING", "REJECTED", "WITHDRAWN"] as ApplicationStatus[]).map((status) => {
            const group = byStatus[status];
            if (group.length === 0) return null;
            return (
              <section key={status}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {statusLabel[status]} ({group.length})
                </h2>
                <Card>
                  <CardContent className="divide-y divide-gray-100 p-0">
                    {group.map((app) => (
                      <div key={app.id} className="flex items-start gap-4 p-5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900 truncate">{app.campaign.title}</p>
                            <Badge variant={statusVariant[app.status]}>{statusLabel[app.status]}</Badge>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{app.campaign.brandProfile.companyName}</p>

                          <div className="bg-gray-50 rounded-md p-3 mb-2">
                            <p className="text-xs font-medium text-gray-500 mb-1">Your pitch</p>
                            <p className="text-sm text-gray-700 line-clamp-3">{app.pitch}</p>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Budget: {formatCurrency(app.campaign.budgetCents)}</span>
                            {app.payment && (
                              <span className="text-green-600 font-medium">
                                Earned: {formatCurrency(app.payment.netCents)}
                              </span>
                            )}
                            <span>Applied on {new Date(app.createdAt).toLocaleDateString("en-US")}</span>
                          </div>
                        </div>

                        {app.status === "APPROVED" && app.deliveryItems.length === 0 && (
                          <div className="flex-shrink-0">
                            <Badge variant="warning" className="text-xs">Delivery pending</Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
