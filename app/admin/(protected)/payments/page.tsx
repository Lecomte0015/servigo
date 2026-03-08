"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Payment {
  id: string;
  amount: number;
  platformFee: number;
  status: string;
  createdAt: string;
  job: {
    id: string;
    status: string;
    city: string;
    category: { name: string };
    client: { firstName: string; lastName: string; email: string };
    assignment: { artisan: { companyName: string } } | null;
  };
}

interface Summary {
  totalAmount: number;
  totalFees: number;
  totalCount: number;
}

const STATUS_FILTERS = [
  { value: "", label: "Tous" },
  { value: "AUTHORIZED", label: "Autorisé" },
  { value: "CAPTURED", label: "Encaissé" },
  { value: "RELEASED", label: "Libéré" },
  { value: "REFUNDED", label: "Remboursé" },
];

const PAYMENT_BADGE: Record<string, { label: string; variant: "success" | "info" | "warning" | "neutral" | "danger" }> = {
  AUTHORIZED: { label: "Autorisé", variant: "info" },
  CAPTURED: { label: "Encaissé", variant: "success" },
  RELEASED: { label: "Libéré", variant: "success" },
  PENDING: { label: "En attente", variant: "warning" },
  REFUNDED: { label: "Remboursé", variant: "neutral" },
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Payment | null>(null);
  const limit = 20;

  const fetchPayments = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/payments?${params}`)
      .then((r) => r.json())
      .then((j) => {
        setPayments(j.data?.payments ?? []);
        setTotal(j.data?.total ?? 0);
        setSummary(j.data?.summary ?? null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { fetchPayments(); }, [statusFilter, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1F2937]">Paiements</h1>
        <p className="text-sm text-gray-500 mt-0.5">{total} transaction{total > 1 ? "s" : ""}</p>
      </div>

      {/* Summary KPIs */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card padding="md">
            <p className="text-xs text-gray-400">Volume total</p>
            <p className="text-2xl font-bold text-[#1CA7A6] mt-1">{summary.totalAmount.toFixed(0)} CHF</p>
          </Card>
          <Card padding="md">
            <p className="text-xs text-gray-400">Commission GoServi (15%)</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{summary.totalFees.toFixed(0)} CHF</p>
          </Card>
          <Card padding="md">
            <p className="text-xs text-gray-400">Transactions</p>
            <p className="text-2xl font-bold text-[#1F2937] mt-1">{summary.totalCount}</p>
          </Card>
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-1 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === f.value
                ? "bg-[#1CA7A6] text-white border-[#1CA7A6]"
                : "bg-white text-gray-600 border-[#D1E5E5] hover:border-[#1CA7A6] hover:text-[#1CA7A6]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table + detail */}
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 min-w-0">
          <Card padding="none">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
              </div>
            ) : !payments.length ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">💳</p>
                <p className="text-gray-400 text-sm">Aucun paiement</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <div className="min-w-[540px]">
                    <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-3 px-4 py-2.5 border-b border-[#E6F2F2] bg-[#F4F7F7]">
                      <span className="text-xs text-gray-400 font-medium">Client</span>
                      <span className="text-xs text-gray-400 font-medium">Mission</span>
                      <span className="text-xs text-gray-400 font-medium">Montant</span>
                      <span className="text-xs text-gray-400 font-medium">Statut</span>
                      <span className="text-xs text-gray-400 font-medium">Date</span>
                    </div>
                    <div className="divide-y divide-[#E6F2F2]">
                      {payments.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelected(selected?.id === p.id ? null : p)}
                          className={`w-full grid grid-cols-[1fr_1fr_auto_auto_auto] gap-3 items-center px-4 py-3 hover:bg-[#F4F7F7] transition-colors text-left ${selected?.id === p.id ? "bg-[#E6F2F2]" : ""}`}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#1F2937] truncate">
                              {p.job.client.firstName} {p.job.client.lastName}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{p.job.client.email}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-[#1F2937] truncate">{p.job.category.name}</p>
                            <p className="text-xs text-gray-400 truncate">📍 {p.job.city}</p>
                          </div>
                          <span className="text-sm font-semibold text-[#1CA7A6] shrink-0">
                            {p.amount.toFixed(0)} CHF
                          </span>
                          <Badge variant={PAYMENT_BADGE[p.status]?.variant ?? "neutral"}>
                            {PAYMENT_BADGE[p.status]?.label ?? p.status}
                          </Badge>
                          <span className="text-xs text-gray-400 shrink-0">
                            {format(new Date(p.createdAt), "d MMM", { locale: fr })}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-[#E6F2F2]">
                    <span className="text-xs text-gray-500">Page {page} / {totalPages}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs border border-[#D1E5E5] rounded-[6px] disabled:opacity-40 hover:border-[#1CA7A6] transition-colors">← Précédent</button>
                      <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs border border-[#D1E5E5] rounded-[6px] disabled:opacity-40 hover:border-[#1CA7A6] transition-colors">Suivant →</button>
                    </div>
                  </div>
                )}
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
                  <p className="text-xs text-gray-400 mb-0.5">Statut</p>
                  <Badge variant={PAYMENT_BADGE[selected.status]?.variant ?? "neutral"}>
                    {PAYMENT_BADGE[selected.status]?.label ?? selected.status}
                  </Badge>
                </div>
                <div className="border-t border-[#E6F2F2] pt-3">
                  <p className="text-xs text-gray-400 mb-0.5">Montant total</p>
                  <p className="text-xl font-bold text-[#1CA7A6]">{selected.amount.toFixed(2)} CHF</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Commission (15%)</p>
                  <p className="font-medium text-green-600">{selected.platformFee.toFixed(2)} CHF</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Net artisan</p>
                  <p className="font-medium text-[#1F2937]">{(selected.amount - selected.platformFee).toFixed(2)} CHF</p>
                </div>
                <div className="border-t border-[#E6F2F2] pt-3">
                  <p className="text-xs text-gray-400 mb-0.5">Client</p>
                  <p className="font-medium text-[#1F2937]">{selected.job.client.firstName} {selected.job.client.lastName}</p>
                  <p className="text-xs text-gray-400">{selected.job.client.email}</p>
                </div>
                {selected.job.assignment && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Artisan</p>
                    <p className="font-medium text-[#1F2937]">{selected.job.assignment.artisan.companyName}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Mission</p>
                  <p className="text-[#1F2937]">{selected.job.category.name} — {selected.job.city}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Date</p>
                  <p className="text-[#1F2937]">{format(new Date(selected.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
