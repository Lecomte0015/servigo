"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// ─── Étapes du formulaire ─────────────────────────────────────────────────────
type Step = "credentials" | "totp";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  // Step 1 — identifiants
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");

  // Step 2 — TOTP
  const [totpCode,     setTotpCode]     = useState("");
  const [pendingToken, setPendingToken] = useState("");

  const [step,    setStep]    = useState<Step>("credentials");
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Étape 1 : email + mot de passe ─────────────────────────────────────────
  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Identifiants invalides.");
        return;
      }

      // 2FA requise → passer à l'étape TOTP
      if (json.data?.requires2FA) {
        setPendingToken(json.data.pendingToken);
        setStep("totp");
        return;
      }

      // Pas de 2FA — vérifier le rôle
      if (json.data?.role !== "ADMIN") {
        setError("Accès réservé aux administrateurs GoServi.");
        await fetch("/api/auth/logout", { method: "POST" });
        return;
      }

      setUser(json.data);
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  };

  // ── Étape 2 : code TOTP ────────────────────────────────────────────────────
  const handleTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res  = await fetch("/api/admin/2fa/verify-login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ pendingToken, code: totpCode }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Code invalide.");
        setTotpCode("");
        return;
      }

      setUser(json.data);
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#1F2937] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-white font-bold text-2xl mb-1">
            <span>⚡</span> GoServi
          </div>
          <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">
            Back-office Administration
          </p>
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">

          {step === "credentials" ? (
            <>
              <h1 className="text-lg font-semibold text-[#1F2937] mb-1">
                Connexion administrateur
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                Accès réservé au personnel autorisé
              </p>

              <form onSubmit={handleCredentials} className="flex flex-col gap-4">
                <Input
                  label="Email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@goservi.ch"
                  required
                />
                <Input
                  label="Mot de passe"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {error && (
                  <div className="text-sm px-3 py-2 rounded-[8px] bg-red-50 text-red-700 border border-red-200">
                    {error}
                  </div>
                )}

                <Button type="submit" loading={loading} className="w-full mt-1">
                  Se connecter
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* Étape 2FA */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#E6F2F2] flex items-center justify-center text-xl shrink-0">
                  🔐
                </div>
                <div>
                  <h1 className="text-base font-semibold text-[#1F2937]">
                    Double authentification
                  </h1>
                  <p className="text-xs text-gray-500">
                    Entrez le code généré par votre application
                  </p>
                </div>
              </div>

              <form onSubmit={handleTotp} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Code de vérification
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-full text-center text-2xl font-mono tracking-[0.4em] border border-gray-200 rounded-[10px] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1CA7A6]/30 focus:border-[#1CA7A6] text-[#1F2937]"
                    required
                  />
                  <p className="text-xs text-gray-400 text-center mt-1.5">
                    Google Authenticator · Authy · 1Password
                  </p>
                </div>

                {error && (
                  <div className="text-sm px-3 py-2 rounded-[8px] bg-red-50 text-red-700 border border-red-200">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  disabled={totpCode.length < 6}
                  className="w-full"
                >
                  Vérifier le code
                </Button>
              </form>

              <button
                onClick={() => { setStep("credentials"); setError(null); setTotpCode(""); }}
                className="mt-4 w-full text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Retour à la connexion
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Espace client ?{" "}
          <a href="/auth/login" className="text-[#1CA7A6] hover:underline">
            Connexion front-office
          </a>
        </p>
      </div>
    </div>
  );
}
