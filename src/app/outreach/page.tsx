import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Music, Users } from "lucide-react";

export default async function OutreachPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const campaigns = await prisma.outreachCampaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { contacts: true, scrapingJobs: true } },
      contacts: { select: { status: true } },
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outreach Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie campanhas de cold email para criadores</p>
        </div>
        <Link href="/outreach/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Campanha
          </Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Music className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">Nenhuma campanha de outreach criada.</p>
            <Link href="/outreach/new" className="mt-4 inline-block">
              <Button size="sm">Criar primeira campanha</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => {
            const scored = c.contacts.filter((x) => x.status !== "PENDING").length;
            const sent = c.contacts.filter((x) => ["SENT", "OPENED", "RESPONDED", "INVITED", "REGISTERED"].includes(x.status)).length;
            const responded = c.contacts.filter((x) => ["RESPONDED", "INVITED", "REGISTERED"].includes(x.status)).length;

            return (
              <Card key={c.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{c.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {c.artistName} — {c.songTitle}
                      </p>
                    </div>
                    <Badge variant={c.isActive ? "success" : "secondary"}>
                      {c.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {c._count.contacts} contatos
                    </span>
                    <span>{scored} scored</span>
                    <span>{sent} enviados</span>
                    <span className="font-medium text-[#3a51fb]">{responded} responderam</span>
                    <span className="ml-auto text-gray-400 text-xs">
                      Gênero: {c.genre}
                    </span>
                  </div>
                  <Link href={`/outreach/${c.id}`}>
                    <Button variant="outline" size="sm">Ver detalhes</Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
