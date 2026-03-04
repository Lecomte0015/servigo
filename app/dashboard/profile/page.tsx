"use client";

import { useEffect, useState } from "react";
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
    }
  }, [user]);

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
          <div className="w-14 h-14 rounded-full bg-[#1CA7A6] flex items-center justify-center text-white text-xl font-bold">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-[#1F2937]">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#E6F2F2] text-[#178F8E]">
              Client
            </span>
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
