import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PaymentStatus } from "@prisma/client";
import { DollarSign } from "lucide-react";

const statusVariant: Record<PaymentStatus, "default" | "success" | "warning" | "secondary" | "destructive"> = {
  ESCROW: "warning",
  RELEASED: "success",
  REFUNDED: "secondary",
  DISPUTED: "destructive",
};

const statusLabel: Record<PaymentStatus, string> = {
  ESCROW: "In escrow",
  RELEASED: "Received",
  REFUNDED: "Refunded",
  DISPUTED: "Disputed",
};

export default async function CreatorPayoutsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { creatorProfile: true },
  });
  if (!user?.creatorProfile) redirect("/onboarding");

  const payments = await prisma.payment.findMany({
    where: { creatorProfileId: user.creatorProfile.id },
    include: {
      campaign: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalReceived = payments
    .filter((p) => p.status === "RELEASED")
    .reduce((sum, p) => sum + p.netCents, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Earnings</h1>
        <p className="text-sm text-gray-500 mt-1">Payment history from your campaigns.</p>
      </div>

      <div className="mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3a51fb]/10">
                <DollarSign className="h-5 w-5 text-[#3a51fb]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total received</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalReceived)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No payments found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Campaign</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Net amount</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Stripe ID</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Released on</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 max-w-[200px] truncate text-gray-900">
                        {payment.campaign.title}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {formatCurrency(payment.netCents)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={statusVariant[payment.status]}>{statusLabel[payment.status]}</Badge>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400 font-mono">
                        {payment.stripeTransferId
                          ? payment.stripeTransferId.slice(0, 18) + "…"
                          : "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {payment.releasedAt
                          ? new Date(payment.releasedAt).toLocaleDateString("en-US")
                          : "—"}
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
