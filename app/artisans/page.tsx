"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { ArtisanForMap } from "@/components/ui/ArtisanMap";

// Import dynamique du composant carte (Leaflet nécessite window)
const ArtisanMap = dynamic(() => import("@/components/ui/ArtisanMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#F4F7F7]">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
        <span className="text-sm">Chargement de la carte…</span>
      </div>
    </div>
  ),
});

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

// ─── Carte artisan dans la liste ──────────────────────────────────────────────

function ArtisanCard({
  artisan,
  isSelected,
  onSelect,
  onContact,
}: {
  artisan: ArtisanForMap;
  isSelected: boolean;
  onSelect: () => void;
  onContact: () => void;
}) {
  const minPrice =
    artisan.services.length > 0
      ? Math.min(...artisan.services.map((s) => s.basePrice))
      : null;

  return (
    <div
      onClick={onSelect}
      className={`p-4 cursor-pointer border-b border-[#E6F2F2] transition-colors hover:bg-[#F4F7F7] ${
        isSelected ? "bg-[#E6F2F2] border-l-4 border-l-[#1CA7A6]" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full overflow-hidden bg-[#1CA7A6] flex items-center justify-center text-white text-sm font-bold shrink-0">
          {artisan.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artisan.photoUrl}
              alt={artisan.companyName}
              className="w-full h-full object-cover"
            />
          ) : (
            (artisan.user.firstName[0] ?? "") + (artisan.user.lastName[0] ?? "")
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="text-sm font-semibold text-[#1F2937] leading-tight truncate">
              {artisan.companyName}
            </p>
            <div className="flex items-center gap-0.5 shrink-0">
              <span className="text-amber-400 text-xs">★</span>
              <span className="text-xs font-semibold text-[#1F2937]">
                {artisan.ratingAverage.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">({artisan.ratingCount})</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-0.5">📍 {artisan.city}</p>

          {artisan.services.length > 0 && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {artisan.services
                .map((s) =>
                  s.category.icon
                    ? `${s.category.icon} ${s.category.name}`
                    : s.category.name
                )
                .join(" · ")}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {minPrice && (
                <span className="text-xs font-semibold text-[#1CA7A6]">
                  Dès {minPrice} CHF
                </span>
              )}
              {artisan.emergencyAvailable && (
                <span className="text-xs text-red-500 font-medium">⚡ Urgences</span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onContact();
              }}
              className="text-xs px-3 py-1.5 bg-[#1CA7A6] text-white rounded-[6px] hover:bg-[#178F8E] transition-colors font-medium shrink-0"
            >
              Contacter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ArtisansMapPage() {
  const router = useRouter();
  const [artisans, setArtisans] = useState<ArtisanForMap[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [view, setView] = useState<"list" | "map">("map");

  const fetchArtisans = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryFilter) params.set("categoryId", categoryFilter);
    if (citySearch.trim()) params.set("city", citySearch.trim());

    fetch(`/api/artisans?${params}`)
      .then((r) => r.json())
      .then((j) => setArtisans(j.data?.artisans ?? []))
      .finally(() => setLoading(false));
  }, [categoryFilter, citySearch]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((j) => setCategories(j.data ?? []));
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchArtisans, 300);
    return () => clearTimeout(t);
  }, [fetchArtisans]);

  const handleContact = useCallback(
    (artisan: ArtisanForMap) => {
      const params = new URLSearchParams({
        artisanId: artisan.id,
        artisanName: artisan.companyName,
        city: artisan.city,
      });
      router.push(`/dashboard/new-job?${params}`);
    },
    [router]
  );

  const handleSelect = useCallback((artisan: ArtisanForMap) => {
    setSelectedId((prev) => (prev === artisan.id ? null : artisan.id));
  }, []);

  // La page est rendue dans DashboardShell fullBleed
  // → elle occupe tout l'espace disponible (h-full dans le flex container)
  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Barre de filtres ─────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-[#E6F2F2] bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">

          {/* Titre */}
          <div className="flex items-center gap-2 mr-2">
            <span className="text-lg">🗺️</span>
            <h1 className="text-base font-bold text-[#1F2937]">Carte des artisans</h1>
          </div>

          {/* Filtre catégorie */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 min-w-[180px] max-w-[260px] border border-[#D1E5E5] rounded-[10px] px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#1CA7A6] focus:ring-2 focus:ring-[#1CA7A6]/20 text-[#1F2937] cursor-pointer"
          >
            <option value="">🏷️ Tous les services</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          {/* Recherche ville */}
          <div className="relative flex-1 min-w-[160px] max-w-[220px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Rechercher une ville…"
              className="w-full border border-[#D1E5E5] rounded-[10px] pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#1CA7A6] focus:ring-2 focus:ring-[#1CA7A6]/20 text-[#1F2937]"
            />
          </div>

          {/* Compteur */}
          {!loading && (
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {artisans.length} artisan{artisans.length !== 1 ? "s" : ""}
            </span>
          )}
          {loading && (
            <div className="w-4 h-4 border-2 border-[#1CA7A6] border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Onglets mobile Carte / Liste */}
        <div className="lg:hidden flex mt-3 border-t border-[#E6F2F2] pt-2 gap-1">
          {(["map", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-2 text-sm font-medium rounded-[8px] transition-colors ${
                view === v
                  ? "bg-[#E6F2F2] text-[#1CA7A6]"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {v === "map" ? "🗺️ Carte" : "📋 Liste"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenu : liste + carte ────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Liste artisans (sidebar) ── */}
        <aside
          className={`w-full lg:w-[340px] xl:w-[380px] border-r border-[#E6F2F2] overflow-y-auto shrink-0 flex flex-col bg-white ${
            view === "list" ? "flex" : "hidden"
          } lg:flex`}
        >
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
            </div>
          ) : artisans.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm text-gray-500 font-medium">Aucun artisan trouvé</p>
              <p className="text-xs text-gray-400 mt-1">
                Essayez une autre ville ou un autre service
              </p>
            </div>
          ) : (
            artisans.map((artisan) => (
              <ArtisanCard
                key={artisan.id}
                artisan={artisan}
                isSelected={selectedId === artisan.id}
                onSelect={() => {
                  handleSelect(artisan);
                  setView("map");
                }}
                onContact={() => handleContact(artisan)}
              />
            ))
          )}

          {/* Footer */}
          <div className="mt-auto p-3 border-t border-[#E6F2F2] bg-[#F4F7F7] shrink-0">
            <p className="text-xs text-gray-400 text-center">
              🗺️ Carte © OpenStreetMap · Artisans vérifiés GoServi
            </p>
          </div>
        </aside>

        {/* ── Carte ── */}
        <main
          className={`${view === "map" ? "flex" : "hidden"} lg:flex flex-1 relative overflow-hidden`}
        >
          {artisans.length === 0 && !loading ? (
            <div className="w-full h-full flex items-center justify-center bg-[#F4F7F7]">
              <div className="text-center">
                <p className="text-4xl mb-3">🗺️</p>
                <p className="text-gray-500 text-sm">
                  Aucun artisan géolocalisé dans cette zone
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Modifiez les filtres pour en voir d&apos;autres
                </p>
              </div>
            </div>
          ) : (
            <ArtisanMap
              artisans={artisans}
              selectedId={selectedId}
              onSelect={handleSelect}
              onContact={handleContact}
            />
          )}

          {/* Badge sélectionné (mobile) */}
          {selectedId && (
            <div className="lg:hidden absolute bottom-4 left-0 right-0 px-4 z-[1000]">
              {(() => {
                const a = artisans.find((x) => x.id === selectedId);
                if (!a) return null;
                return (
                  <div className="bg-white rounded-[12px] shadow-xl border border-[#D1E5E5] p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1F2937]">{a.companyName}</p>
                      <p className="text-xs text-gray-500">
                        ⭐ {a.ratingAverage.toFixed(1)} · 📍 {a.city}
                      </p>
                    </div>
                    <button
                      onClick={() => handleContact(a)}
                      className="shrink-0 bg-[#1CA7A6] text-white text-xs font-semibold px-4 py-2 rounded-[8px] hover:bg-[#178F8E]"
                    >
                      Contacter
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
