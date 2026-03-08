"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ArtisanForMap } from "@/components/ui/ArtisanMap";

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  clientFirstName: string;
  clientLastName: string;
}

interface Props {
  artisan: ArtisanForMap;
  onClose: () => void;
}

function Stars({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "text-xs" : "text-base";
  return (
    <span className={`inline-flex gap-px ${cls}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}>
          ★
        </span>
      ))}
    </span>
  );
}

function buildContactUrl(artisan: ArtisanForMap): string {
  const params = new URLSearchParams({
    artisanId: artisan.id,
    artisanName: artisan.companyName,
    city: artisan.city,
  });
  if (artisan.services.length > 0) {
    params.set("categoryId", artisan.services[0].category.id);
  }
  return `/dashboard/new-job?${params.toString()}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-CH", { month: "long", year: "numeric" });
}

export function ArtisanProfileModal({ artisan, onClose }: Props) {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Fermer avec Échap + bloquer scroll body
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Charger les avis au montage
  useEffect(() => {
    if (!artisan.ratingCount) return;
    setReviewsLoading(true);
    fetch(`/api/artisans/${artisan.id}/reviews`)
      .then((r) => r.json())
      .then((j) => setReviews(j.data?.reviews ?? []))
      .catch(() => {/* ignore */})
      .finally(() => setReviewsLoading(false));
  }, [artisan.id, artisan.ratingCount]);

  const minPrice =
    artisan.services.length > 0
      ? Math.min(...artisan.services.map((s) => s.basePrice))
      : null;

  const initials =
    (artisan.user.firstName[0] ?? "") + (artisan.user.lastName[0] ?? "");

  const handleContact = () => {
    onClose();
    router.push(buildContactUrl(artisan));
  };

  return (
    /* ── Backdrop ─────────────────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      {/* ── Carte modal ─────────────────────────────────────────────────── */}
      <div
        className="relative w-full max-w-[480px] max-h-[90vh] bg-white rounded-[20px] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
          aria-label="Fermer"
        >
          <span className="text-white font-bold text-sm leading-none">✕</span>
        </button>

        {/* ── En-tête avec photo ──────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#E6F2F2] to-[#D1E5E5] px-6 pt-8 pb-5 shrink-0">
          <div className="flex items-center gap-4">
            {/* Avatar / Photo */}
            <div className="w-20 h-20 rounded-full overflow-hidden bg-[#1CA7A6] flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-md border-4 border-white">
              {artisan.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={artisan.photoUrl}
                  alt={artisan.companyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-[#1F2937] leading-tight truncate">
                {artisan.companyName}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">📍 {artisan.city}</p>

              {/* Rating global */}
              {artisan.ratingCount > 0 ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <Stars rating={artisan.ratingAverage} />
                  <span className="text-xs font-semibold text-[#1F2937]">
                    {artisan.ratingAverage.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({artisan.ratingCount} avis)
                  </span>
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Aucun avis pour l&apos;instant</p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  ✅ Vérifié
                </span>
                {artisan.emergencyAvailable && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    ⚡ Urgences 24h/24
                  </span>
                )}
                {minPrice && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E6F2F2] text-[#1CA7A6]">
                    Dès {minPrice} CHF/h
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Corps scrollable ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">

          {/* Description */}
          {artisan.description && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                À propos
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {artisan.description}
              </p>
            </div>
          )}

          {/* Services */}
          {artisan.services.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Services proposés
              </p>
              <div className="flex flex-col gap-2">
                {artisan.services.map((s) => (
                  <div
                    key={s.category.slug}
                    className="flex items-center justify-between px-3 py-2.5 bg-[#F4F7F7] rounded-[10px]"
                  >
                    <span className="text-sm text-[#1F2937] font-medium">
                      {s.category.icon && (
                        <span className="mr-2">{s.category.icon}</span>
                      )}
                      {s.category.name}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#1CA7A6]">
                        dès {s.basePrice} CHF/h
                      </p>
                      {s.emergencyFee > 0 && (
                        <p className="text-[10px] text-gray-400">
                          Urgence +{s.emergencyFee} CHF
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Section Avis ──────────────────────────────────────────────── */}
          {artisan.ratingCount > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Avis clients ({artisan.ratingCount})
              </p>

              {reviewsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-[#1CA7A6] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-3">Aucun avis disponible</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="bg-[#F4F7F7] rounded-[12px] p-3 border border-[#E6F2F2]"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1CA7A6]/15 flex items-center justify-center text-[10px] font-bold text-[#1CA7A6]">
                            {r.clientFirstName[0]}{r.clientLastName[0]}
                          </div>
                          <span className="text-xs font-semibold text-[#1F2937]">
                            {r.clientFirstName} {r.clientLastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Stars rating={r.rating} size="sm" />
                          <span className="text-xs font-semibold text-[#1F2937]">
                            {r.rating}/5
                          </span>
                        </div>
                      </div>
                      {r.comment && (
                        <p className="text-xs text-gray-500 leading-relaxed mt-1.5 ml-9">
                          &ldquo;{r.comment}&rdquo;
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1 ml-9">
                        {formatDate(r.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pas de description ni services ni avis */}
          {!artisan.description && artisan.services.length === 0 && artisan.ratingCount === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Aucune information supplémentaire disponible.
            </p>
          )}
        </div>

        {/* ── Pied fixe — CTA ─────────────────────────────────────────────── */}
        <div className="shrink-0 px-6 py-4 border-t border-[#E6F2F2] bg-white flex flex-col gap-2">
          <button
            onClick={handleContact}
            className="w-full py-3.5 rounded-[12px] text-white font-bold text-sm transition-opacity hover:opacity-90 active:opacity-80"
            style={{ backgroundColor: "#1CA7A6" }}
          >
            Contacter {artisan.companyName}
          </button>
          {artisan.emergencyAvailable && (
            <button
              onClick={() => {
                onClose();
                router.push(`${buildContactUrl(artisan)}&urgencyLevel=URGENT`);
              }}
              className="w-full py-3 rounded-[12px] text-amber-800 font-semibold text-sm bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              ⚡ Mission urgente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
