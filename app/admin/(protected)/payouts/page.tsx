"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PayoutArtisan {
  companyName: string;
  city: string;
  user: { firstName: string; lastName: string; email: string };
}

interface Payout {
  id: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  iban: string;
  accountHolder: string;
  adminNotes: string | null;
  processedAt: string | null;
  createdAt: string;
  artisan: PayoutArtisan;
}

interface Summary {
  PENDING?:    { total: number; count: number };
  PROCESSING?: { total: number; count: number };
  COMPLETED?:  { total: number; count: number };
  FAILED?:     { total: number; count: number };
}

const STATUS_BADGE: Record<string, { label: string; variant: "warning" | "info" | "success" | "danger" | "neutral" }> = {
  PENDING:    { label: "En attente",    variant: "warning" },
  PROCESSING: { label: "En traitement", variant: "info" },
  COMPLETED:  { label: "Viré",          variant: "success" },
  FAILED:     { label: "Échoué",        variant: "danger" },
};

const FILTER_OPTIONS = ["ALL", "PENDING", "PROCESSING", "COMPLETED", "FAILED"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<Summary>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [selected, setSelected] = useState<Payout | null>(null);
  const [actioning, setActioning] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchPayouts = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payouts?status=${status}`);
      const json = await res.json();
      setPayouts(json.data?.payouts ?? []);
      setSummary(json.data?.summary ?? {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayouts(filter);
  }, [filter, fetchPayouts]);

  const handleAction = async (status: "PROCESSING" | "COMPLETED" | "FAILED") => {
    if (!selected) return;
    setActioning(true);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/payouts/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: adminNotes.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        setActionError(json.error || "Erreur lors de la mise à jour");
      } else {
        setSelected(null);
        setAdminNotes("");
        await fetchPayouts(filter);
      }
    } catch {
      setActionError("Erreur réseau");
    } finally {
      setActioning(false);
    }
  };

  const totalPending = (summary.PENDING?.total ?? 0) + (summary.PROCESSING?.total ?? 0);
  const countPending = (summary.PENDING?.count ?? 0) + (summary.PROCESSING?.count ?? 0);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-[#1F2937]">Retraits artisans</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gérez les demandes de virement bancaire</p>
      </div>

      {/* ── Summary KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card padding="md">
          <p className="text-xs text-gray-400">À traiter</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{countPending}</p>
          <p className="text-xs text-gray-400 mt-0.5">{totalPending.toFixed(2)} CHF</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-gray-400">Virés (total)</p>
          <p className="text-2xl font-bold text-[#1CA7A6] mt-1">
            {(summary.COMPLETED?.total ?? 0).toFixed(2)} CHF
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{summary.COMPLETED?.count ?? 0} virement{(summary.COMPLETED?.count ?? 0) > 1 ? "s" : ""}</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-gray-400">En traitement</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{summary.PROCESSING?.count ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">{(summary.PROCESSING?.total ?? 0).toFixed(2)} CHF</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-gray-400">Échoués</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{summary.FAILED?.count ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">{(summary.FAILED?.total ?? 0).toFixed(2)} CHF</p>
        </Card>
      </div>

      {/* ── Process instructions ── */}
      <div className="bg-[#F4F7F7] border border-[#D1E5E5] rounded-[10px] px-4 py-3 text-xs text-gray-500">
        🏦 <strong>Procédure :</strong> Passez le statut à <em>En traitement</em> pendant l&apos;exécution du virement bancaire,
        puis <em>Viré</em> une fois confirmé. L&apos;artisan reçoit une notification à chaque étape.
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setSelected(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === s
                ? "bg-[#1CA7A6] text-white"
                : "bg-[#F4F7F7] text-gray-500 hover:bg-[#E6F2F2]"
            }`}
          >
            {s === "ALL" ? "Tous" : STATUS_BADGE[s]?.label ?? s}
            {s === "PENDING" && (summary.PENDING?.count ?? 0) > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white rounded-full text-[10px] px-1.5 py-0.5">
                {summary.PENDING?.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* List */}
        <div className="flex-1 min-w-0">
          <Card padding="none">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-gray-400 text-sm">Aucun retrait dans cette catégorie</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-2.5 border-b border-[#E6F2F2] bg-[#F4F7F7]">
                  <span className="text-xs text-gray-400 font-medium">Artisan</span>
                  <span className="text-xs text-gray-400 font-medium">Montant</span>
                  <span className="text-xs text-gray-400 font-medium">Statut</span>
                  <span className="text-xs text-gray-400 font-medium">Date</span>
                </div>
                <div className="divide-y divide-[#E6F2F2]">
                  {payouts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelected(selected?.id === p.id ? null : p);
                        setAdminNotes(p.adminNotes || "");
                        setActionError("");
                      }}
                      className={`w-full grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-4 py-3 hover:bg-[#F4F7F7] transition-colors text-left ${
                        selected?.id === p.id ? "bg-[#E6F2F2]" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1F2937] truncate">
                          {p.artisan.companyName}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {p.artisan.user.firstName} {p.artisan.user.lastName} · 📍 {p.artisan.city}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-[#1CA7A6] shrink-0">
                        {p.amount.toFixed(2)} CHF
                      </span>
                      <Badge variant={STATUS_BADGE[p.status]?.variant ?? "neutral"}>
                        {STATUS_BADGE[p.status]?.label ?? p.status}
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

        {/* Detail + Action Panel */}
        {selected && (
          <div className="w-full lg:w-80 shrink-0">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm">Traitement du retrait</CardTitle>
                  <button
                    onClick={() => { setSelected(null); setAdminNotes(""); setActionError(""); }}
                    className="text-gray-400 hover:text-gray-600 text-lg"
                  >
                    ×
                  </button>
                </div>
              </CardHeader>

              <div className="flex flex-col gap-4 text-sm">
                {/* Artisan */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Artisan</p>
                  <p className="font-medium text-[#1F2937]">{selected.artisan.companyName}</p>
                  <p className="text-xs text-gray-400">
                    {selected.artisan.user.firstName} {selected.artisan.user.lastName}
                  </p>
                  <p className="text-xs text-gray-400">{selected.artisan.user.email}</p>
                </div>

                {/* Bank details */}
                <div className="bg-[#F4F7F7] rounded-[8px] p-3">
                  <p className="text-xs text-gray-400 mb-1 font-medium">Coordonnées bancaires</p>
                  <p className="text-xs text-gray-600">{selected.accountHolder}</p>
                  <p className="text-xs font-mono text-[#1F2937] mt-0.5 break-all">{selected.iban}</p>
                </div>

                {/* Amount */}
                <div className="border-t border-[#E6F2F2] pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Montant à virer</span>
                    <span className="text-lg font-bold text-[#1CA7A6]">
                      {selected.amount.toFixed(2)} CHF
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">Statut actuel</span>
                    <Badge variant={STATUS_BADGE[selected.status]?.variant ?? "neutral"}>
                      {STATUS_BADGE[selected.status]?.label ?? selected.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Demande du {format(new Date(selected.createdAt), "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>

                {/* Admin notes */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Notes admin (optionnel)</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Ex: Virement réf. TRX-2024-001, motif de refus…"
                    className="w-full border border-[#D1E5E5] rounded-[8px] px-3 py-2 text-xs resize-none h-16 focus:outline-none focus:border-[#1CA7A6]"
                  />
                </div>

                {actionError && (
                  <p className="text-xs text-red-500">{actionError}</p>
                )}

                {/* Action buttons based on current status */}
                {selected.status === "PENDING" && (
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      loading={actioning}
                      onClick={() => handleAction("PROCESSING")}
                    >
                      🔄 Démarrer le traitement
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-200 hover:border-red-400"
                      loading={actioning}
                      onClick={() => handleAction("FAILED")}
                    >
                      ✗ Refuser
                    </Button>
                  </div>
                )}

                {selected.status === "PROCESSING" && (
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      loading={actioning}
                      onClick={() => handleAction("COMPLETED")}
                    >
                      ✅ Confirmer le virement
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-200 hover:border-red-400"
                      loading={actioning}
                      onClick={() => handleAction("FAILED")}
                    >
                      ✗ Marquer comme échoué
                    </Button>
                  </div>
                )}

                {(selected.status === "COMPLETED" || selected.status === "FAILED") && (
                  <div className="bg-[#F4F7F7] rounded-[8px] px-3 py-2 text-xs text-gray-500">
                    {selected.status === "COMPLETED"
                      ? "✅ Ce retrait a été traité et viré avec succès."
                      : "❌ Ce retrait a échoué ou a été refusé."}
                    {selected.processedAt && (
                      <p className="mt-0.5">
                        Le {format(new Date(selected.processedAt), "d MMM yyyy", { locale: fr })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
