"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PasswordData {
  current: string;
  next: string;
  confirm: string;
}

export default function ClientProfilePage() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [passwords, setPasswords] = useState<PasswordData>({
    current: "",
    next: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
      });
      if (user.avatarUrl) setAvatarPreview(user.avatarUrl);
    }
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Aperçu local immédiat
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setUploadMsg(null);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch("/api/users/me/avatar", { method: "POST", body: formData });
      const json = await res.json();
      if (res.ok) {
        setUser({ ...user!, avatarUrl: json.data.avatarUrl });
        setUploadMsg({ type: "success", text: "Photo mise à jour !" });
      } else {
        setAvatarPreview(user?.avatarUrl ?? null);
        setUploadMsg({ type: "error", text: json.error ?? "Échec de l'upload." });
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setUser({ ...user!, ...json.data });
        setProfileMsg({ type: "success", text: "Profil mis à jour avec succès !" });
      } else {
        setProfileMsg({ type: "error", text: json.error ?? "Une erreur est survenue." });
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      setPwMsg({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (passwords.next.length < 8) {
      setPwMsg({ type: "error", text: "Le nouveau mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    setChangingPw(true);
    setPwMsg(null);
    try {
      const res = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.next }),
      });
      const json = await res.json();
      if (res.ok) {
        setPasswords({ current: "", next: "", confirm: "" });
        setPwMsg({ type: "success", text: "Mot de passe changé avec succès !" });
      } else {
        setPwMsg({ type: "error", text: json.error ?? "Une erreur est survenue." });
      }
    } finally {
      setChangingPw(false);
    }
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <div className="flex flex-col gap-5 w-full max-w-xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[#1F2937]">Mon profil</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gérez vos informations personnelles</p>
      </div>

      {/* Avatar */}
      <Card padding="md">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2 shrink-0">
            {/* Cercle avatar cliquable */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-16 h-16 rounded-full overflow-hidden bg-[#1CA7A6] flex items-center justify-center text-white text-xl font-bold">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Photo de profil" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </div>

            {/* Bouton changer photo */}
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
                "📷 Changer la photo"
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div>
            <p className="font-semibold text-[#1F2937]">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#E6F2F2] text-[#178F8E]">
              Client
            </span>
            {uploadMsg && (
              <p className={`text-xs mt-1 ${uploadMsg.type === "success" ? "text-green-600" : "text-red-500"}`}>
                {uploadMsg.text}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>

        <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Prénom"
              value={profile.firstName}
              onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
              required
            />
            <Input
              label="Nom"
              value={profile.lastName}
              onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={profile.email}
            disabled
            helperText="L'email ne peut pas être modifié"
          />
          <Input
            label="Téléphone"
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+41 79 000 00 00"
          />

          {profileMsg && (
            <div
              className={`text-sm px-3 py-2 rounded-[8px] ${
                profileMsg.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <Button type="submit" loading={saving}>
            Enregistrer les modifications
          </Button>
        </form>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Changer le mot de passe</CardTitle>
        </CardHeader>

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
          <Input
            label="Mot de passe actuel"
            type="password"
            autoComplete="current-password"
            value={passwords.current}
            onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
            required
          />
          <Input
            label="Nouveau mot de passe"
            type="password"
            autoComplete="new-password"
            value={passwords.next}
            onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
            helperText="Minimum 8 caractères"
            required
          />
          <Input
            label="Confirmer le nouveau mot de passe"
            type="password"
            autoComplete="new-password"
            value={passwords.confirm}
            onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
            required
          />

          {pwMsg && (
            <div
              className={`text-sm px-3 py-2 rounded-[8px] ${
                pwMsg.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {pwMsg.text}
            </div>
          )}

          <Button type="submit" variant="outline" loading={changingPw}>
            Modifier le mot de passe
          </Button>
        </form>
      </Card>

      {/* Account info */}
      <Card padding="md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E6F2F2] flex items-center justify-center text-[#1CA7A6]">
            🔒
          </div>
          <div>
            <p className="text-sm font-medium text-[#1F2937]">Compte vérifié</p>
            <p className="text-xs text-gray-500">
              Votre compte est sécurisé avec une authentification JWT
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
