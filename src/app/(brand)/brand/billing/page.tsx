import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentStatus } from "@prisma/client";

const statusVariant: Record<PaymentStatus, "default" | "success" | "warning" | "destructive"> = {
  ESCROW: "warning",
  RELEASED: "success",
  REFUNDED: "default",
  DISPUTED: "destructive",
};

const statusLabel: Record<PaymentStatus, string> = {
  ESCROW: "In escrow",
  RELEASED: "Released",
  REFUNDED: "Refunded",
  DISPUTED: "Disputed",
};

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      brandProfile: {
        include: {
          campaigns: {
            include: {
              payments: {
                include: {
                  creatorProfile: { select: { displayName: true } },
                },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      },
    },
  });

  if (!user?.brandProfile) redirect("/onboarding");

  const payments = user.brandProfile.campaigns.flatMap((c) =>
    c.payments.map((p) => ({ ...p, campaignTitle: c.title }))
  );

  const totalEscrow = payments
    .filter((p) => p.status === "ESCROW")
    .reduce((s, p) => s + p.amountCents, 0);

  const totalReleased = payments
    .filter((p) => p.status === "RELEASED")
    .reduce((s, p) => s + p.amountCents, 0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Billing</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">In escrow</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{formatCurrency(totalEscrow)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500">Released to creators</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalReleased)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No payments recorded yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-3 font-medium">Campaign</th>
                  <th className="pb-3 font-medium">Creator</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Commission (15%)</th>
                  <th className="pb-3 font-medium">Net</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 text-gray-900">{p.campaignTitle}</td>
                    <td className="py-3 text-gray-700">{p.creatorProfile.displayName}</td>
                    <td className="py-3 text-gray-900 font-medium">{formatCurrency(p.amountCents)}</td>
                    <td className="py-3 text-gray-500">{formatCurrency(p.commissionCents)}</td>
                    <td className="py-3 text-gray-700">{formatCurrency(p.netCents)}</td>
                    <td className="py-3">
                      <Badge variant={statusVariant[p.status]}>{statusLabel[p.status]}</Badge>
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString("en-US")}
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
