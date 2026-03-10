"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  registerClientSchema,
  registerArtisanSchema,
  type RegisterClientInput,
  type RegisterArtisanInput,
} from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type Role = "CLIENT" | "ARTISAN";

// ── Resend verification button ────────────────────────────────────────────────
function ResendButton({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  const handleResend = async () => {
    setStatus("loading");
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus("sent");
  };

  if (status === "sent") {
    return <p className="text-sm text-green-600 font-medium">✓ Email renvoyé !</p>;
  }

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={status === "loading"}
      className="text-sm text-[#1CA7A6] hover:underline disabled:opacity-50"
    >
      {status === "loading" ? "Envoi…" : "Renvoyer l'email de vérification"}
    </button>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("CLIENT");
  const [verificationSent, setVerificationSent] = useState<{ email: string; role: string } | null>(null);
  const { setUser } = useAuth();

  const isArtisan = role === "ARTISAN";
  const schema = isArtisan ? registerArtisanSchema : registerClientSchema;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterArtisanInput>({
    resolver: zodResolver(schema as typeof registerArtisanSchema),
  });

  const onSubmit = async (data: RegisterClientInput | RegisterArtisanInput) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, role }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError("root", { message: json.error });
      return;
    }

    // Email verification required — show confirmation screen
    setVerificationSent({ email: json.data.email, role: json.data.role });
  };

  // ── Email verification sent screen ────────────────────────────────────────
  if (verificationSent) {
    return (
      <div className="min-h-screen bg-[#F4F7F7] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center justify-center" aria-label="GoServi — Accueil">
              <Image src="/logo.png" alt="GoServi" width={180} height={54} className="h-12 w-auto object-contain" />
            </Link>
          </div>
          <div className="bg-white border border-[#D1E5E5] rounded-[10px] shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#E6F2F2] flex items-center justify-center mx-auto mb-4 text-4xl">
              ✉️
            </div>
            <h1 className="text-lg font-semibold text-[#1F2937] mb-2">Vérifiez votre email</h1>
            <p className="text-sm text-gray-500 mb-4">
              Un lien de confirmation a été envoyé à{" "}
              <strong className="text-[#1F2937]">{verificationSent.email}</strong>.
              <br />Cliquez dessus pour activer votre compte.
            </p>
            <div className="bg-[#F4F7F7] border border-[#D1E5E5] rounded-[8px] p-3 mb-5">
              <p className="text-xs text-gray-500">
                ⏱ Le lien est valable <strong>24 heures</strong>.
                Pensez à vérifier vos spams.
              </p>
            </div>
            <ResendButton email={verificationSent.email} />
            <p className="text-xs text-gray-400 mt-4">
              Déjà vérifié ?{" "}
              <Link href="/auth/login" className="text-[#1CA7A6] hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-[#1CA7A6] font-bold text-xl">
            <span className="text-3xl">⚡</span> GoServi
          </Link>
          <p className="text-sm text-gray-500 mt-1">Créez votre compte gratuit</p>
        </div>

        <div className="bg-white border border-[#D1E5E5] rounded-[10px] shadow-sm p-6">
          <h1 className="text-lg font-semibold text-[#1F2937] mb-4">Inscription</h1>

          {/* Role toggle */}
          <div className="flex bg-[#F4F7F7] rounded-[8px] p-1 mb-5">
            {(["CLIENT", "ARTISAN"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-1.5 text-sm rounded-[6px] font-medium transition-colors ${
                  role === r
                    ? "bg-white text-[#1CA7A6] shadow-sm"
                    : "text-gray-500 hover:text-[#1F2937]"
                }`}
              >
                {r === "CLIENT" ? "Je suis client" : "Je suis artisan"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Prénom"
                placeholder="Jean"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <Input
                label="Nom"
                placeholder="Dupont"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.ch"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Téléphone"
              type="tel"
              placeholder="+41 79 000 00 00"
              {...register("phone")}
            />

            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              helperText="Min. 8 caractères, 1 majuscule, 1 chiffre"
              {...register("password")}
            />

            {isArtisan && (
              <>
                <div className="border-t border-[#E6F2F2] pt-3 mt-1">
                  <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">
                    Informations entreprise
                  </p>
                </div>
                <Input
                  label="Nom de l'entreprise"
                  placeholder="Dupont Plomberie Sàrl"
                  error={(errors as { companyName?: { message?: string } }).companyName?.message}
                  {...register("companyName")}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Numéro RC"
                    placeholder="CH-XXX.X.XXX"
                    error={(errors as { rcNumber?: { message?: string } }).rcNumber?.message}
                    {...register("rcNumber")}
                  />
                  <Input
                    label="Ville"
                    placeholder="Lausanne"
                    error={(errors as { city?: { message?: string } }).city?.message}
                    {...register("city")}
                  />
                </div>
              </>
            )}

            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full mt-1">
              {isArtisan ? "Créer mon profil artisan" : "Créer mon compte"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="text-[#1CA7A6] hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
