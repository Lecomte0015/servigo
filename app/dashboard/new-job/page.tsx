"use client";

import { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { createJobSchema, type CreateJobInput } from "@/lib/validations";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

function SelectedArtisanBanner({
  name, city, onClear,
}: { name: string; city: string; onClear: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-[#E6F2F2] border border-[#1CA7A6] rounded-[10px] px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🎯</span>
        <div>
          <p className="text-sm font-semibold text-[#1CA7A6]">Demande directe à {name}</p>
          {city && <p className="text-xs text-gray-500">📍 {city}</p>}
        </div>
      </div>
      <button type="button" onClick={onClear} className="text-xs text-gray-400 hover:text-gray-600 underline">
        Changer
      </button>
    </div>
  );
}

function NewJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const preArtisanId   = searchParams.get("artisanId") ?? "";
  const preArtisanName = searchParams.get("artisanName") ?? "";
  const preCity        = searchParams.get("city") ?? "";
  const preCategoryId  = searchParams.get("categoryId") ?? "";
  // Texte libre depuis la barre de recherche homepage (ex: "plombier", "électricité")
  const preService     = searchParams.get("service") ?? "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [estimate, setEstimate] = useState<number | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [targetArtisanId,   setTargetArtisanId]   = useState(preArtisanId);
  const [targetArtisanName, setTargetArtisanName] = useState(preArtisanName);

  const {
    register, handleSubmit, setValue, setError, watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: { city: preCity || "Lausanne", urgencyLevel: "URGENT" },
  });

  const urgencyLevel = watch("urgencyLevel");

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(j => {
        const cats: Category[] = j.data ?? [];
        setCategories(cats);

        // Pré-sélection depuis l'URL (?categoryId=... ou ?service=...)
        let matched: Category | undefined;

        if (preCategoryId) {
          matched = cats.find(c => c.id === preCategoryId);
        } else if (preService) {
          const q = preService.toLowerCase();
          matched = cats.find(
            c =>
              c.name.toLowerCase().includes(q) ||
              c.slug.toLowerCase().includes(q)
          );
        }

        if (matched) {
          setSelectedCategory(matched.id);
          setValue("categoryId", matched.id);
          setStep(2);
        }
      });
  // preCategoryId et preService sont stables (searchParams) — setValue est stable (react-hook-form)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preCategoryId, preService]);

  useEffect(() => {
    if (preCity) setValue("city", preCity);
  }, [preCity, setValue]);

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    setValue("categoryId", id);
    setStep(2);
  };

  const handleClearArtisan = () => {
    setTargetArtisanId("");
    setTargetArtisanName("");
    router.replace("/dashboard/new-job");
  };

  const onSubmit = async (data: CreateJobInput) => {
    const payload = { ...data, ...(targetArtisanId ? { targetArtisanId } : {}) };
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) { setError("root", { message: json.error }); return; }
    setEstimate(json.data.estimatedPrice);
    setStep(3);
    setTimeout(() => router.push("/dashboard"), 3000);
  };

  return (
    <div className="flex flex-col gap-5 max-w-[700px]">
      <div>
        <h1 className="text-xl font-semibold text-[#1F2937]">Nouvelle demande</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {targetArtisanName ? `Demande directe à ${targetArtisanName}` : "Trouvez un artisan disponible rapidement"}
        </p>
      </div>

      {targetArtisanId && targetArtisanName && step < 3 && (
        <SelectedArtisanBanner name={targetArtisanName} city={preCity} onClear={handleClearArtisan} />
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? "bg-[#1CA7A6] text-white" : "bg-[#E6F2F2] text-gray-400"}`}>
              {s}
            </div>
            {s < 3 && <div className={`h-0.5 w-12 ${step > s ? "bg-[#1CA7A6]" : "bg-[#E6F2F2]"}`} />}
          </div>
        ))}
        <span className="ml-2 text-xs text-gray-500">
          {step === 1 ? "Choisir un service" : step === 2 ? "Décrire le besoin" : "Confirmé !"}
        </span>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>Quel service vous faut-il ?</CardTitle></CardHeader>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => handleCategorySelect(cat.id)}
                className={`flex items-center gap-3 p-3 rounded-[8px] border text-left transition-all hover:border-[#1CA7A6] hover:bg-[#E6F2F2] ${selectedCategory === cat.id ? "border-[#1CA7A6] bg-[#E6F2F2]" : "border-[#D1E5E5] bg-white"}`}>
                <span className="text-2xl">{cat.icon ?? "🔧"}</span>
                <span className="text-sm font-medium text-[#1F2937]">{cat.name}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("categoryId")} />
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Détails de l&apos;intervention</CardTitle>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-[#1CA7A6] hover:underline">← Changer de service</button>
              </div>
            </CardHeader>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-[#1F2937] block mb-2">Niveau d&apos;urgence</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["URGENT", "STANDARD"] as const).map((level) => (
                    <label key={level} className="cursor-pointer">
                      <input type="radio" value={level} className="sr-only" {...register("urgencyLevel")} />
                      <div className={`p-3 rounded-[8px] border text-center transition-all ${urgencyLevel === level ? "border-[#1CA7A6] bg-[#E6F2F2]" : "border-[#D1E5E5]"}`}>
                        <p className="text-lg">{level === "URGENT" ? "⚡" : "📅"}</p>
                        <p className="text-sm font-medium text-[#1F2937]">{level === "URGENT" ? "Urgent" : "Standard"}</p>
                        <p className="text-xs text-gray-500">{level === "URGENT" ? "< 30 minutes" : "Planifié"}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date picker — visible uniquement en mode STANDARD */}
              {urgencyLevel === "STANDARD" && (
                <div>
                  <label className="text-sm font-medium text-[#1F2937] block mb-1">
                    Date et heure souhaitées
                  </label>
                  <input
                    type="datetime-local"
                    min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                    {...register("scheduledAt")}
                    className="w-full px-3 py-2 text-sm border border-[#D1E5E5] rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1CA7A6] text-[#1F2937] hover:border-[#1CA7A6] transition-colors"
                  />
                  {errors.scheduledAt && (
                    <p className="text-xs text-red-500 mt-1">{errors.scheduledAt.message as string}</p>
                  )}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-[#1F2937] block mb-1">Description du problème</label>
                <textarea
                  placeholder="Décrivez précisément le problème (ex: fuite sous l'évier de la cuisine...)"
                  className="w-full px-3 py-2 text-sm border border-[#D1E5E5] rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1CA7A6] resize-none hover:border-[#1CA7A6] transition-colors"
                  rows={3}
                  {...register("description")}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>

              <Input label="Adresse d'intervention" placeholder="Rue de la Paix 12, 1003 Lausanne" error={errors.address?.message} {...register("address")} />
              <Input label="Ville" placeholder="Lausanne" error={errors.city?.message} {...register("city")} />

              {errors.root && (
                <div className="bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">
                  <p className="text-sm text-red-600">{errors.root.message}</p>
                </div>
              )}

              <Button type="submit" loading={isSubmitting} className="w-full">
                {targetArtisanId ? `Envoyer à ${targetArtisanName}` : "Trouver un artisan disponible"}
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <Card>
          <div className="text-center py-6">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-lg font-semibold text-[#1F2937]">Demande envoyée !</h2>
            <p className="text-sm text-gray-500 mt-2">
              {targetArtisanName ? `Votre demande a été envoyée directement à ${targetArtisanName}.` : "Nous recherchons un artisan disponible…"}
            </p>
            {estimate && (
              <div className="mt-4 inline-block bg-[#E6F2F2] px-4 py-2 rounded-[8px]">
                <p className="text-sm text-gray-500">Prix estimé</p>
                <p className="text-xl font-bold text-[#1CA7A6]">{estimate.toFixed(0)} CHF</p>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-4">Redirection automatique dans 3 secondes…</p>
          </div>
        </Card>
      )}

      {step < 3 && !targetArtisanId && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>🗺️</span>
          <p>Vous pouvez aussi <a href="/artisans" className="text-[#1CA7A6] hover:underline font-medium">parcourir la carte des artisans</a> pour choisir votre prestataire.</p>
        </div>
      )}
    </div>
  );
}

export default function NewJobPage() {
  return <Suspense><NewJobForm /></Suspense>;
}
