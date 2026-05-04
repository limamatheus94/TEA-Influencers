import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PaymentStatus } from "@prisma/client";
import { PaymentActions } from "./payment-actions";

const statusVariant: Record<PaymentStatus, "default" | "success" | "warning" | "secondary" | "destructive"> = {
  ESCROW: "warning",
  RELEASED: "success",
  REFUNDED: "secondary",
  DISPUTED: "destructive",
};

const statusLabel: Record<PaymentStatus, string> = {
  ESCROW: "In escrow",
  RELEASED: "Released",
  REFUNDED: "Refunded",
  DISPUTED: "Disputed",
};

export default async function AdminPaymentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "ADMIN") redirect("/");

  const payments = await prisma.payment.findMany({
    include: {
      campaign: { select: { title: true, stripePaymentIntentId: true } },
      creatorProfile: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalReleased = payments
    .filter((p) => p.status === "RELEASED")
    .reduce((sum, p) => sum + p.netCents, 0);

  const totalCommission = payments
    .filter((p) => p.status === "RELEASED")
    .reduce((sum, p) => sum + p.commissionCents, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500 mt-1">{payments.length} total</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total released (creators)</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalReleased)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide">TEA commission</p>
            <p className="text-2xl font-bold text-[#3a51fb] mt-1">{formatCurrency(totalCommission)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total payments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{payments.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment history</CardTitle>
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
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Creator</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Gross</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Commission</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Net</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Released on</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 max-w-[160px] truncate text-gray-900">
                        {payment.campaign.title}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {payment.creatorProfile.displayName}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{formatCurrency(payment.amountCents)}</td>
                      <td className="px-5 py-4 text-gray-600">{formatCurrency(payment.commissionCents)}</td>
                      <td className="px-5 py-4 font-medium text-gray-900">{formatCurrency(payment.netCents)}</td>
                      <td className="px-5 py-4">
                        <Badge variant={statusVariant[payment.status]}>{statusLabel[payment.status]}</Badge>
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {payment.releasedAt
                          ? new Date(payment.releasedAt).toLocaleDateString("en-US")
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <PaymentActions paymentId={payment.id} status={payment.status} />
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
