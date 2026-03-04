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

  useEffect(() => {
    fetch(`/api/admin/artisans/${id}`)
      .then((r) => r.json())
      .then((j) => setArtisan(j.data ?? null))
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
        <p className="text-4xl mb-3">{done === "approved" ? "✅" : "❌"}</p>
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
              <p className="text-[#1F2937]">📍 {artisan.city}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Urgences</span>
              <p className="text-[#1F2937]">{artisan.emergencyAvailable ? "⚡ Disponible" : "Non"}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Inscrit le</span>
              <p className="text-[#1F2937]">{format(new Date(artisan.createdAt), "d MMMM yyyy", { locale: fr })}</p>
            </div>
            {artisan.ratingCount > 0 && (
              <div>
                <span className="text-xs text-gray-400">Note</span>
                <p className="text-[#1F2937]">⭐ {artisan.ratingAverage.toFixed(1)} ({artisan.ratingCount} avis)</p>
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
                  <span className="text-lg">{s.category.icon ?? "🔧"}</span>
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
                  <p className="text-xs text-gray-400 truncate">📍 {a.job.city}</p>
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
