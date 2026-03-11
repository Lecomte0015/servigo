"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

// ─── Étapes de la configuration 2FA ──────────────────────────────────────────
type SetupStep = "idle" | "qr" | "verify" | "done";

// ─── État 2FA depuis /api/auth/me ─────────────────────────────────────────────
interface TwoFAStatus {
  totpEnabled: boolean;
}

export default function AdminSecurityPage() {
  const [status,    setStatus]    = useState<TwoFAStatus | null>(null);
  const [loading,   setLoading]   = useState(true);

  // ── Setup flow
  const [setupStep,  setSetupStep]  = useState<SetupStep>("idle");
  const [qrDataUrl,  setQrDataUrl]  = useState("");
  const [setupCode,  setSetupCode]  = useState("");
  const [setupError, setSetupError] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);

  // ── Disable flow
  const [showDisable,   setShowDisable]   = useState(false);
  const [disableCode,   setDisableCode]   = useState("");
  const [disableError,  setDisableError]  = useState("");
  const [disableLoading, setDisableLoading] = useState(false);

  // ── Charger le statut ──────────────────────────────────────────────────────
  const fetchStatus = async () => {
    setLoading(true);
    const res  = await fetch("/api/auth/me");
    const json = await res.json();
    setStatus({ totpEnabled: json.data?.totpEnabled ?? false });
    setLoading(false);
  };

  useEffect(() => { fetchStatus(); }, []);

  // ── Lancer la configuration 2FA ────────────────────────────────────────────
  const handleSetup = async () => {
    setSetupLoading(true);
    setSetupError("");
    try {
      const res  = await fetch("/api/admin/2fa/setup", { method: "POST" });
      const json = await res.json();
      if (!res.ok) { setSetupError(json.error ?? "Erreur"); return; }
      setQrDataUrl(json.data.qrDataUrl);
      setSetupStep("qr");
    } finally {
      setSetupLoading(false);
    }
  };

  // ── Vérifier le premier code et activer ────────────────────────────────────
  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupLoading(true);
    setSetupError("");
    try {
      const res  = await fetch("/api/admin/2fa/enable", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: setupCode }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSetupError(json.error ?? "Code invalide");
        setSetupCode("");
        return;
      }
      setSetupStep("done");
      await fetchStatus();
    } finally {
      setSetupLoading(false);
    }
  };

  // ── Désactiver la 2FA ──────────────────────────────────────────────────────
  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisableLoading(true);
    setDisableError("");
    try {
      const res  = await fetch("/api/admin/2fa/disable", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: disableCode }),
      });
      const json = await res.json();
      if (!res.ok) {
        setDisableError(json.error ?? "Code invalide");
        setDisableCode("");
        return;
      }
      setShowDisable(false);
      setDisableCode("");
      await fetchStatus();
    } finally {
      setDisableLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sécurité</h1>
        <p className="text-gray-500 mt-1">
          Paramètres de sécurité de votre compte administrateur
        </p>
      </div>

      {/* ── Card 2FA ─────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Double authentification (2FA)</CardTitle>
            {!loading && status && (
              <Badge variant={status.totpEnabled ? "success" : "neutral"}>
                {status.totpEnabled ? "Activée" : "Désactivée"}
              </Badge>
            )}
          </div>
        </CardHeader>

        <div className="px-6 pb-6 space-y-4">
          <p className="text-sm text-gray-500">
            La double authentification TOTP protège votre compte même si votre
            mot de passe est compromis. Compatible Google Authenticator, Authy, 1Password, etc.
          </p>

          {loading ? (
            <div className="animate-pulse h-10 w-32 bg-gray-100 rounded-lg" />
          ) : status?.totpEnabled ? (
            /* ── 2FA activée → proposer de désactiver ──────────────────────── */
            <>
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-[10px]">
                <div className="text-green-600 shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Double authentification active
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Votre compte est protégé par un code TOTP à chaque connexion.
                  </p>
                </div>
              </div>

              {!showDisable ? (
                <button
                  onClick={() => setShowDisable(true)}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Désactiver la 2FA…
                </button>
              ) : (
                <form onSubmit={handleDisable} className="space-y-3 p-4 border border-red-200 rounded-[10px] bg-red-50">
                  <p className="text-sm font-medium text-red-800">
                    Confirmez avec votre code actuel pour désactiver la 2FA
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-36 text-center text-xl font-mono tracking-widest border border-red-300 rounded-[8px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
                    required
                  />
                  {disableError && (
                    <p className="text-xs text-red-700">{disableError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      loading={disableLoading}
                      disabled={disableCode.length < 6}
                      className="!bg-red-600 hover:!bg-red-700 text-sm px-4 py-2"
                    >
                      Désactiver
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setShowDisable(false); setDisableCode(""); setDisableError(""); }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* ── 2FA désactivée → flux de configuration ──────────────────────── */
            <>
              {setupStep === "idle" && (
                <Button onClick={handleSetup} loading={setupLoading}>
                  Activer la double authentification
                </Button>
              )}

              {setupStep === "qr" && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        1. Scannez ce QR code avec votre application d&apos;authentification
                      </p>
                      <p className="text-xs text-gray-400">
                        Google Authenticator · Authy · 1Password · Bitwarden
                      </p>
                    </div>
                  </div>

                  {/* QR code */}
                  {qrDataUrl && (
                    <div className="inline-block p-3 bg-white border-2 border-[#D1E5E5] rounded-[12px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrDataUrl} alt="QR Code 2FA" width={180} height={180} />
                    </div>
                  )}

                  <form onSubmit={handleEnable} className="space-y-3 max-w-xs">
                    <p className="text-sm font-medium text-gray-700">
                      2. Entrez le code à 6 chiffres affiché dans l&apos;application
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      autoFocus
                      value={setupCode}
                      onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="w-36 text-center text-xl font-mono tracking-widest border border-[#D1E5E5] rounded-[8px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1CA7A6]/30 focus:border-[#1CA7A6]"
                      required
                    />
                    {setupError && (
                      <p className="text-xs text-red-600">{setupError}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        loading={setupLoading}
                        disabled={setupCode.length < 6}
                      >
                        Confirmer et activer
                      </Button>
                      <button
                        type="button"
                        onClick={() => { setSetupStep("idle"); setSetupCode(""); setSetupError(""); }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {setupStep === "done" && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-[10px]">
                  <div className="text-green-600 shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      2FA activée avec succès !
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Votre prochain login exigera votre code d&apos;authentification.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* ── Card mot de passe ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>🔑 Mot de passe</CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <p className="text-sm text-gray-500 mb-4">
            Modifiez votre mot de passe administrateur depuis le profil.
          </p>
          <a
            href="/admin"
            className="text-sm text-[#1CA7A6] hover:text-[#178F8E] font-medium"
          >
            Aller aux paramètres du compte →
          </a>
        </div>
      </Card>
    </div>
  );
}
