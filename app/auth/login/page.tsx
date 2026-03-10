"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "";
  const { setUser } = useAuth();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "sent">("idle");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    setResendStatus("loading");
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: unverifiedEmail }),
    });
    setResendStatus("sent");
  };

  const onSubmit = async (data: LoginInput) => {
    setUnverifiedEmail(null);
    setResendStatus("idle");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      if (json.needsVerification) {
        setUnverifiedEmail(json.email ?? data.email);
      } else {
        setError("root", { message: json.error });
      }
      return;
    }

    setUser(json.data);

    const destination =
      redirect ||
      (json.data.role === "ARTISAN"
        ? "/pro/dashboard"
        : json.data.role === "ADMIN"
        ? "/admin"
        : "/dashboard");

    router.push(destination);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center" aria-label="GoServi — Accueil">
            <Image src="/logo.png" alt="GoServi" width={240} height={160} className="w-[160px] h-auto object-contain" />
          </Link>
          <p className="text-sm text-gray-500 mt-1">Connectez-vous à votre espace</p>
        </div>

        {/* Form card */}
        <div className="bg-white border border-[#D1E5E5] rounded-[10px] shadow-sm p-6">
          <h1 className="text-lg font-semibold text-[#1F2937] mb-5">Connexion</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.ch"
              error={errors.email?.message}
              {...register("email")}
            />
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-[#1F2937]">Mot de passe</label>
                <Link href="/auth/forgot-password" className="text-xs text-[#1CA7A6] hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            {unverifiedEmail && (
              <div className="bg-amber-50 border border-amber-200 rounded-[8px] px-3 py-3">
                <p className="text-sm text-amber-800 font-medium mb-1">📧 Email non vérifié</p>
                <p className="text-xs text-amber-700 mb-2">
                  Vérifiez votre boîte mail et cliquez sur le lien d&apos;activation.
                </p>
                {resendStatus === "sent" ? (
                  <p className="text-xs text-green-600 font-medium">✓ Email renvoyé !</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendStatus === "loading"}
                    className="text-xs text-[#1CA7A6] hover:underline font-medium disabled:opacity-50"
                  >
                    {resendStatus === "loading" ? "Envoi…" : "Renvoyer l'email de vérification"}
                  </button>
                )}
              </div>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full mt-1">
              Se connecter
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Pas encore de compte ?{" "}
            <Link href="/auth/register" className="text-[#1CA7A6] hover:underline font-medium">
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F7F7] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#1CA7A6] border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginPageContent />
    </Suspense>
  );
}
