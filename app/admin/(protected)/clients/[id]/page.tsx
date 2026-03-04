"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { JobStatusBadge, Badge } from "@/components/ui/Badge";

interface Payment {
  amount: number;
  status: string;
  platformFee: number;
}

interface ClientJob {
  id: string;
  status: string;
  city: string;
  createdAt: string;
  category: { name: string; icon: string | null };
  assignment: { artisan: { companyName: string } } | null;
  payment: Payment | null;
}

interface ClientDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  totalSpent: number;
  jobRequests: ClientJob[];
}

const PAYMENT_STATUS: Record<string, { label: string; variant: "success" | "info" | "warning" | "neutral" }> = {
  CAPTURED: { label: "Encaissé", variant: "success" },
  RELEASED: { label: "Libéré", variant: "success" },
  AUTHORIZED: { label: "Autorisé", variant: "info" },
  PENDING: { label: "En attente", variant: "warning" },
  REFUNDED: { label: "Remboursé", variant: "neutral" },
};

export default function AdminClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/clients/${id}`)
      .then((r) => r.json())
      .then((j) => setClient(j.data ?? null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Client introuvable</p>
        <Link href="/admin/clients" className="text-sm text-[#1CA7A6] mt-2 block hover:underline">← Retour</Link>
      </div>
    );
  }

  const completedJobs = client.jobRequests.filter((j) => j.status === "COMPLETED").length;

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/admin/clients" className="text-gray-400 hover:text-[#1CA7A6] transition-colors text-sm">← Clients</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-[#1F2937]">{client.firstName} {client.lastName}</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#1CA7A6] flex items-center justify-center text-white text-xl font-bold shrink-0">
          {client.firstName[0]}{client.lastName[0]}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[#1F2937]">{client.firstName} {client.lastName}</h1>
          <p className="text-sm text-gray-500">{client.email}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Missions", value: client.jobRequests.length, color: "text-[#1CA7A6]" },
          { label: "Terminées", value: completedJobs, color: "text-green-600" },
          { label: "Total dépensé", value: `${client.totalSpent.toFixed(0)} CHF`, color: "text-[#1F2937]" },
          { label: "Membre depuis", value: format(new Date(client.createdAt), "MMM yyyy", { locale: fr }), color: "text-gray-500" },
        ].map((kpi) => (
          <Card key={kpi.label} padding="md">
            <p className="text-xs text-gray-400 mb-1">{kpi.label}</p>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <div className="flex flex-col gap-2 text-sm">
            <div><span className="text-xs text-gray-400">Nom complet</span><p className="text-[#1F2937]">{client.firstName} {client.lastName}</p></div>
            <div><span className="text-xs text-gray-400">Email</span><p className="text-[#1F2937]">{client.email}</p></div>
            {client.phone && <div><span className="text-xs text-gray-400">Téléphone</span><a href={`tel:${client.phone}`} className="text-[#1CA7A6] hover:underline">{client.phone}</a></div>}
            <div><span className="text-xs text-gray-400">Inscrit le</span><p className="text-[#1F2937]">{format(new Date(client.createdAt), "d MMMM yyyy", { locale: fr })}</p></div>
          </div>
        </Card>
      </div>

      {/* Job history */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des missions ({client.jobRequests.length})</CardTitle>
        </CardHeader>
        {client.jobRequests.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune mission</p>
        ) : (
          <div className="flex flex-col divide-y divide-[#E6F2F2]">
            {client.jobRequests.map((job) => (
              <div key={job.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-medium text-[#1F2937]">
                      {job.category.icon} {job.category.name}
                    </span>
                    <JobStatusBadge status={job.status} />
                  </div>
                  <p className="text-xs text-gray-400">📍 {job.city} · {format(new Date(job.createdAt), "d MMM yyyy", { locale: fr })}</p>
                  {job.assignment && (
                    <p className="text-xs text-gray-500 mt-0.5">Artisan: {job.assignment.artisan.companyName}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {job.payment ? (
                    <>
                      <p className="text-sm font-semibold text-[#1CA7A6]">{job.payment.amount.toFixed(0)} CHF</p>
                      <Badge variant={PAYMENT_STATUS[job.payment.status]?.variant ?? "neutral"}>
                        {PAYMENT_STATUS[job.payment.status]?.label ?? job.payment.status}
                      </Badge>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
