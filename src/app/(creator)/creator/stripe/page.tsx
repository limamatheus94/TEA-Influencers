import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, AlertCircle, ExternalLink, DollarSign } from "lucide-react";
import { StripeOnboardButton } from "./stripe-onboard-button";

export default async function CreatorStripePage({
  searchParams,
}: {
  searchParams: Promise<{ onboarded?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { onboarded } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      creatorProfile: {
        include: {
          payouts: {
            include: { campaign: { select: { title: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!user?.creatorProfile) redirect("/onboarding");

  const { creatorProfile } = user;

  if (onboarded === "1" && creatorProfile.stripeAccountId && !creatorProfile.stripeOnboarded) {
    const account = await stripe.accounts.retrieve(creatorProfile.stripeAccountId);
    if (account.details_submitted) {
      await prisma.creatorProfile.update({
        where: { id: creatorProfile.id },
        data: { stripeOnboarded: true },
      });
      creatorProfile.stripeOnboarded = true;
    }
  }

  const payouts = creatorProfile.payouts;
  const totalNet = payouts
    .filter((p) => p.status === "RELEASED")
    .reduce((s, p) => s + p.netCents, 0);
  const totalPending = payouts
    .filter((p) => p.status === "ESCROW")
    .reduce((s, p) => s + p.netCents, 0);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Stripe Account</h1>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stripe Connect</CardTitle>
            {creatorProfile.stripeOnboarded ? (
              <Badge variant="success">
                <CheckCircle className="mr-1 h-3 w-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="warning">
                <AlertCircle className="mr-1 h-3 w-3" />
                Pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {creatorProfile.stripeOnboarded ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Your account is set up. Approved payments will be transferred automatically.
              </p>
              {creatorProfile.stripeAccountId && (
                <a
                  href={`https://dashboard.stripe.com/test/connect/accounts/${creatorProfile.stripeAccountId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#3a51fb] hover:underline"
                >
                  View account on Stripe
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                To receive payments you need to connect your bank account via Stripe. The process takes less than 5 minutes.
              </p>
              <StripeOnboardButton />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <DollarSign className="h-4 w-4" />
              Released
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalNet)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <DollarSign className="h-4 w-4" />
              In escrow
            </div>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No payments yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-3 font-medium">Campaign</th>
                  <th className="pb-3 font-medium">Gross</th>
                  <th className="pb-3 font-medium">Commission</th>
                  <th className="pb-3 font-medium">Net</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 text-gray-900">{p.campaign.title}</td>
                    <td className="py-3 text-gray-700">{formatCurrency(p.amountCents)}</td>
                    <td className="py-3 text-red-500">-{formatCurrency(p.commissionCents)}</td>
                    <td className="py-3 font-medium text-gray-900">{formatCurrency(p.netCents)}</td>
                    <td className="py-3">
                      <Badge variant={p.status === "RELEASED" ? "success" : p.status === "DISPUTED" ? "destructive" : "warning"}>
                        {p.status === "RELEASED" ? "Released" : p.status === "ESCROW" ? "In escrow" : p.status === "REFUNDED" ? "Refunded" : "Disputed"}
                      </Badge>
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
