"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  jobId: string;
  category: string;
  categoryIcon: string | null;
  client: string;
  jobStatus: string;
  paymentStatus: string | null;
  gross: number;
  fee: number;
  net: number;
  acceptedAt: string | null;
  completedAt: string | null;
}

interface WalletData {
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  completedCount: number;
  transactions: Transaction[];
}

interface BankAccount {
  iban: string | null;
  ibanFull: string | null;
  accountHolder: string | null;
  hasBankAccount: boolean;
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
}

const PAYMENT_BADGE: Record<string, { label: string; variant: "success" | "info" | "warning" | "neutral" }> = {
  RELEASED:   { label: "Disponible",   variant: "success" },
  CAPTURED:   { label: "En attente",   variant: "info" },
  AUTHORIZED: { label: "Autorisé",     variant: "info" },
  PENDING:    { label: "En attente",   variant: "warning" },
  REFUNDED:   { label: "Remboursé",    variant: "neutral" },
};

const PAYOUT_STATUS: Record<string, { label: string; variant: "warning" | "info" | "success" | "danger" }> = {
  PENDING:    { label: "En attente",    variant: "warning" },
  PROCESSING: { label: "En traitement", variant: "info" },
  COMPLETED:  { label: "Viré",          variant: "success" },
  FAILED:     { label: "Échoué",        variant: "danger" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProWalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  // Bank form state
  const [showBankForm, setShowBankForm] = useState(false);
  const [ibanInput, setIbanInput] = useState("");
  const [holderInput, setHolderInput] = useState("");
  const [bankSaving, setBankSaving] = useState(false);
  const [bankError, setBankError] = useState("");
  const [bankSuccess, setBankSuccess] = useState(false);

  // Payout form state
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutSaving, setPayoutSaving] = useState(false);
  const [payoutError, setPayoutError] = useState("");
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [wRes, bRes, pRes] = await Promise.all([
        fetch("/api/artisan/wallet").then((r) => r.json()),
        fetch("/api/artisan/bank-account").then((r) => r.json()),
        fetch("/api/artisan/payouts").then((r) => r.json()),
      ]);
      if (wRes.data) setWallet(wRes.data);
      if (bRes.data) {
        setBankAccount(bRes.data);
        if (bRes.data.ibanFull) setIbanInput(bRes.data.ibanFull);
        if (bRes.data.accountHolder) setHolderInput(bRes.data.accountHolder);
      }
      if (pRes.data) setPayouts(pRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Available balance (after subtracting paid-out amounts) ──
  const completedPayouts = payouts.reduce(
    (sum, p) => (p.status === "COMPLETED" ? sum + p.amount : sum),
    0
  );
  const realAvailable = Math.max(0, (wallet?.availableBalance ?? 0) - completedPayouts);

  const hasPendingPayout = payouts.some(
    (p) => p.status === "PENDING" || p.status === "PROCESSING"
  );

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankError("");
    setBankSaving(true);
    try {
      const res = await fetch("/api/artisan/bank-account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ iban: ibanInput.trim(), accountHolder: holderInput.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setBankError(json.error || "Erreur lors de la sauvegarde");
      } else {
        setBankSuccess(true);
        setShowBankForm(false);
        await fetchAll();
        setTimeout(() => setBankSuccess(false), 3000);
      }
    } catch {
      setBankError("Erreur réseau");
    } finally {
      setBankSaving(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError("");
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < 10) {
      setPayoutError("Montant minimum : 10 CHF");
      return;
    }
    setPayoutSaving(true);
    try {
      const res = await fetch("/api/artisan/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPayoutError(json.error || "Erreur lors de la demande");
      } else {
        setPayoutSuccess(true);
        setShowPayoutForm(false);
        setPayoutAmount("");
        await fetchAll();
        setTimeout(() => setPayoutSuccess(false), 4000);
      }
    } catch {
      setPayoutError("Erreur réseau");
    } finally {
      setPayoutSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-[#1F2937]">Mon Wallet</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gérez votre solde et demandez des retraits</p>
      </div>

      {/* ── Balance Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="border-[#1CA7A6] border-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Disponible</p>
              <p className="text-3xl font-bold text-[#1CA7A6] mt-1">
                {realAvailable.toFixed(2)} CHF
              </p>
              <p className="text-xs text-gray-400 mt-1">Prêt à être retiré</p>
            </div>
            <div className="w-9 h-9 rounded-[8px] bg-[#E6F2F2] flex items-center justify-center text-[#1CA7A6] shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {(wallet?.pendingBalance ?? 0).toFixed(2)} CHF
              </p>
              <p className="text-xs text-gray-400 mt-1">Missions en cours</p>
            </div>
            <div className="w-9 h-9 rounded-[8px] bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">Total gagné</p>
              <p className="text-2xl font-bold text-[#1F2937] mt-1">
                {(wallet?.totalEarned ?? 0).toFixed(2)} CHF
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {wallet?.completedCount ?? 0} mission{(wallet?.completedCount ?? 0) > 1 ? "s" : ""}
              </p>
            </div>
            <div className="w-9 h-9 rounded-[8px] bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Commission Info ── */}
      <div className="bg-[#F4F7F7] border border-[#D1E5E5] rounded-[10px] px-4 py-3 flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-[#E6F2F2] flex items-center justify-center text-[#1CA7A6] shrink-0 mt-0.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-[#1F2937]">Commission GoServi</p>
          <p className="text-xs text-gray-500 mt-0.5">
            GoServi prélève <strong>15%</strong> sur chaque mission complétée. Le montant net vous est reversé après validation du paiement.
            Le solde devient <span className="text-[#1CA7A6] font-medium">disponible</span> une fois la mission entièrement réglée par le client.
          </p>
        </div>
      </div>

      {/* Success banners */}
      {bankSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-[10px] px-4 py-3 text-sm text-green-700">
          Coordonnées bancaires enregistrées avec succès.
        </div>
      )}
      {payoutSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-[10px] px-4 py-3 text-sm text-green-700">
          Demande de retrait enregistrée. Traitement sous 1-3 jours ouvrés.
        </div>
      )}

      {/* ── Bank Account ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Compte bancaire (IBAN)</CardTitle>
            <button
              onClick={() => { setShowBankForm((v) => !v); setBankError(""); }}
              className="text-sm text-[#1CA7A6] hover:underline"
            >
              {bankAccount?.hasBankAccount ? "Modifier" : "+ Ajouter"}
            </button>
          </div>
        </CardHeader>

        {!showBankForm && (
          bankAccount?.hasBankAccount ? (
            <div className="flex flex-col gap-2 text-sm">
              <div>
                <span className="text-xs text-gray-400">Titulaire</span>
                <p className="text-[#1F2937] font-medium">{bankAccount.accountHolder}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">IBAN</span>
                <p className="font-mono text-[#1F2937] tracking-wider">{bankAccount.iban}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              ⚠️ Aucun compte bancaire configuré. Ajoutez votre IBAN pour pouvoir retirer vos gains.
            </p>
          )
        )}

        {showBankForm && (
          <form onSubmit={handleSaveBank} className="flex flex-col gap-3 mt-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Titulaire du compte <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={holderInput}
                onChange={(e) => setHolderInput(e.target.value)}
                placeholder="Jean Dupont ou Dupont SÀRL"
                className="w-full border border-[#D1E5E5] rounded-[8px] px-3 py-2 text-sm focus:outline-none focus:border-[#1CA7A6]"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                IBAN <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={ibanInput}
                onChange={(e) => setIbanInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                placeholder="CH9300762011623852957"
                className="w-full border border-[#D1E5E5] rounded-[8px] px-3 py-2 text-sm font-mono tracking-wider focus:outline-none focus:border-[#1CA7A6]"
                maxLength={34}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Format : 2 lettres pays + 2 chiffres contrôle + numéro (ex: CH93 0076 2011 6238 5295 7)
              </p>
            </div>
            {bankError && <p className="text-sm text-red-500">{bankError}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={bankSaving}>
                Enregistrer
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => { setShowBankForm(false); setBankError(""); }}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* ── Request Payout ── */}
      <Card>
        <CardHeader>
          <CardTitle>Demander un virement</CardTitle>
        </CardHeader>

        {!bankAccount?.hasBankAccount ? (
          <div className="bg-amber-50 border border-amber-200 rounded-[8px] px-4 py-3 text-sm text-amber-700">
            Configurez d&apos;abord vos coordonnées bancaires ci-dessus pour demander un retrait.
          </div>
        ) : realAvailable < 10 ? (
          <div className="bg-[#F4F7F7] border border-[#D1E5E5] rounded-[8px] px-4 py-3 text-sm text-gray-500">
            Solde insuffisant. Minimum de retrait : <strong>10 CHF</strong>.
            Votre solde disponible : <strong>{realAvailable.toFixed(2)} CHF</strong>.
          </div>
        ) : hasPendingPayout ? (
          <div className="bg-amber-50 border border-amber-200 rounded-[8px] px-4 py-3 text-sm text-amber-700">
            Un retrait est déjà en cours de traitement. Vous pourrez en faire un nouveau une fois celui-ci traité.
          </div>
        ) : !showPayoutForm ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">
                Solde disponible :{" "}
                <span className="font-semibold text-[#1CA7A6]">{realAvailable.toFixed(2)} CHF</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Vers : {bankAccount.accountHolder} · IBAN se terminant par {bankAccount.iban?.slice(-4)}
              </p>
            </div>
            <Button size="sm" onClick={() => { setShowPayoutForm(true); setPayoutError(""); }}>
              Retirer
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRequestPayout} className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Montant à retirer (CHF) — min. 10 CHF · max. {realAvailable.toFixed(2)} CHF
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max={realAvailable.toFixed(2)}
                  step="0.01"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 border border-[#D1E5E5] rounded-[8px] px-3 py-2 text-sm focus:outline-none focus:border-[#1CA7A6]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPayoutAmount(realAvailable.toFixed(2))}
                  className="text-xs text-[#1CA7A6] hover:underline shrink-0"
                >
                  Tout retirer
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Virement vers : <strong>{bankAccount.accountHolder}</strong>
              </p>
            </div>
            {payoutError && <p className="text-sm text-red-500">{payoutError}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={payoutSaving}>
                ✓ Confirmer le retrait
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => { setShowPayoutForm(false); setPayoutError(""); setPayoutAmount(""); }}
              >
                Annuler
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* ── Payout History ── */}
      {payouts.length > 0 && (
        <Card padding="none">
          <CardHeader className="px-4 pt-4 pb-3">
            <CardTitle>Historique des retraits</CardTitle>
          </CardHeader>
          <div className="divide-y divide-[#E6F2F2]">
            {payouts.map((p) => (
              <div key={p.id} className="px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-semibold text-[#1F2937]">
                      {p.amount.toFixed(2)} CHF
                    </span>
                    <Badge variant={PAYOUT_STATUS[p.status]?.variant ?? "neutral"}>
                      {PAYOUT_STATUS[p.status]?.label ?? p.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 font-mono">
                    IBAN ···{p.iban.slice(-4)} · {p.accountHolder}
                  </p>
                  {p.adminNotes && (
                    <p className="text-xs text-gray-500 mt-0.5 italic">{p.adminNotes}</p>
                  )}
                  {p.processedAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Traité le {format(new Date(p.processedAt), "d MMM yyyy", { locale: fr })}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {format(new Date(p.createdAt), "d MMM yyyy", { locale: fr })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Transaction History ── */}
      <Card padding="none">
        <CardHeader className="px-4 py-3">
          <CardTitle>Historique des transactions</CardTitle>
        </CardHeader>
        {!wallet?.transactions.length ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">Aucune transaction pour l&apos;instant</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[520px]">
              <div className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-3 px-4 py-2.5 border-b border-[#E6F2F2] bg-[#F4F7F7]">
                <span className="text-xs text-gray-400 font-medium">Mission</span>
                <span className="text-xs text-gray-400 font-medium">Client</span>
                <span className="text-xs text-gray-400 font-medium">Brut</span>
                <span className="text-xs text-gray-400 font-medium">Commission</span>
                <span className="text-xs text-gray-400 font-medium">Net</span>
                <span className="text-xs text-gray-400 font-medium">Statut</span>
              </div>
              <div className="divide-y divide-[#E6F2F2]">
                {wallet.transactions.map((t) => (
                  <div key={t.jobId} className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-3 items-center px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1F2937] truncate">
                        {t.categoryIcon} {t.category}
                      </p>
                      {t.completedAt && (
                        <p className="text-xs text-gray-400">
                          {format(new Date(t.completedAt), "d MMM yyyy", { locale: fr })}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{t.client}</p>
                    <span className="text-sm text-gray-700 font-medium shrink-0">{t.gross.toFixed(2)}</span>
                    <span className="text-sm text-red-400 shrink-0">-{t.fee.toFixed(2)}</span>
                    <span className="text-sm font-semibold text-[#1CA7A6] shrink-0">{t.net.toFixed(2)} CHF</span>
                    {t.paymentStatus ? (
                      <Badge variant={PAYMENT_BADGE[t.paymentStatus]?.variant ?? "neutral"}>
                        {PAYMENT_BADGE[t.paymentStatus]?.label ?? t.paymentStatus}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
