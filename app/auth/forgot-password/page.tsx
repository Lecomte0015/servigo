"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.data?.sent) {
        setSent(true);
      } else {
        setError("Une erreur est survenue. Réessayez.");
      }
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F7]">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12">
        <div className="w-full max-w-md">
          {sent ? (
            <div className="bg-white rounded-[12px] p-8 shadow-sm border border-[#D1E5E5] text-center">
              <p className="text-4xl mb-4">📧</p>
              <h1 className="text-xl font-semibold text-[#1F2937] mb-2">
                Vérifiez votre messagerie
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <Link
                href="/auth/login"
                className="text-sm text-[#1CA7A6] hover:underline"
              >
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-[12px] p-8 shadow-sm border border-[#D1E5E5]">
              <div className="text-center mb-6">
                <Link href="/" className="inline-flex items-center justify-center mb-4" aria-label="GoServi — Accueil">
                  <Image src="/logo.png" alt="GoServi" width={180} height={54} className="h-12 w-auto object-contain" />
                </Link>
                <h1 className="text-xl font-semibold text-[#1F2937]">
                  Mot de passe oublié ?
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Entrez votre email et nous vous enverrons un lien de réinitialisation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1F2937] mb-1">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.ch"
                    className="w-full px-3 py-2.5 border border-[#D1E5E5] rounded-[8px] text-sm focus:outline-none focus:border-[#1CA7A6] transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button type="submit" loading={loading} className="w-full">
                  Envoyer le lien
                </Button>

                <Link
                  href="/auth/login"
                  className="text-center text-sm text-gray-500 hover:text-[#1CA7A6] transition-colors"
                >
                  ← Retour à la connexion
                </Link>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
