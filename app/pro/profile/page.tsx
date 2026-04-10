"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  icon?: string | null;
  slug: string;
}

interface ServiceItem {
  id: string;
  basePrice: number;
  emergencyFee: number;
  isActive: boolean;
  category: { name: string; slug: string };
}

// ── Sous-composant : gestion des spécialités ──────────────────────────────────
function ServicesSection({
  services,
  onServicesChange,
}: {
  services: ServiceItem[];
  onServicesChange: (services: ServiceItem[]) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [adding, setAdding] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [basePrice, setBasePrice] = useState("100");
  const [emergencyFee, setEmergencyFee] = useState("50");
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [svcMsg, setSvcMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((j) => setCategories(j.data ?? []))
      .catch(() => {});
  }, []);

  const existingSlugs = new Set(services.map((s) => s.category.slug));
  const availableCategories = categories.filter((c) => !existingSlugs.has(c.slug));

  const handleAdd = async () => {
    if (!selectedCatId) return;
    setSaving(true);
    setSvcMsg(null);
    try {
      const res = await fetch("/api/artisan/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCatId,
          basePrice: parseFloat(basePrice) || 0,
          emergencyFee: parseFloat(emergencyFee) || 0,
        }),
      });
      if (res.ok) {
        // Recharge le profil complet pour avoir les données à jour
        const profileRes = await fetch("/api/artisan/profile");
        const profileJson = await profileRes.json();
        onServicesChange(profileJson.data?.services ?? []);
        setAdding(false);
        setSelectedCatId("");
        setBasePrice("100");
        setEmergencyFee("50");
        setSvcMsg({ type: "success", text: "Spécialité ajoutée !" });
      } else {
        const json = await res.json().catch(() => ({}));
        setSvcMsg({ type: "error", text: json.error ?? "Erreur lors de l'ajout." });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (service: ServiceItem) => {
    setToggling(service.id);
    try {
      const res = await fetch(`/api/artisan/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });
      if (res.ok) {
        onServicesChange(
          services.map((s) => s.id === service.id ? { ...s, isActive: !s.isActive } : s)
        );
      }
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (service: ServiceItem) => {
    if (!confirm(`Supprimer la spécialité "${service.category.name}" ?`)) return;
    setDeleting(service.id);
    try {
      const res = await fetch(`/api/artisan/services/${service.id}`, { method: "DELETE" });
      if (res.ok) {
        onServicesChange(services.filter((s) => s.id !== service.id));
        setSvcMsg({ type: "success", text: `"${service.category.name}" supprimé.` });
      }
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Mes spécialités</CardTitle>
          {!adding && availableCategories.length > 0 && (
            <button
              type="button"
              onClick={() => { setAdding(true); setSvcMsg(null); }}
              className="text-xs font-medium text-[#1CA7A6] border border-[#D1E5E5] px-3 py-1.5 rounded-[8px] hover:bg-[#F4F7F7] transition-colors"
            >
              + Ajouter
            </button>
          )}
        </div>
      </CardHeader>

      <div className="flex flex-col gap-3">
        {/* Formulaire d'ajout */}
        {adding && (
          <div className="p-3 bg-[#F4F7F7] rounded-[10px] border border-[#D1E5E5] flex flex-col gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Spécialité</label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D1E5E5] rounded-[8px] text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1CA7A6]"
              >
                <option value="">Choisir une spécialité…</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Prix de base (CHF/h)</label>
                <input
                  type="number"
                  min="0"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D1E5E5] rounded-[8px] text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1CA7A6]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Supplément urgence (CHF)</label>
                <input
                  type="number"
                  min="0"
                  value={emergencyFee}
                  onChange={(e) => setEmergencyFee(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D1E5E5] rounded-[8px] text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1CA7A6]"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" loading={saving} onClick={handleAdd} disabled={!selectedCatId}>
                Enregistrer
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)} disabled={saving}>
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Message */}
        {svcMsg && (
          <div className={`text-sm px-3 py-2 rounded-[8px] ${
            svcMsg.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {svcMsg.text}
          </div>
        )}

        {/* Liste des services */}
        {services.length === 0 && !adding ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Aucune spécialité configurée. Cliquez sur &quot;+ Ajouter&quot; pour commencer.
          </p>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className={`flex items-center justify-between gap-3 p-3 rounded-[8px] border transition-opacity ${
                service.isActive ? "border-[#D1E5E5] bg-white" : "border-gray-200 bg-gray-50 opacity-60"
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#1F2937]">{service.category.name}</p>
                <p className="text-xs text-gray-400">
                  {service.basePrice} CHF/h · Urgence: +{service.emergencyFee} CHF
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Toggle actif/inactif */}
                <button
                  type="button"
                  onClick={() => handleToggle(service)}
                  disabled={toggling === service.id}
                  className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
                    service.isActive ? "bg-[#1CA7A6]" : "bg-gray-300"
                  }`}
                  title={service.isActive ? "Désactiver" : "Activer"}
                >
                  {toggling === service.id ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    </span>
                  ) : (
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      service.isActive ? "translate-x-6" : "translate-x-1"
                    }`} />
                  )}
                </button>
                {/* Supprimer */}
                <button
                  type="button"
                  onClick={() => handleDelete(service)}
                  disabled={deleting === service.id}
                  className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Supprimer"
                >
                  {deleting === service.id ? (
                    <span className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

interface ArtisanProfile {
  id: string;
  companyName: string;
  rcNumber: string;
  city: string;
  description: string | null;
  emergencyAvailable: boolean;
  insuranceVerified: boolean;
  insuranceCertUrl: string | null;
  isApproved: boolean;
  ratingAverage: number;
  ratingCount: number;
  photoUrl: string | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  services: {
    id: string;
    basePrice: number;
    emergencyFee: number;
    isActive: boolean;
    category: { name: string; slug: string };
  }[];
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  city: string;
  description: string;
  emergencyAvailable: boolean;
}

export default function ProProfilePage() {
  const [profile, setProfile] = useState<ArtisanProfile | null>(null);
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    companyName: "",
    city: "",
    description: "",
    emergencyAvailable: false,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingInsurance, setUploadingInsurance] = useState(false);
  const [removingInsurance, setRemovingInsurance] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const insuranceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/artisan/profile")
      .then((r) => r.json())
      .then((j) => {
        const p: ArtisanProfile = j.data;
        setProfile(p);
        if (p) {
          setForm({
            firstName: p.user.firstName,
            lastName: p.user.lastName,
            phone: p.user.phone ?? "",
            companyName: p.companyName,
            city: p.city,
            description: p.description ?? "",
            emergencyAvailable: p.emergencyAvailable,
          });
          if (p.photoUrl) setPhotoPreview(p.photoUrl);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setMsg({ type: "error", text: "Image trop grande (max 4 Mo). Compressez-la avant de l'envoyer." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch("/api/artisan/profile/photo", { method: "POST", body: fd });

      let json: { data?: { photoUrl: string }; error?: string } = {};
      try { json = await res.json(); } catch { /* réponse non-JSON */ }

      if (res.ok && json.data?.photoUrl) {
        setPhotoPreview(json.data.photoUrl);
        setProfile((p) => p ? { ...p, photoUrl: json.data!.photoUrl! } : p);
      } else {
        setPhotoPreview(profile?.photoUrl ?? null);
        const errorText = res.status === 413
          ? "Image trop grande pour le serveur. Utilisez une image de moins de 4 Mo."
          : json.error ?? "Erreur lors du téléchargement.";
        setMsg({ type: "error", text: errorText });
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleInsuranceCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED.includes(file.type)) {
      setMsg({ type: "error", text: "Format non supporté. Utilisez PDF, JPG, PNG ou WebP." });
      if (insuranceRef.current) insuranceRef.current.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMsg({ type: "error", text: "Fichier trop grand (max 10 Mo)." });
      if (insuranceRef.current) insuranceRef.current.value = "";
      return;
    }

    setUploadingInsurance(true);
    setMsg(null);
    try {
      // Étape 1 : obtenir une URL signée Supabase depuis notre API
      const signRes = await fetch(
        `/api/artisan/profile/insurance-cert?type=${encodeURIComponent(file.type)}`
      );
      const signJson = await signRes.json().catch(() => ({}));
      if (!signRes.ok) {
        setMsg({ type: "error", text: signJson.error ?? "Impossible d'initialiser l'upload." });
        return;
      }
      const { signedUrl, publicUrl } = signJson.data as { signedUrl: string; publicUrl: string };

      // Étape 2 : upload direct vers Supabase — contourne la limite 4.5 MB de Vercel
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) {
        setMsg({ type: "error", text: "Erreur lors de l'envoi vers le stockage. Réessayez." });
        return;
      }

      // Étape 3 : enregistrer l'URL publique en DB via notre API
      const saveRes = await fetch("/api/artisan/profile/insurance-cert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicUrl }),
      });
      const saveJson = await saveRes.json().catch(() => ({}));

      if (saveRes.ok && saveJson.data?.insuranceCertUrl) {
        setProfile((p) =>
          p ? { ...p, insuranceCertUrl: saveJson.data.insuranceCertUrl, insuranceVerified: false } : p
        );
        setMsg({ type: "success", text: "Attestation téléversée avec succès. En attente de vérification par GoServi." });
      } else {
        setMsg({ type: "error", text: saveJson.error ?? "Erreur lors de l'enregistrement." });
      }
    } catch {
      setMsg({ type: "error", text: "Une erreur inattendue est survenue. Réessayez." });
    } finally {
      setUploadingInsurance(false);
      if (insuranceRef.current) insuranceRef.current.value = "";
    }
  };

  const handleRemoveInsuranceCert = async () => {
    if (!confirm("Supprimer l'attestation d'assurance ? Vous devrez en uploader une nouvelle pour la vérification.")) return;
    setRemovingInsurance(true);
    setMsg(null);
    try {
      const res = await fetch("/api/artisan/profile/insurance-cert", { method: "DELETE" });
      if (res.ok) {
        setProfile((p) => p ? { ...p, insuranceCertUrl: null, insuranceVerified: false } : p);
        setMsg({ type: "success", text: "Attestation supprimée." });
      } else {
        const json = await res.json().catch(() => ({}));
        setMsg({ type: "error", text: (json as { error?: string }).error ?? "Erreur lors de la suppression." });
      }
    } finally {
      setRemovingInsurance(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/artisan/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.ok) {
        setProfile((p) => p ? { ...p, ...json.data, user: json.data.user } : p);
        setMsg({ type: "success", text: "Profil mis à jour avec succès !" });
      } else {
        setMsg({ type: "error", text: json.error ?? "Une erreur est survenue." });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
      </div>
    );
  }

  const initials = profile
    ? `${profile.user.firstName[0] ?? ""}${profile.user.lastName[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <div className="flex flex-col gap-5 w-full max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#1F2937]">Mon profil artisan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gérez vos informations professionnelles</p>
      </div>

      {/* Profile card */}
      <Card padding="md">
        <div className="flex items-start gap-4">
          {/* Avatar with upload */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[#1CA7A6] flex items-center justify-center text-white text-2xl font-bold">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Photo de profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs px-3 py-1.5 border border-[#D1E5E5] rounded-[8px] text-[#1CA7A6] hover:bg-[#F4F7F7] transition-colors font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <span className="w-3 h-3 border-2 border-[#1CA7A6] border-t-transparent rounded-full animate-spin" />
                  Envoi…
                </>
              ) : (
                <>📷 Changer la photo</>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-[#1F2937]">
                {profile?.user.firstName} {profile?.user.lastName}
              </p>
              {profile?.isApproved ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  Vérifié
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  En attente
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{profile?.companyName}</p>
            <p className="text-xs text-gray-400 mt-1">{profile?.user.email}</p>
            {profile && profile.ratingCount > 0 && (
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-amber-400 text-sm">★</span>
                <span className="text-sm font-medium text-[#1F2937]">
                  {profile.ratingAverage.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">
                  ({profile.ratingCount} avis)
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations professionnelles</CardTitle>
        </CardHeader>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Prénom"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              required
            />
            <Input
              label="Nom"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              required
            />
          </div>
          <Input
            label="Téléphone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+41 79 000 00 00"
          />
          <Input
            label="Raison sociale"
            value={form.companyName}
            onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
            required
          />
          <Input
            label="Ville d'intervention"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            required
            placeholder="Lausanne"
          />

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Décrivez vos compétences et votre expérience..."
              maxLength={500}
              rows={4}
              className="w-full px-3 py-2.5 bg-white border border-[#D1E5E5] rounded-[10px] text-sm text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1CA7A6] focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/500</p>
          </div>

          {/* Emergency toggle */}
          <div className="flex items-center justify-between p-3 bg-[#F4F7F7] rounded-[10px] border border-[#D1E5E5]">
            <div>
              <p className="text-sm font-medium text-[#1F2937]">Disponible pour les urgences</p>
              <p className="text-xs text-gray-500">Recevez des missions urgentes (tarif majoré)</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, emergencyAvailable: !f.emergencyAvailable }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.emergencyAvailable ? "bg-[#1CA7A6]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.emergencyAvailable ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Read-only: RC number */}
          <div className="p-3 bg-[#F4F7F7] rounded-[10px] border border-[#D1E5E5]">
            <p className="text-xs text-gray-400 mb-0.5">N° RC (Registre du Commerce)</p>
            <p className="text-sm font-medium text-[#1F2937]">{profile?.rcNumber}</p>
          </div>

          {msg && (
            <div
              className={`text-sm px-3 py-2 rounded-[8px] ${
                msg.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {msg.text}
            </div>
          )}

          <Button type="submit" loading={saving}>
            Enregistrer les modifications
          </Button>
        </form>
      </Card>

      {/* ── Attestation d'assurance RC Pro ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Attestation d&apos;assurance RC Pro</CardTitle>
        </CardHeader>

        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            Téléversez votre attestation d&apos;assurance responsabilité civile professionnelle.
            Ce document est obligatoire pour la vérification de votre profil par l&apos;équipe GoServi.
            Formats acceptés : <strong>PDF, JPG, PNG, WebP</strong> — max 10 Mo.
          </p>

          {profile?.insuranceCertUrl ? (
            /* Document présent */
            <div className="flex items-start justify-between gap-3 p-4 bg-[#F4F7F7] rounded-[10px] border border-[#D1E5E5]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-[8px] bg-[#E6F2F2] flex items-center justify-center text-[#1CA7A6] shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <a
                    href={profile.insuranceCertUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#1CA7A6] hover:underline block truncate"
                  >
                    Voir l&apos;attestation →
                  </a>
                  <div className="mt-1">
                    {profile.insuranceVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                        Vérifiée par GoServi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        En attente de vérification
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => insuranceRef.current?.click()}
                  disabled={uploadingInsurance}
                  className="text-xs px-2.5 py-1.5 border border-[#D1E5E5] rounded-[6px] text-[#1CA7A6] hover:bg-white transition-colors font-medium disabled:opacity-50"
                >
                  {uploadingInsurance ? "Envoi…" : "Remplacer"}
                </button>
                <button
                  type="button"
                  onClick={handleRemoveInsuranceCert}
                  disabled={removingInsurance}
                  className="text-xs px-2.5 py-1.5 border border-red-200 rounded-[6px] text-red-500 hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                >
                  {removingInsurance ? "…" : "Supprimer"}
                </button>
              </div>
            </div>
          ) : (
            /* Aucun document */
            <button
              type="button"
              onClick={() => insuranceRef.current?.click()}
              disabled={uploadingInsurance}
              className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-[#D1E5E5] rounded-[10px] hover:border-[#1CA7A6] hover:bg-[#F4F7F7] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingInsurance ? (
                <>
                  <span className="w-8 h-8 border-2 border-[#1CA7A6] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-[#1CA7A6] font-medium">Téléversement en cours…</span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-[#E6F2F2] flex items-center justify-center text-[#1CA7A6]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[#1CA7A6]">
                    Téléverser l&apos;attestation d&apos;assurance
                  </span>
                  <span className="text-xs text-gray-400">Cliquez pour sélectionner un fichier</span>
                </>
              )}
            </button>
          )}

          {/* Hidden file input for insurance cert */}
          <input
            ref={insuranceRef}
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleInsuranceCertUpload}
          />
        </div>
      </Card>

      {/* Services */}
      <ServicesSection
        services={profile?.services ?? []}
        onServicesChange={(services) => setProfile((p) => p ? { ...p, services } : p)}
      />
    </div>
  );
}
