"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  slug: string;
  description?: string | null;
}

interface Props {
  categories: Category[];
  placeholder: string;
  ctaText: string;
  primaryColor: string;
}

export function HomeSearchBar({ categories, placeholder, ctaText, primaryColor }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  // null = chargement en cours, true = connecté, false = non connecté
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // ── Vérification auth (une seule fois au montage) ──────────────────────────
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => setIsLoggedIn(r.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  // ── Fermer le dropdown au clic extérieur ───────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Filtrage des catégories ────────────────────────────────────────────────
  const filtered =
    query.trim().length >= 2
      ? categories.filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.slug.toLowerCase().includes(query.toLowerCase())
        )
      : categories.slice(0, 6); // Top 6 par défaut quand le champ est focus

  // ── Navigation au clic sur une catégorie ──────────────────────────────────
  const handleSelect = useCallback(
    (cat: Category) => {
      setOpen(false);
      setQuery(cat.name);
      if (isLoggedIn) {
        router.push(`/dashboard/new-job?categoryId=${cat.id}`);
      } else {
        // Redirige vers login avec un redirect vers new-job après connexion
        router.push(
          `/auth/login?redirect=${encodeURIComponent(`/dashboard/new-job?categoryId=${cat.id}`)}`
        );
      }
    },
    [isLoggedIn, router]
  );

  // ── Soumission du champ texte (bouton ou Entrée) ───────────────────────────
  const handleSubmit = () => {
    if (!query.trim()) {
      setOpen(true);
      return;
    }
    const q = query.toLowerCase();
    const match = categories.find(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
    if (match) {
      handleSelect(match);
    } else {
      setOpen(true); // Montre le dropdown "aucun résultat"
    }
  };

  const showFooterLogin = isLoggedIn === false;

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      {/* ── Champ de recherche ─────────────────────────────────────────────── */}
      <div
        className={`flex rounded-[14px] overflow-hidden border bg-white shadow-lg transition-shadow ${
          open ? "shadow-xl border-[#1CA7A6]" : "border-[#D1E5E5]"
        }`}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 px-5 py-4 text-sm text-[#1F2937] placeholder:text-gray-400 focus:outline-none bg-transparent"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="text-white font-semibold px-7 py-4 text-sm transition-colors shrink-0 hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          {ctaText}
        </button>
      </div>

      {/* ── Dropdown ───────────────────────────────────────────────────────── */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#D1E5E5] rounded-[14px] shadow-2xl z-[100] overflow-hidden">

          {filtered.length === 0 ? (
            <div className="px-5 py-5 text-center">
              <p className="text-sm text-gray-400">Aucun service trouvé pour &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-gray-400 mt-1">
                Essayez : plombier, électricien, serrurier…
              </p>
            </div>
          ) : (
            <>
              {/* Titre de section */}
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {query.trim().length >= 2 ? "Résultats" : "Services populaires"}
                </p>
              </div>

              {/* Liste des catégories */}
              <ul>
                {filtered.map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(cat)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#E6F2F2] transition-colors text-left border-b border-[#F4F7F7] last:border-0 group"
                    >
                      {/* Icône */}
                      <span className="text-2xl w-9 h-9 flex items-center justify-center bg-[#F4F7F7] rounded-[8px] group-hover:bg-white shrink-0 transition-colors">
                        {cat.icon ?? "🔧"}
                      </span>

                      {/* Texte */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1F2937] group-hover:text-[#1CA7A6] transition-colors">
                          {cat.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {isLoggedIn === false
                            ? "Connexion requise pour contacter un artisan"
                            : cat.description ?? "Trouver un artisan disponible"}
                        </p>
                      </div>

                      {/* CTA ou icône de lock */}
                      {isLoggedIn === false ? (
                        <span
                          className="text-xs font-semibold shrink-0 px-2.5 py-1 rounded-full border"
                          style={{ color: primaryColor, borderColor: "#D1E5E5" }}
                        >
                          Se connecter
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 group-hover:text-[#1CA7A6] shrink-0 transition-colors">
                          →
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              {/* ── Pied de dropdown : bannière login si non connecté ─────── */}
              {showFooterLogin && (
                <div className="px-4 py-3 bg-[#F4F7F7] border-t border-[#D1E5E5] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔒</span>
                    <p className="text-xs text-gray-500 leading-snug">
                      Connectez-vous pour contacter un artisan directement
                    </p>
                  </div>
                  <Link
                    href="/auth/login"
                    className="text-xs font-bold shrink-0 text-white px-3 py-1.5 rounded-[8px] hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Se connecter
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
