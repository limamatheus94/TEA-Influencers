import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigForm } from "./config-form";

export default async function AdminConfigPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user || user.role !== "ADMIN") redirect("/");

  const config = await prisma.platformConfig.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage the commission rate and other platform settings.</p>
      </div>

      <div className="max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commission rate</CardTitle>
          </CardHeader>
          <CardContent>
            {config ? (
              <div className="mb-6 rounded-lg bg-[#3a51fb]/5 border border-[#3a51fb]/20 px-4 py-3">
                <p className="text-xs text-[#3a51fb] font-medium uppercase tracking-wide">Current rate</p>
                <p className="text-3xl font-bold text-[#3a51fb] mt-1">
                  {(config.commissionRate * 100).toFixed(1)}%
                </p>
                {config.updatedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Updated on {new Date(config.updatedAt).toLocaleDateString("en-US")}
                  </p>
                )}
              </div>
            ) : (
              <p className="mb-4 text-sm text-gray-500">No configuration found. Set the initial rate below.</p>
            )}
            <ConfigForm config={config ? { id: config.id, commissionRate: config.commissionRate } : null} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
