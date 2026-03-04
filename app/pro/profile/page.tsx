"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface ArtisanProfile {
  id: string;
  companyName: string;
  rcNumber: string;
  city: string;
  description: string | null;
  emergencyAvailable: boolean;
  insuranceVerified: boolean;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch("/api/artisan/profile/photo", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok) {
        setPhotoPreview(json.data.photoUrl);
        setProfile((p) => p ? { ...p, photoUrl: json.data.photoUrl } : p);
      } else {
        setMsg({ type: "error", text: json.error ?? "Erreur lors du téléchargement." });
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
              {/* Hover overlay */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <span className="text-white text-xs font-medium">✏️</span>
              </div>
            </div>
            {/* Visible upload button */}
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
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  ✓ Vérifié
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  ⏳ En attente
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

          {/* Read-only info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-[#F4F7F7] rounded-[10px] border border-[#D1E5E5]">
              <p className="text-xs text-gray-400 mb-0.5">N° RC</p>
              <p className="text-sm font-medium text-[#1F2937]">{profile?.rcNumber}</p>
            </div>
            <div className="p-3 bg-[#F4F7F7] rounded-[10px] border border-[#D1E5E5]">
              <p className="text-xs text-gray-400 mb-0.5">Assurance</p>
              <p className="text-sm font-medium text-[#1F2937]">
                {profile?.insuranceVerified ? "✓ Vérifiée" : "Non vérifiée"}
              </p>
            </div>
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

      {/* Services */}
      {profile?.services.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Services proposés</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-2">
            {profile.services.map((service) => (
              <div
                key={service.id}
                className={`flex items-center justify-between p-3 rounded-[8px] border ${
                  service.isActive
                    ? "border-[#D1E5E5] bg-white"
                    : "border-gray-200 bg-gray-50 opacity-60"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-[#1F2937]">{service.category.name}</p>
                  <p className="text-xs text-gray-400">
                    Base: {service.basePrice} CHF/h · Urgence: +{service.emergencyFee} CHF
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    service.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {service.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
