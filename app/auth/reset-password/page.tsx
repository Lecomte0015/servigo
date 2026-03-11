"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("Lien invalide. Veuillez refaire une demande.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (json.data?.reset) {
        setSuccess(true);
        setTimeout(() => router.push("/auth/login"), 2000);
      } else {
        setError(json.message ?? "Lien invalide ou expiré.");
      }
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F7]">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-[12px] p-8 shadow-sm border border-[#D1E5E5]">
            {success ? (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h1 className="text-lg font-semibold text-[#1F2937] mb-1">
                  Mot de passe réinitialisé !
                </h1>
                <p className="text-sm text-gray-500">Redirection vers la connexion…</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <Link href="/" className="inline-flex items-center justify-center mb-4" aria-label="GoServi — Accueil">
                    <Image src="/logo.png" alt="GoServi" width={460} height={156} className="h-12 w-auto object-contain" />
                  </Link>
                  <h1 className="text-xl font-semibold text-[#1F2937]">
                    Nouveau mot de passe
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Choisissez un mot de passe sécurisé (8 caractères minimum).
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 border border-[#D1E5E5] rounded-[8px] text-sm focus:outline-none focus:border-[#1CA7A6] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 border border-[#D1E5E5] rounded-[8px] text-sm focus:outline-none focus:border-[#1CA7A6] transition-colors"
                    />
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <Button type="submit" loading={loading} disabled={!token} className="w-full">
                    Réinitialiser le mot de passe
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F7F7]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
