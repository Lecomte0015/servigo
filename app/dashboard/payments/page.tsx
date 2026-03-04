"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, JobStatusBadge } from "@/components/ui/Badge";

interface Artisan {
  companyName: string;
  photoUrl: string | null;
  user: { firstName: string; lastName: string };
}

interface PaymentInfo {
  amount: number;
  status: string;
  platformFee: number;
  stripePaymentIntentId: string;
}

interface PaymentItem {
  jobId: string;
  jobStatus: string;
  category: string;
  categoryIcon: string | null;
  city: string;
  createdAt: string;
  payment: PaymentInfo;
  artisan: Artisan | null;
}

interface Summary {
  totalPaid: number;
  pendingCount: number;
  totalCount: number;
}

const PAYMENT_BADGE: Record<string, { label: string; variant: "success" | "info" | "warning" | "neutral" | "danger" }> = {
  AUTHORIZED: { label: "Pré-autorisé",  variant: "info" },
  CAPTURED:   { label: "Capturé",       variant: "success" },
  RELEASED:   { label: "Libéré",        variant: "success" },
  PENDING:    { label: "En attente",    variant: "warning" },
  REFUNDED:   { label: "Remboursé",     variant: "neutral" },
};

export default function ClientPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PaymentItem | null>(null);

  useEffect(() => {
    fetch("/api/client/payments")
      .then((r) => r.json())
      .then((j) => {
        setPayments(j.data?.payments ?? []);
        setSummary(j.data?.summary ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1F2937]">Mes paiements</h1>
        <p className="text-sm text-gray-500 mt-0.5">Historique de vos transactions</p>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card padding="md">
            <p className="text-xs text-gray-400">Total dépensé</p>
            <p className="text-2xl font-bold text-[#1CA7A6] mt-1">{summary.totalPaid.toFixed(2)} CHF</p>
          </Card>
          <Card padding="md">
            <p className="text-xs text-gray-400">En attente</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{summary.pendingCount}</p>
          </Card>
          <Card padding="md">
            <p className="text-xs text-gray-400">Transactions</p>
            <p className="text-2xl font-bold text-[#1F2937] mt-1">{summary.totalCount}</p>
          </Card>
        </div>
      )}

      {/* Info strip */}
      <div className="bg-[#F4F7F7] border border-[#D1E5E5] rounded-[10px] px-4 py-3 flex items-start gap-3">
        <span>🔒</span>
        <p className="text-xs text-gray-500">
          Vos paiements sont sécurisés par <strong>Stripe</strong>. Le montant est pré-autorisé à la création de la demande et capturé uniquement à la confirmation de la mission.
        </p>
      </div>

      {/* List + detail */}
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 min-w-0">
          <Card padding="none">
            {!payments.length ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">💳</p>
                <p className="text-gray-400 text-sm">Aucun paiement pour l&apos;instant</p>
                <p className="text-xs text-gray-400 mt-1">Vos transactions apparaîtront ici après votre première demande</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-2.5 border-b border-[#E6F2F2] bg-[#F4F7F7]">
                  <span className="text-xs text-gray-400 font-medium">Mission</span>
                  <span className="text-xs text-gray-400 font-medium">Montant</span>
                  <span className="text-xs text-gray-400 font-medium">Statut</span>
                  <span className="text-xs text-gray-400 font-medium">Date</span>
                </div>
                <div className="divide-y divide-[#E6F2F2]">
                  {payments.map((p) => (
                    <button
                      key={p.jobId}
                      onClick={() => setSelected(selected?.jobId === p.jobId ? null : p)}
                      className={`w-full grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-4 py-3 hover:bg-[#F4F7F7] transition-colors text-left ${selected?.jobId === p.jobId ? "bg-[#E6F2F2]" : ""}`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1F2937] truncate">
                          {p.categoryIcon} {p.category}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          📍 {p.city}
                          {p.artisan && ` · ${p.artisan.companyName}`}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-[#1CA7A6] shrink-0">
                        {p.payment.amount.toFixed(2)} CHF
                      </span>
                      <Badge variant={PAYMENT_BADGE[p.payment.status]?.variant ?? "neutral"}>
                        {PAYMENT_BADGE[p.payment.status]?.label ?? p.payment.status}
                      </Badge>
                      <span className="text-xs text-gray-400 shrink-0">
                        {format(new Date(p.createdAt), "d MMM", { locale: fr })}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-full lg:w-72 shrink-0">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm">Détail du paiement</CardTitle>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
                </div>
              </CardHeader>
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Mission</p>
                  <p className="font-medium text-[#1F2937]">{selected.categoryIcon} {selected.category}</p>
                  <p className="text-xs text-gray-400">📍 {selected.city}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Statut mission</p>
                  <JobStatusBadge status={selected.jobStatus} />
                </div>
                {selected.artisan && (
                  <div className="border-t border-[#E6F2F2] pt-3">
                    <p className="text-xs text-gray-400 mb-1">Artisan</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1CA7A6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {selected.artisan.photoUrl ? (
                          <img src={selected.artisan.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          `${selected.artisan.user.firstName[0] || ""}${selected.artisan.user.lastName[0] || ""}`
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#1F2937]">{selected.artisan.companyName}</p>
                        <p className="text-xs text-gray-400">{selected.artisan.user.firstName} {selected.artisan.user.lastName}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="border-t border-[#E6F2F2] pt-3">
                  <p className="text-xs text-gray-400 mb-2">Récapitulatif</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Montant payé</span>
                      <span className="text-xs font-semibold text-[#1CA7A6]">{selected.payment.amount.toFixed(2)} CHF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Statut</span>
                      <Badge variant={PAYMENT_BADGE[selected.payment.status]?.variant ?? "neutral"}>
                        {PAYMENT_BADGE[selected.payment.status]?.label ?? selected.payment.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Date de la demande</p>
                  <p className="text-xs text-[#1F2937]">
                    {format(new Date(selected.createdAt), "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                <div className="bg-[#F4F7F7] rounded-[8px] p-2.5">
                  <p className="text-xs text-gray-400 font-mono break-all">
                    Réf: {selected.payment.stripePaymentIntentId.slice(0, 20)}…
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
