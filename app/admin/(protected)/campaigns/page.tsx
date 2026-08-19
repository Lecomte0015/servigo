"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

const CITIES = [
  "Genève", "Lausanne", "Fribourg", "Neuchâtel", "Sion",
  "Nyon", "Montreux", "Yverdon", "Morges", "Bienne", "Martigny", "La Chaux-de-Fonds",
];

interface Category { id: string; name: string; }
interface Artisan { id: string; companyName: string; city: string; }
interface Draft {
  id: string;
  subject: string;
  message: string;
  cityFilter: string | null;
  categoryId: string | null;
  artisanId: string | null;
  status: "DRAFT" | "SCHEDULED" | "SENT";
  scheduledAt: string | null;
  sentCount: number | null;
  totalCount: number | null;
  createdAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-CH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function localDatetimeToISO(local: string) {
  if (!local) return "";
  return new Date(local).toISOString();
}

export default function CampaignsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cityFilter, setCityFilter] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [artisanId, setArtisanId] = useState("");
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ sent: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((j) => setCategories(j.data?.categories ?? []));
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    fetch("/api/admin/campaigns/drafts")
      .then((r) => r.json())
      .then((j) => setDrafts(j.drafts ?? []));
  };

  const fetchArtisans = useCallback(() => {
    const params = new URLSearchParams();
    if (cityFilter) params.set("city", cityFilter);
    if (categoryId) params.set("categoryId", categoryId);
    fetch(`/api/admin/campaigns?${params}`)
      .then((r) => r.json())
      .then((j) => {
        setArtisans(j.artisans ?? []);
        setCount(j.count ?? 0);
      });
  }, [cityFilter, categoryId]);

  useEffect(() => { fetchArtisans(); }, [fetchArtisans]);

  const effectiveCount = artisanId ? 1 : (count ?? 0);

  const resetForm = () => {
    setSubject(""); setMessage(""); setCityFilter(""); setCategoryId("");
    setArtisanId(""); setScheduledAt(""); setResult(null); setError(null); setEditingId(null);
  };

  const loadDraft = (d: Draft) => {
    setSubject(d.subject);
    setMessage(d.message);
    setCityFilter(d.cityFilter ?? "");
    setCategoryId(d.categoryId ?? "");
    setArtisanId(d.artisanId ?? "");
    setScheduledAt(d.scheduledAt ? new Date(d.scheduledAt).toISOString().slice(0, 16) : "");
    setEditingId(d.id);
    setResult(null);
    setError(null);
  };

  const handleSaveDraft = async () => {
    if (!subject.trim() || !message.trim()) { setError("Sujet et message requis."); return; }
    setSaving(true); setError(null);
    try {
      const body = {
        subject, message,
        cityFilter: artisanId ? undefined : (cityFilter || undefined),
        categoryId: artisanId ? undefined : (categoryId || undefined),
        artisanId: artisanId || undefined,
        scheduledAt: scheduledAt ? localDatetimeToISO(scheduledAt) : undefined,
      };

      if (editingId) {
        await fetch(`/api/admin/campaigns/drafts/${editingId}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
      } else {
        await fetch("/api/admin/campaigns/drafts", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
      }
      loadDrafts();
      resetForm();
    } catch { setError("Erreur réseau"); }
    finally { setSaving(false); }
  };

  const handleSendNow = async () => {
    if (!subject.trim() || !message.trim()) { setError("Sujet et message requis."); return; }
    if (!window.confirm(`Envoyer maintenant à ${effectiveCount} artisan(s) ?`)) return;
    setSending(true); setError(null); setResult(null);

    // Si on édite un brouillon existant, on l'envoie directement
    if (editingId) {
      // Sauvegarde d'abord les modifications puis envoie
      await fetch(`/api/admin/campaigns/drafts/${editingId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const res = await fetch(`/api/admin/campaigns/drafts/${editingId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send" }),
      });
      const json = await res.json();
      if (res.ok) { setResult(json); loadDrafts(); resetForm(); }
      else setError(json.error ?? "Erreur");
      setSending(false);
      return;
    }

    // Sinon envoi direct sans sauvegarde
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject, message,
          artisanId: artisanId || undefined,
          cityFilter: artisanId ? undefined : (cityFilter || undefined),
          categoryId: artisanId ? undefined : (categoryId || undefined),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erreur"); return; }
      setResult(json);
      setSubject(""); setMessage("");
    } catch { setError("Erreur réseau"); }
    finally { setSending(false); }
  };

  const handleDeleteDraft = async (id: string) => {
    if (!window.confirm("Supprimer ce brouillon ?")) return;
    await fetch(`/api/admin/campaigns/drafts/${id}`, { method: "DELETE" });
    loadDrafts();
    if (editingId === id) resetForm();
  };

  const handleSendDraft = async (d: Draft) => {
    if (!window.confirm(`Envoyer "${d.subject}" maintenant ?`)) return;
    const res = await fetch(`/api/admin/campaigns/drafts/${d.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send" }),
    });
    const json = await res.json();
    if (res.ok) { setResult(json); loadDrafts(); }
  };

  const minDateTime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1F2937]">Campagnes email artisans</h1>
          <p className="text-sm text-gray-500 mt-0.5">Envoyez, programmez ou sauvegardez vos emails ciblés.</p>
        </div>
        {editingId && (
          <button onClick={resetForm} className="text-xs text-gray-400 hover:text-gray-600 underline">
            + Nouvelle campagne
          </button>
        )}
      </div>

      {/* ── Formulaire ───────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{editingId ? "Modifier le brouillon" : "Nouvelle campagne"}</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-4">
          {/* Ciblage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Ville</label>
              <select value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); setArtisanId(""); }}
                className="w-full border border-[#D1E5E5] rounded-[8px] px-3 py-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#1CA7A6]">
                <option value="">Toutes les villes</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Métier</label>
              <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setArtisanId(""); }}
                className="w-full border border-[#D1E5E5] rounded-[8px] px-3 py-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#1CA7A6]">
                <option value="">Tous les métiers</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Artisan spécifique <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <select value={artisanId} onChange={(e) => setArtisanId(e.target.value)}
              className="w-full border border-[#D1E5E5] rounded-[8px] px-3 py-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#1CA7A6]">
              <option value="">— Tous les artisans filtrés —</option>
              {artisans.map((a) => <option key={a.id} value={a.id}>{a.companyName} — {a.city}</option>)}
            </select>
          </div>

          <div className={`flex items-center gap-2 rounded-[8px] px-4 py-2.5 ${artisanId ? "bg-amber-50 border border-amber-200" : "bg-[#E6F2F2]"}`}>
            <span className={`text-2xl font-bold ${artisanId ? "text-amber-600" : "text-[#1CA7A6]"}`}>{effectiveCount}</span>
            <span className="text-sm text-gray-600">
              {artisanId ? `artisan — ${artisans.find((a) => a.id === artisanId)?.companyName}` : `artisan${effectiveCount > 1 ? "s" : ""} ciblé${effectiveCount > 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Sujet</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Nouvelles missions disponibles à Genève"
              className="w-full border border-[#D1E5E5] rounded-[8px] px-3 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:border-[#1CA7A6] placeholder:text-gray-300" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6}
              placeholder={"Bonjour,\n\nDe nouvelles missions sont disponibles dans votre secteur...\n\nL'équipe GoServi"}
              className="w-full border border-[#D1E5E5] rounded-[8px] px-3 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:border-[#1CA7A6] placeholder:text-gray-300 resize-none" />
            <p className="text-xs text-gray-400 mt-1">Le prénom est ajouté automatiquement. Les réponses arrivent dans contact@goservi.ch.</p>
          </div>

          {/* Programmation */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Programmer l&apos;envoi <span className="text-gray-400 font-normal">(optionnel — laisser vide pour envoyer maintenant)</span>
            </label>
            <input type="datetime-local" value={scheduledAt} min={minDateTime}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full border border-[#D1E5E5] rounded-[8px] px-3 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:border-[#1CA7A6]" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-[8px] px-4 py-3">
              <p className="text-sm text-green-700 font-medium">
                Campagne envoyée — {result.sent} email{result.sent > 1 ? "s" : ""} sur {result.total}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleSaveDraft} disabled={saving || !subject.trim() || !message.trim()}
              className="flex-1 py-3 px-4 rounded-[8px] text-sm font-semibold border border-[#1CA7A6] text-[#1CA7A6] hover:bg-[#E6F2F2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Sauvegarde…" : scheduledAt ? "Programmer l'envoi" : (editingId ? "Mettre à jour" : "Enregistrer brouillon")}
            </button>
            {!scheduledAt && (
              <button onClick={handleSendNow} disabled={sending || !subject.trim() || !message.trim() || effectiveCount === 0}
                className="flex-1 py-3 px-4 rounded-[8px] text-sm font-semibold bg-[#1CA7A6] text-white hover:bg-[#178F8E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {sending ? "Envoi…" : `Envoyer maintenant (${effectiveCount})`}
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* ── Brouillons & Programmés ───────────────────────────────────────── */}
      {drafts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Brouillons & envois programmés</CardTitle>
          </CardHeader>
          <div className="flex flex-col divide-y divide-[#E6F2F2]">
            {drafts.map((d) => (
              <div key={d.id} className="py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${d.status === "SCHEDULED" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                      {d.status === "SCHEDULED" ? "PROGRAMMÉ" : "BROUILLON"}
                    </span>
                    <p className="text-sm font-medium text-[#1F2937] truncate">{d.subject}</p>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{d.message.slice(0, 80)}…</p>
                  {d.scheduledAt && (
                    <p className="text-xs text-amber-600 mt-0.5">Envoi prévu : {formatDate(d.scheduledAt)}</p>
                  )}
                  <p className="text-xs text-gray-300 mt-0.5">Créé le {formatDate(d.createdAt)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => loadDraft(d)}
                    className="text-xs px-2.5 py-1.5 border border-[#D1E5E5] rounded-[6px] text-[#1CA7A6] hover:border-[#1CA7A6] transition-colors">
                    Modifier
                  </button>
                  <button onClick={() => handleSendDraft(d)}
                    className="text-xs px-2.5 py-1.5 bg-[#1CA7A6] text-white rounded-[6px] hover:bg-[#178F8E] transition-colors">
                    Envoyer
                  </button>
                  <button onClick={() => handleDeleteDraft(d.id)}
                    className="text-xs px-2.5 py-1.5 border border-red-200 text-red-400 rounded-[6px] hover:border-red-400 transition-colors">
                    Sup.
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
