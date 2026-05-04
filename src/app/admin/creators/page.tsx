import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApproveButton, RejectButton } from "./creator-actions";
import { Users, Globe, Music, DollarSign } from "lucide-react";

export default async function AdminCreatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (user?.role !== "ADMIN") redirect("/");

  const { status = "PENDING" } = await searchParams;

  const creators = await prisma.creatorProfile.findMany({
    where: { approvalStatus: status as "PENDING" | "APPROVED" | "REJECTED" },
    include: {
      platforms: true,
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const counts = await prisma.creatorProfile.groupBy({
    by: ["approvalStatus"],
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.approvalStatus, c._count]));

  const tabs = [
    { key: "PENDING", label: "Pending" },
    { key: "APPROVED", label: "Approved" },
    { key: "REJECTED", label: "Rejected" },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Creator Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">Review and approve influencer profiles before they appear on the marketplace.</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/creators?status=${t.key}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              status === t.key
                ? "border-[#3a51fb] text-[#3a51fb]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
              status === t.key ? "bg-[#3a51fb] text-white" : "bg-gray-100 text-gray-600"
            }`}>
              {countMap[t.key] ?? 0}
            </span>
          </Link>
        ))}
      </div>

      {creators.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <Users className="mx-auto h-10 w-10 mb-3" />
          <p className="text-sm">No {status.toLowerCase()} creators.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {creators.map((creator) => (
            <Card key={creator.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{creator.displayName}</p>
                      <Badge variant="outline" className="text-xs">{creator.user.email}</Badge>
                    </div>

                    {creator.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <Globe className="h-3 w-3" />
                        {creator.location}
                      </div>
                    )}

                    {/* Platforms summary */}
                    {creator.platforms.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {creator.platforms.map((p) => (
                          <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-md bg-gray-50 px-3 py-2 text-sm">
                            <Badge variant="outline" className="text-xs font-bold">{p.platform}</Badge>
                            <span className="font-medium text-gray-800">@{p.handle}</span>
                            {p.followersCount && (
                              <span className="flex items-center gap-1 text-gray-600 text-xs">
                                <Users className="h-3 w-3" />
                                {p.followersCount.toLocaleString()}
                              </span>
                            )}
                            {p.pricePerPostCents && (
                              <span className="flex items-center gap-1 text-gray-600 text-xs">
                                <DollarSign className="h-3 w-3" />
                                {(p.pricePerPostCents / 100).toFixed(0)}{p.currency}
                              </span>
                            )}
                            {p.genres.length > 0 && (
                              <span className="flex items-center gap-1 text-gray-500 text-xs">
                                <Music className="h-3 w-3" />
                                {p.genres.slice(0, 3).join(", ")}{p.genres.length > 3 ? "…" : ""}
                              </span>
                            )}
                            {p.profileCategory && (
                              <span className="text-xs text-[#3a51fb] font-medium">{p.profileCategory}</span>
                            )}
                            {p.url && (
                              <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3a51fb] hover:underline truncate max-w-[200px]">
                                {p.url.replace("https://", "")}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {creator.rejectedReason && (
                      <p className="mt-2 text-xs text-red-600">
                        <strong>Rejection reason:</strong> {creator.rejectedReason}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {status === "PENDING" && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <ApproveButton creatorId={creator.id} />
                      <RejectButton creatorId={creator.id} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
