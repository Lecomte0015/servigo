"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

const CITIES = [
  "Genève", "Lausanne", "Fribourg", "Neuchâtel", "Sion",
  "Nyon", "Montreux", "Yverdon", "Morges", "Bienne", "Martigny", "La Chaux-de-Fonds",
];

interface Category {
  id: string;
  name: string;
}

export default function CampaignsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cityFilter, setCityFilter] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((j) => setCategories(j.data?.categories ?? []));
  }, []);

  const fetchCount = useCallback(() => {
    const params = new URLSearchParams();
    if (cityFilter) params.set("city", cityFilter);
    if (categoryId) params.set("categoryId", categoryId);
    fetch(`/api/admin/campaigns?${params}`)
      .then((r) => r.json())
      .then((j) => setCount(j.count ?? 0));
  }, [cityFilter, categoryId]);

  useEffect(() => { fetchCount(); }, [fetchCount]);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      setError("Veuillez renseigner le sujet et le message.");
      return;
    }
    if (!window.confirm(`Envoyer cet email à ${count ?? "?"} artisan(s) ? Cette action est irréversible.`)) return;
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, cityFilter: cityFilter || undefined, categoryId: categoryId || undefined }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erreur"); return; }
      setResult(json);
      setSubject("");
      setMessage("");
    } catch {
      setError("Erreur réseau");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-[#1F2937]">Campagnes email artisans</h1>
        <p className="text-sm text-gray-500 mt-0.5">Envoyez un email ciblé aux artisans approuvés selon leur ville et métier.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filtres de ciblage</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Ville</label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full border border-[#D1E5E5] rounded-[8px] px-3 py-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#1CA7A6]"
              >
                <option value="">Toutes les villes</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Métier</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-[#D1E5E5] rounded-[8px] px-3 py-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#1CA7A6]"
              >
                <option value="">Tous les métiers</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {count !== null && (
            <div className="flex items-center gap-2 bg-[#E6F2F2] rounded-[8px] px-4 py-2.5">
              <span className="text-2xl font-bold text-[#1CA7A6]">{count}</span>
              <span className="text-sm text-gray-600">artisan{count > 1 ? "s" : ""} correspondant{count > 1 ? "s" : ""} au ciblage</span>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Contenu de l&apos;email</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Sujet de l&apos;email</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Nouvelles missions disponibles à Genève"
              className="w-full border border-[#D1E5E5] rounded-[8px] px-3 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:border-[#1CA7A6] placeholder:text-gray-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder={"Bonjour,\n\nDe nouvelles missions sont disponibles dans votre secteur. Connectez-vous pour les consulter et les accepter.\n\nL'équipe GoServi"}
              className="w-full border border-[#D1E5E5] rounded-[8px] px-3 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:border-[#1CA7A6] placeholder:text-gray-300 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">Le prénom de l&apos;artisan est ajouté automatiquement en en-tête.</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-[8px] px-4 py-3">
              <p className="text-sm text-green-700 font-medium">
                ✅ Campagne envoyée — {result.sent} email{result.sent > 1 ? "s" : ""} sur {result.total} artisan{result.total > 1 ? "s" : ""}
              </p>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim() || count === 0}
            className="w-full py-3 px-4 rounded-[8px] text-sm font-semibold bg-[#1CA7A6] text-white hover:bg-[#178F8E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Envoi en cours…" : `Envoyer à ${count ?? "…"} artisan${(count ?? 0) > 1 ? "s" : ""}`}
          </button>
        </div>
      </Card>
    </div>
  );
}
