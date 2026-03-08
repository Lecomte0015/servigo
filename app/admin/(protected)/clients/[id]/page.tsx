"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  isBlocked: boolean;
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
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/clients/${id}`)
      .then((r) => r.json())
      .then((j) => {
        const data: ClientDetail = j.data ?? null;
        setClient(data);
        if (data) setIsBlocked(data.isBlocked);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleBlock = async (blocked: boolean) => {
    setBlocking(true);
    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked }),
      });
      if (res.ok) setIsBlocked(blocked);
    } finally {
      setBlocking(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok) {
        router.push("/admin/clients");
      } else {
        alert(json.error ?? "Erreur lors de la suppression");
        setConfirmDelete(false);
      }
    } finally {
      setDeleting(false);
    }
  };

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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#1CA7A6] flex items-center justify-center text-white text-xl font-bold shrink-0">
            {client.firstName[0]}{client.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-[#1F2937]">{client.firstName} {client.lastName}</h1>
              {isBlocked && <Badge variant="neutral">🔴 Suspendu</Badge>}
            </div>
            <p className="text-sm text-gray-500">{client.email}</p>
          </div>
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

      {/* Actions admin */}
      <Card>
        <CardHeader><CardTitle>Actions administrateur</CardTitle></CardHeader>
        <div className="flex flex-col gap-4">
          {/* Bloquer / Débloquer */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium text-[#1F2937]">
                {isBlocked ? "🔴 Compte suspendu" : "🟢 Compte actif"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isBlocked
                  ? "Ce client ne peut plus se connecter à la plateforme."
                  : "Ce client peut accéder normalement à la plateforme."}
              </p>
            </div>
            <button
              onClick={() => handleBlock(!isBlocked)}
              disabled={blocking}
              className={`text-sm px-4 py-2 rounded-[8px] font-medium transition-colors disabled:opacity-50 shrink-0 ${
                isBlocked
                  ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              {blocking ? "…" : isBlocked ? "✓ Réactiver le compte" : "⊘ Suspendre le compte"}
            </button>
          </div>

          {/* Suppression */}
          <div className="pt-4 border-t border-[#E6F2F2]">
            {!confirmDelete ? (
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-red-600">Supprimer le client</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Action irréversible. Toutes les données seront supprimées définitivement.
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm px-4 py-2 rounded-[8px] font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors shrink-0"
                >
                  🗑 Supprimer le compte
                </button>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-[8px] p-4">
                <p className="text-sm font-semibold text-red-700 mb-1">
                  Confirmer la suppression de {client.firstName} {client.lastName} ?
                </p>
                <p className="text-xs text-red-500 mb-3">
                  Cette action est irréversible. Toutes les données (compte, missions) seront supprimées.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-sm px-4 py-2 bg-red-600 text-white rounded-[8px] font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting ? "Suppression…" : "Oui, supprimer définitivement"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-sm px-4 py-2 border border-[#D1E5E5] rounded-[8px] text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

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
