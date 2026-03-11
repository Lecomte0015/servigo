"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, JobStatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface ArtisanDetail {
  id: string;
  companyName: string;
  rcNumber: string;
  city: string;
  description: string | null;
  isApproved: boolean;
  emergencyAvailable: boolean;
  insuranceVerified: boolean;
  insuranceCertUrl: string | null;
  ratingAverage: number;
  ratingCount: number;
  createdAt: string;
  photoUrl: string | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    createdAt: string;
    isBlocked: boolean;
  };
  services: Array<{
    basePrice: number;
    emergencyFee: number;
    isActive: boolean;
    category: { name: string; icon: string | null };
  }>;
  assignments: Array<{
    acceptedAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    finalPrice: number | null;
    job: {
      id: string;
      status: string;
      description: string;
      city: string;
      createdAt: string;
      category: { name: string };
    };
  }>;
}

export default function AdminArtisanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [artisan, setArtisan] = useState<ArtisanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);
  const [insVerified, setInsVerified] = useState(false);
  const [verifyingIns, setVerifyingIns] = useState(false);
  const [rejectInsMode, setRejectInsMode] = useState(false);
  const [rejectInsReason, setRejectInsReason] = useState("");
  const [certLoading, setCertLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/artisans/${id}`)
      .then((r) => r.json())
      .then((j) => {
        const data: ArtisanDetail = j.data ?? null;
        setArtisan(data);
        if (data) {
          setInsVerified(data.insuranceVerified);
          setIsBlocked(data.user.isBlocked);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    setActioning(true);
    try {
      await fetch(`/api/admin/artisans/${id}/approve`, { method: "POST" });
      setDone("approved");
      setTimeout(() => router.push("/admin/artisans"), 1500);
    } finally {
      setActioning(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setActioning(true);
    try {
      await fetch(`/api/admin/artisans/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      setDone("rejected");
      setTimeout(() => router.push("/admin/artisans"), 1500);
    } finally {
      setActioning(false);
    }
  };

  const handleVerifyInsurance = async (verified: boolean, reason?: string) => {
    setVerifyingIns(true);
    try {
      const res = await fetch(`/api/admin/artisans/${id}/verify-insurance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified, reason }),
      });
      if (res.ok) {
        setInsVerified(verified);
        setArtisan((a) => a ? { ...a, insuranceVerified: verified } : a);
        setRejectInsMode(false);
        setRejectInsReason("");
      }
    } finally {
      setVerifyingIns(false);
    }
  };

  const handleBlock = async (blocked: boolean) => {
    setBlocking(true);
    try {
      const res = await fetch(`/api/admin/artisans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked }),
      });
      if (res.ok) setIsBlocked(blocked);
    } finally {
      setBlocking(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/artisans/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok) {
        router.push("/admin/artisans");
      } else {
        alert(json.error ?? "Erreur lors de la suppression");
        setConfirmDelete(false);
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleViewCert = async () => {
    setCertLoading(true);
    try {
      const res = await fetch(`/api/admin/artisans/${id}/insurance-cert-url`);
      const json = await res.json();
      if (res.ok && json.data?.signedUrl) {
        window.open(json.data.signedUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setCertLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Artisan introuvable</p>
        <Link href="/admin/artisans" className="text-sm text-[#1CA7A6] mt-2 block hover:underline">
          ← Retour
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-20">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${done === "approved" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
          {done === "approved" ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          )}
        </div>
        <p className="text-lg font-semibold text-[#1F2937]">
          {done === "approved" ? "Artisan approuvé !" : "Demande refusée"}
        </p>
        <p className="text-sm text-gray-400 mt-1">Redirection en cours…</p>
      </div>
    );
  }

  const initials = `${artisan.user.firstName[0] || ""}${artisan.user.lastName[0] || ""}`.toUpperCase();

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/artisans" className="text-gray-400 hover:text-[#1CA7A6] transition-colors text-sm">
          ← Artisans
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-[#1F2937]">{artisan.companyName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-[#1CA7A6] flex items-center justify-center text-white text-xl font-bold shrink-0">
            {artisan.photoUrl ? (
              <img src={artisan.photoUrl} alt={artisan.companyName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-[#1F2937]">{artisan.companyName}</h1>
              <Badge variant={artisan.isApproved ? "success" : "warning"}>
                {artisan.isApproved ? "Approuvé" : "En attente"}
              </Badge>
              {isBlocked && (
                <Badge variant="neutral">Suspendu</Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {artisan.user.firstName} {artisan.user.lastName} · {artisan.user.email}
            </p>
          </div>
        </div>

        {!artisan.isApproved && (
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              loading={actioning && !rejectMode}
              onClick={() => { setRejectMode(false); handleApprove(); }}
            >
              ✓ Approuver
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRejectMode((v) => !v)}
            >
              ✗ Refuser
            </Button>
          </div>
        )}
      </div>

      {/* Reject form */}
      {rejectMode && (
        <Card>
          <p className="text-sm font-medium text-[#1F2937] mb-2">Motif du refus</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Ex: Numéro RC invalide, dossier incomplet…"
            className="w-full border border-[#D1E5E5] rounded-[8px] px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:border-[#1CA7A6]"
          />
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              loading={actioning}
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              className="text-red-500 border-red-200 hover:border-red-400"
            >
              Confirmer le refus
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRejectMode(false)}>
              Annuler
            </Button>
          </div>
        </Card>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <div className="flex flex-col gap-2 text-sm">
            <div>
              <span className="text-xs text-gray-400">RC / Registre</span>
              <p className="text-[#1F2937] font-medium">{artisan.rcNumber}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Ville</span>
              <p className="text-[#1F2937]">{artisan.city}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Urgences</span>
              <p className="text-[#1F2937]">{artisan.emergencyAvailable ? "Disponible" : "Non"}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Inscrit le</span>
              <p className="text-[#1F2937]">{format(new Date(artisan.createdAt), "d MMMM yyyy", { locale: fr })}</p>
            </div>
            {artisan.ratingCount > 0 && (
              <div>
                <span className="text-xs text-gray-400">Note</span>
                <p className="text-[#1F2937] flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  {artisan.ratingAverage.toFixed(1)} ({artisan.ratingCount} avis)
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <div className="flex flex-col gap-2 text-sm">
            <div>
              <span className="text-xs text-gray-400">Nom</span>
              <p className="text-[#1F2937]">{artisan.user.firstName} {artisan.user.lastName}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Email</span>
              <p className="text-[#1F2937]">{artisan.user.email}</p>
            </div>
            {artisan.user.phone && (
              <div>
                <span className="text-xs text-gray-400">Téléphone</span>
                <a href={`tel:${artisan.user.phone}`} className="text-[#1CA7A6] hover:underline block">
                  {artisan.user.phone}
                </a>
              </div>
            )}
            <div>
              <span className="text-xs text-gray-400">Membre depuis</span>
              <p className="text-[#1F2937]">{format(new Date(artisan.user.createdAt), "d MMMM yyyy", { locale: fr })}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Documents de vérification ───────────────────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle>Documents de vérification</CardTitle></CardHeader>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Infos document */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[8px] bg-[#E6F2F2] flex items-center justify-center text-[#1CA7A6] shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">Attestation d&apos;assurance RC Pro</p>
              {artisan.insuranceCertUrl ? (
                <button
                  onClick={handleViewCert}
                  disabled={certLoading}
                  className="text-sm font-medium text-[#1CA7A6] hover:underline text-left disabled:opacity-50"
                >
                  {certLoading ? "Chargement…" : "Consulter le document →"}
                </button>
              ) : (
                <p className="text-sm text-gray-400 italic">Aucun document fourni</p>
              )}
              <div className="mt-1.5">
                {insVerified ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    Vérifiée
                  </span>
                ) : artisan.insuranceCertUrl ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    En attente de vérification
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                    Aucun document
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          {artisan.insuranceCertUrl && (
            <div className="flex gap-2 shrink-0">
              {insVerified ? (
                <button
                  onClick={() => { setRejectInsMode((v) => !v); setRejectInsReason(""); }}
                  disabled={verifyingIns}
                  className="text-xs px-3 py-1.5 border border-red-200 rounded-[6px] text-red-500 hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                >
                  ✗ Révoquer
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleVerifyInsurance(true)}
                    disabled={verifyingIns}
                    className="text-xs px-3 py-1.5 border border-green-200 rounded-[6px] text-green-700 hover:bg-green-50 transition-colors font-medium disabled:opacity-50"
                  >
                    {verifyingIns && !rejectInsMode ? "…" : "✓ Valider"}
                  </button>
                  <button
                    onClick={() => { setRejectInsMode((v) => !v); setRejectInsReason(""); }}
                    disabled={verifyingIns}
                    className="text-xs px-3 py-1.5 border border-red-200 rounded-[6px] text-red-500 hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                  >
                    ✗ Refuser
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Formulaire de refus avec motif */}
        {rejectInsMode && (
          <div className="mt-4 pt-4 border-t border-[#E6F2F2]">
            <p className="text-sm font-medium text-[#1F2937] mb-2">
              Motif du refus <span className="text-red-400">*</span>
            </p>
            <textarea
              value={rejectInsReason}
              onChange={(e) => setRejectInsReason(e.target.value)}
              placeholder="Ex : Document illisible, attestation expirée, mauvais document fourni…"
              className="w-full border border-[#D1E5E5] rounded-[8px] px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:border-[#1CA7A6]"
            />
            <p className="text-xs text-gray-400 mt-1 mb-3">
              Ce message sera envoyé à l&apos;artisan par notification.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleVerifyInsurance(false, rejectInsReason)}
                disabled={!rejectInsReason.trim() || verifyingIns}
                className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-[6px] hover:bg-red-600 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {verifyingIns ? "Envoi…" : "Confirmer le refus"}
              </button>
              <button
                onClick={() => { setRejectInsMode(false); setRejectInsReason(""); }}
                className="text-xs px-3 py-1.5 border border-[#D1E5E5] rounded-[6px] text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Actions admin (bloc / suppression) ──────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle>Actions administrateur</CardTitle></CardHeader>
        <div className="flex flex-col gap-4">
          {/* Bloc / Débloquer */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium text-[#1F2937] flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${isBlocked ? "bg-red-500" : "bg-green-500"}`} />
                {isBlocked ? "Compte suspendu" : "Compte actif"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isBlocked
                  ? "L'artisan ne peut plus se connecter à la plateforme."
                  : "L'artisan peut accéder normalement à la plateforme."}
              </p>
            </div>
            <button
              onClick={() => handleBlock(!isBlocked)}
              disabled={blocking}
              className={`text-sm px-4 py-2 rounded-[8px] font-medium transition-colors disabled:opacity-50 shrink-0 ${
                isBlocked
                  ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                  : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              {blocking ? "…" : isBlocked ? "✓ Réactiver le compte" : "⊘ Suspendre le compte"}
            </button>
          </div>

          {/* Suppression */}
          <div className="pt-4 border-t border-[#E6F2F2]">
            {!confirmDelete ? (
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-red-600">Supprimer l'artisan</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Action irréversible. Toutes les données seront supprimées définitivement.
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm px-4 py-2 rounded-[8px] font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors shrink-0"
                >
                  Supprimer le compte
                </button>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-[8px] p-4">
                <p className="text-sm font-semibold text-red-700 mb-1">
                  Confirmer la suppression de {artisan.companyName} ?
                </p>
                <p className="text-xs text-red-500 mb-3">
                  Cette action est irréversible. Toutes les données (profil, missions, avis) seront supprimées.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-sm px-4 py-2 bg-red-600 text-white rounded-[8px] font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting ? "Suppression…" : "Oui, supprimer définitivement"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-sm px-4 py-2 border border-[#D1E5E5] rounded-[8px] text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Description */}
      {artisan.description && (
        <Card>
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <p className="text-sm text-gray-600 leading-relaxed">{artisan.description}</p>
        </Card>
      )}

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Services proposés ({artisan.services.length})</CardTitle>
        </CardHeader>
        {artisan.services.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun service configuré</p>
        ) : (
          <div className="flex flex-col divide-y divide-[#E6F2F2]">
            {artisan.services.map((s) => (
              <div key={s.category.name} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {s.category.icon ? (
                    <span className="text-base shrink-0">{s.category.icon}</span>
                  ) : (
                    <div className="w-7 h-7 rounded-[6px] bg-[#E6F2F2] flex items-center justify-center text-[#1CA7A6] shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#1F2937]">{s.category.name}</p>
                    <p className="text-xs text-gray-400">Urgence : +{s.emergencyFee} CHF/h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#1CA7A6]">{s.basePrice} CHF/h</span>
                  {!s.isActive && <Badge variant="warning">Inactif</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Historique des missions */}
      {artisan.assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Missions récentes ({artisan.assignments.length})</CardTitle>
          </CardHeader>
          <div className="flex flex-col divide-y divide-[#E6F2F2]">
            {artisan.assignments.map((a) => (
              <div key={a.job.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-medium text-[#1F2937]">{a.job.category.name}</span>
                    <JobStatusBadge status={a.job.status} />
                  </div>
                  <p className="text-xs text-gray-400 truncate">{a.job.city}</p>
                  {a.completedAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Terminée le {format(new Date(a.completedAt), "d MMM yyyy", { locale: fr })}
                    </p>
                  )}
                </div>
                {a.finalPrice && (
                  <span className="text-sm font-semibold text-[#1CA7A6] shrink-0">
                    {a.finalPrice.toFixed(0)} CHF
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
