import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactActions } from "./contact-actions";
import { OutreachStatus } from "@prisma/client";
import { ChevronLeft, Music, ExternalLink } from "lucide-react";

const statusLabel: Record<OutreachStatus, string> = {
  PENDING: "Pendente",
  SCORED: "Scored",
  QUEUED: "Na fila",
  SENT: "Enviado",
  OPENED: "Aberto",
  RESPONDED: "Respondeu",
  FEATURED: "Featured",
  INVITED: "Convidado",
  REGISTERED: "Cadastrado",
};

const statusVariant: Record<OutreachStatus, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  PENDING: "secondary",
  SCORED: "default",
  QUEUED: "warning",
  SENT: "warning",
  OPENED: "warning",
  RESPONDED: "success",
  FEATURED: "success",
  INVITED: "success",
  REGISTERED: "success",
};

export default async function OutreachCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const campaign = await prisma.outreachCampaign.findUnique({
    where: { id },
    include: {
      contacts: {
        include: { discoveredCreator: true },
        orderBy: [{ fitScore: "desc" }, { createdAt: "asc" }],
      },
      scrapingJobs: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!campaign) redirect("/outreach");

  const statusCounts = campaign.contacts.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start gap-3">
        <Link href="/outreach" className="mt-1 text-gray-400 hover:text-gray-600 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Music className="h-3.5 w-3.5" />
                  {campaign.artistName} — {campaign.songTitle}
                </span>
                {campaign.songUrl && (
                  <a
                    href={campaign.songUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#3a51fb] hover:underline"
                  >
                    Ouvir <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <Badge variant={campaign.isActive ? "success" : "secondary"} className="ml-1">
                  {campaign.isActive ? "Ativa" : "Inativa"}
                </Badge>
              </div>
            </div>
            <Link href={`/discovery?campaignId=${campaign.id}`}>
              <Button variant="outline" size="sm">+ Descobrir criadores</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {(["PENDING", "SCORED", "SENT", "RESPONDED", "REGISTERED"] as OutreachStatus[]).map((s) => (
          <Card key={s}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-xl font-bold text-gray-900">{statusCounts[s] ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">{statusLabel[s]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contacts table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Contatos ({campaign.contacts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campaign.contacts.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              <p>Nenhum criador adicionado ainda.</p>
              <p className="mt-1 text-gray-400">
                Use a{" "}
                <Link href={`/discovery?campaignId=${campaign.id}`} className="text-[#3a51fb] hover:underline">
                  Descoberta
                </Link>{" "}
                para importar criadores automaticamente.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                    <th className="pb-3 font-medium">Criador</th>
                    <th className="pb-3 font-medium">Plataforma</th>
                    <th className="pb-3 font-medium">Seguidores</th>
                    <th className="pb-3 font-medium">Score</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {campaign.contacts.map((contact) => {
                    const creator = contact.discoveredCreator;
                    return (
                      <tr key={contact.id} className="group">
                        <td className="py-3">
                          <div>
                            <a
                              href={creator.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-gray-900 hover:text-[#3a51fb] hover:underline flex items-center gap-1"
                            >
                              {creator.name}
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                            </a>
                            {creator.handle && (
                              <p className="text-xs text-gray-400">@{creator.handle}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-gray-600">{creator.platform}</td>
                        <td className="py-3 text-gray-600">
                          {creator.followersCount
                            ? creator.followersCount >= 1000
                              ? `${(creator.followersCount / 1000).toFixed(1)}k`
                              : creator.followersCount.toString()
                            : "—"}
                        </td>
                        <td className="py-3">
                          {contact.fitScore != null ? (
                            <span
                              className={`font-semibold ${
                                contact.fitScore >= 70
                                  ? "text-green-600"
                                  : contact.fitScore >= 40
                                  ? "text-yellow-600"
                                  : "text-red-500"
                              }`}
                            >
                              {Math.round(contact.fitScore)}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-3">
                          <Badge variant={statusVariant[contact.status]} className="text-xs">
                            {statusLabel[contact.status]}
                          </Badge>
                        </td>
                        <td className="py-3 text-gray-500 text-xs max-w-[160px] truncate">
                          {creator.email ?? <span className="text-gray-300">sem email</span>}
                        </td>
                        <td className="py-3">
                          <ContactActions
                            contactId={contact.id}
                            status={contact.status}
                            hasEmail={!!creator.email}
                            hasPitch={!!contact.emailBody}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent scraping jobs */}
      {campaign.scrapingJobs.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Jobs de Scraping recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="pb-2 font-medium">Query</th>
                  <th className="pb-2 font-medium">Fonte</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Encontrados</th>
                  <th className="pb-2 font-medium">Novos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {campaign.scrapingJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="py-2 text-gray-900">{job.query}</td>
                    <td className="py-2 text-gray-500">{job.source}</td>
                    <td className="py-2">
                      <Badge
                        variant={
                          job.status === "COMPLETED"
                            ? "success"
                            : job.status === "FAILED"
                            ? "destructive"
                            : job.status === "RUNNING"
                            ? "warning"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-2 text-gray-600">{job.totalFound ?? "—"}</td>
                    <td className="py-2 text-gray-600">{job.totalNew ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
