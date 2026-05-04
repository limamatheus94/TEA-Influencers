import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrapingJobStatus } from "@prisma/client";
import { ScrapeForm } from "./scrape-form";

const statusVariant: Record<ScrapingJobStatus, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  PENDING: "secondary",
  RUNNING: "warning",
  COMPLETED: "success",
  FAILED: "destructive",
};

export default async function DiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ campaignId?: string }>;
}) {
  const { campaignId } = await searchParams;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [campaigns, jobs] = await Promise.all([
    prisma.outreachCampaign.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, genre: true, targetPlatforms: true },
    }),
    prisma.scrapingJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        outreachCampaign: { select: { title: true } },
      },
    }),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Descoberta de Criadores</h1>
        <p className="text-sm text-gray-500 mt-1">
          Dispare scraping no Spotify e YouTube para encontrar criadores relevantes
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <ScrapeForm campaigns={campaigns} defaultCampaignId={campaignId} />
        </div>

        <div className="col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Jobs recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">Nenhum job executado ainda.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                      <th className="pb-2 font-medium">Campanha</th>
                      <th className="pb-2 font-medium">Query</th>
                      <th className="pb-2 font-medium">Fonte</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Novos</th>
                      <th className="pb-2 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td className="py-2 text-gray-900 max-w-[140px] truncate" title={job.outreachCampaign.title}>
                          {job.outreachCampaign.title}
                        </td>
                        <td className="py-2 text-gray-600 max-w-[120px] truncate" title={job.query}>
                          {job.query}
                        </td>
                        <td className="py-2 text-gray-500">{job.source}</td>
                        <td className="py-2">
                          <Badge variant={statusVariant[job.status]} className="text-xs">
                            {job.status}
                          </Badge>
                        </td>
                        <td className="py-2 text-gray-600">
                          {job.totalNew != null ? (
                            <span className="font-medium text-[#3a51fb]">+{job.totalNew}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2 text-gray-400 text-xs">
                          {new Date(job.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
