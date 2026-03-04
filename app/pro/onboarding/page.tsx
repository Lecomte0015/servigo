"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  slug: string;
}

interface ServiceEntry {
  categoryId: string;
  basePrice: string;
  emergencyFee: string;
}

const STEPS = [
  { label: "Votre activité", icon: "🏢" },
  { label: "Vos services", icon: "🔧" },
  { label: "Confirmation", icon: "✅" },
];

export default function ArtisanOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Step 1 fields
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [emergency, setEmergency] = useState(false);

  // Step 2 fields
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((j) => setCategories(j.data ?? []));
  }, []);

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(catId)) {
        setServices((s) => s.filter((x) => x.categoryId !== catId));
        return prev.filter((id) => id !== catId);
      } else {
        setServices((s) => [...s, { categoryId: catId, basePrice: "80", emergencyFee: "30" }]);
        return [...prev, catId];
      }
    });
  };

  const updateService = (catId: string, field: "basePrice" | "emergencyFee", value: string) => {
    setServices((prev) =>
      prev.map((s) => (s.categoryId === catId ? { ...s, [field]: value } : s))
    );
  };

  const handleStep1Next = () => {
    if (!city.trim()) { setError("La ville est requise."); return; }
    setError("");
    setStep(1);
  };

  const handleStep2Next = () => {
    if (selectedCategories.length === 0) { setError("Sélectionnez au moins un service."); return; }
    const invalid = services.some((s) => !s.basePrice || Number(s.basePrice) <= 0);
    if (invalid) { setError("Veuillez renseigner le tarif pour chaque service sélectionné."); return; }
    setError("");
    setStep(2);
  };

  const handleFinish = async () => {
    setSaving(true);
    setError("");
    try {
      // Update profile
      const profileRes = await fetch("/api/artisan/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          description: description || undefined,
          emergencyAvailable: emergency,
          onboardingCompleted: true,
        }),
      });

      if (!profileRes.ok) throw new Error("Erreur profil");

      // Add services
      for (const svc of services) {
        await fetch("/api/artisan/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId: svc.categoryId,
            basePrice: Number(svc.basePrice),
            emergencyFee: Number(svc.emergencyFee),
          }),
        });
      }

      router.push("/pro/dashboard");
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F7] flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-[#D1E5E5] h-14 flex items-center px-4 sticky top-0 z-10">
        <Link href="/" className="font-bold text-[#1CA7A6] flex items-center gap-1 text-base">
          <span>⚡</span> ServiGo
        </Link>
        <span className="mx-3 text-gray-300">|</span>
        <span className="text-sm text-gray-500">Configuration de votre compte artisan</span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start py-8 px-4">
        <div className="w-full max-w-xl">

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-0 mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    i < step ? "bg-[#1CA7A6] text-white" :
                    i === step ? "bg-[#1CA7A6] text-white ring-4 ring-[#E6F2F2]" :
                    "bg-[#E6F2F2] text-gray-400"
                  }`}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${i === step ? "text-[#1CA7A6]" : "text-gray-400"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-16 h-0.5 mx-1 mb-4 rounded-full ${i < step ? "bg-[#1CA7A6]" : "bg-[#E6F2F2]"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1 — Activity */}
          {step === 0 && (
            <div className="bg-white rounded-[12px] border border-[#D1E5E5] p-6 flex flex-col gap-5 shadow-sm">
              <div>
                <h2 className="text-lg font-semibold text-[#1F2937]">Votre activité</h2>
                <p className="text-sm text-gray-500 mt-0.5">Quelques informations sur votre entreprise</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">
                  Ville principale d&apos;intervention <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Genève, Carouge, Lancy…"
                  className="w-full px-3 py-2.5 border border-[#D1E5E5] rounded-[8px] text-sm focus:outline-none focus:border-[#1CA7A6] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">
                  Description de votre activité
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Présentez votre entreprise, vos spécialités, votre expérience…"
                  className="w-full px-3 py-2.5 border border-[#D1E5E5] rounded-[8px] text-sm resize-none h-24 focus:outline-none focus:border-[#1CA7A6] transition-colors"
                />
              </div>

              <div
                onClick={() => setEmergency((v) => !v)}
                className="flex items-center justify-between p-4 border border-[#D1E5E5] rounded-[10px] cursor-pointer hover:border-[#1CA7A6] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-[#1F2937]">⚡ Disponible pour les urgences</p>
                  <p className="text-xs text-gray-500 mt-0.5">Vous acceptez des missions urgentes, même le soir et le week-end</p>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-3 relative ${emergency ? "bg-[#1CA7A6]" : "bg-gray-200"}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${emergency ? "translate-x-6" : "translate-x-1"}`} />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button onClick={handleStep1Next} className="w-full">
                Continuer →
              </Button>
            </div>
          )}

          {/* Step 2 — Services */}
          {step === 1 && (
            <div className="bg-white rounded-[12px] border border-[#D1E5E5] p-6 flex flex-col gap-5 shadow-sm">
              <div>
                <h2 className="text-lg font-semibold text-[#1F2937]">Vos services</h2>
                <p className="text-sm text-gray-500 mt-0.5">Sélectionnez les services que vous proposez et définissez vos tarifs</p>
              </div>

              <div className="flex flex-col gap-3">
                {categories.map((cat) => {
                  const selected = selectedCategories.includes(cat.id);
                  const svc = services.find((s) => s.categoryId === cat.id);
                  return (
                    <div key={cat.id} className={`border rounded-[10px] overflow-hidden transition-colors ${selected ? "border-[#1CA7A6]" : "border-[#D1E5E5]"}`}>
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F4F7F7] transition-colors"
                      >
                        <span className="text-xl">{cat.icon ?? "🔧"}</span>
                        <span className="text-sm font-medium text-[#1F2937] flex-1">{cat.name}</span>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selected ? "bg-[#1CA7A6] border-[#1CA7A6]" : "border-gray-300"}`}>
                          {selected && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                      </button>
                      {selected && svc && (
                        <div className="px-4 pb-3 pt-0 bg-[#F9FEFE] grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Tarif horaire (CHF)</label>
                            <input
                              type="number"
                              min="1"
                              value={svc.basePrice}
                              onChange={(e) => updateService(cat.id, "basePrice", e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-[#D1E5E5] rounded-[6px] text-sm focus:outline-none focus:border-[#1CA7A6]"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Supplément urgence (CHF)</label>
                            <input
                              type="number"
                              min="0"
                              value={svc.emergencyFee}
                              onChange={(e) => updateService(cat.id, "emergencyFee", e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-[#D1E5E5] rounded-[6px] text-sm focus:outline-none focus:border-[#1CA7A6]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setError(""); setStep(0); }} className="flex-1">
                  ← Retour
                </Button>
                <Button onClick={handleStep2Next} className="flex-1">
                  Continuer →
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — Confirmation */}
          {step === 2 && (
            <div className="bg-white rounded-[12px] border border-[#D1E5E5] p-6 flex flex-col gap-5 shadow-sm">
              <div>
                <h2 className="text-lg font-semibold text-[#1F2937]">✅ Tout est prêt !</h2>
                <p className="text-sm text-gray-500 mt-0.5">Voici un résumé de votre configuration</p>
              </div>

              <div className="bg-[#F4F7F7] rounded-[10px] p-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Ville</span>
                  <span className="font-medium text-[#1F2937]">{city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Urgences</span>
                  <span className="font-medium text-[#1F2937]">{emergency ? "⚡ Oui" : "Non"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Services</span>
                  <span className="font-medium text-[#1F2937]">{services.length} service{services.length > 1 ? "s" : ""}</span>
                </div>
              </div>

              <div className="bg-[#E6F2F2] rounded-[10px] p-4 text-sm text-[#178F8E]">
                <p className="font-medium mb-1">🔍 Validation en cours</p>
                <p>Notre équipe va vérifier votre dossier (RC, assurances) et vous notifier sous 24h ouvrées.</p>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setError(""); setStep(1); }} className="flex-1">
                  ← Retour
                </Button>
                <Button onClick={handleFinish} loading={saving} className="flex-1">
                  Finaliser mon inscription
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
