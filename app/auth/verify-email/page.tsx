"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

type State = "loading" | "success" | "error";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [state, setState] = useState<State>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState("error");
      setErrorMsg("Lien invalide.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setUser(json.data);
          setRole(json.data.role);
          setState("success");
          // Redirect after 2s
          setTimeout(() => {
            const dest =
              json.data.role === "ARTISAN"
                ? "/pro/dashboard"
                : json.data.role === "ADMIN"
                ? "/admin"
                : "/dashboard";
            router.push(dest);
          }, 2000);
        } else {
          setState("error");
          setErrorMsg(json.error ?? "Une erreur est survenue.");
        }
      })
      .catch(() => {
        setState("error");
        setErrorMsg("Erreur réseau. Réessayez.");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F7F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-[#1CA7A6] font-bold text-xl">
            <span className="text-3xl">⚡</span> ServiGo
          </Link>
        </div>

        <div className="bg-white border border-[#D1E5E5] rounded-[10px] shadow-sm p-8 text-center">
          {state === "loading" && (
            <>
              <div className="w-14 h-14 rounded-full bg-[#E6F2F2] flex items-center justify-center mx-auto mb-4">
                <span className="w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full animate-spin block" />
              </div>
              <h1 className="text-lg font-semibold text-[#1F2937] mb-2">Vérification en cours…</h1>
              <p className="text-sm text-gray-500">Validation de votre adresse email</p>
            </>
          )}

          {state === "success" && (
            <>
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 text-3xl">
                ✅
              </div>
              <h1 className="text-lg font-semibold text-[#1F2937] mb-2">Email vérifié !</h1>
              <p className="text-sm text-gray-500 mb-4">
                Votre compte est maintenant actif. Redirection vers votre espace…
              </p>
              <div className="flex justify-center">
                <span className="w-4 h-4 border-2 border-[#1CA7A6] border-t-transparent rounded-full animate-spin" />
              </div>
            </>
          )}

          {state === "error" && (
            <>
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-3xl">
                ❌
              </div>
              <h1 className="text-lg font-semibold text-[#1F2937] mb-2">Lien invalide</h1>
              <p className="text-sm text-red-600 mb-6">{errorMsg}</p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  className="block w-full py-2.5 px-4 bg-[#1CA7A6] text-white rounded-[8px] text-sm font-semibold hover:bg-[#178F8E] transition-colors"
                >
                  Retour à la connexion
                </Link>
                <p className="text-xs text-gray-400 mt-1">
                  Besoin d&apos;un nouveau lien ?{" "}
                  <Link href="/auth/login" className="text-[#1CA7A6] hover:underline">
                    Se connecter
                  </Link>{" "}
                  pour en demander un.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
