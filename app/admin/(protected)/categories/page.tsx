"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  imageUrl: string | null;
  description: string | null;
  startPrice: number | null;
  bgColor: string | null;
  accentColor: string | null;
  displayOrder: number;
  isVisible: boolean;
  _count: { artisanServices: number; jobRequests: number };
}

const EMPTY_FORM = {
  name: "",
  icon: "",
  description: "",
  startPrice: "",
  bgColor: "",
  accentColor: "",
  displayOrder: "0",
  isVisible: true,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUploadId, setPendingUploadId] = useState<string | null>(null);

  const fetchCategories = () => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((j) => setCategories(j.data?.categories ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startPrice: form.startPrice ? parseFloat(form.startPrice) : null,
          displayOrder: parseInt(form.displayOrder) || 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Erreur"); return; }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      fetchCategories();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      icon: cat.icon ?? "",
      description: cat.description ?? "",
      startPrice: cat.startPrice ? String(cat.startPrice) : "",
      bgColor: cat.bgColor ?? "",
      accentColor: cat.accentColor ?? "",
      displayOrder: String(cat.displayOrder),
      isVisible: cat.isVisible,
    });
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) { alert(json.error ?? "Erreur"); return; }
      fetchCategories();
    } finally {
      setDeletingId(null);
    }
  };

  const handleImageUpload = async (catId: string, file: File) => {
    setUploadingId(catId);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`/api/admin/categories/${catId}/image`, { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) { alert(json.error ?? "Erreur upload"); return; }
      fetchCategories();
    } finally {
      setUploadingId(null);
      setPendingUploadId(null);
    }
  };

  const handleRemoveImage = async (catId: string) => {
    if (!confirm("Supprimer l'image de cette catégorie ?")) return;
    setUploadingId(catId);
    try {
      await fetch(`/api/admin/categories/${catId}/image`, { method: "DELETE" });
      fetchCategories();
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1F2937]">Catégories de services</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} catégorie{categories.length > 1 ? "s" : ""}</p>
        </div>
        <Button
          size="sm"
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(EMPTY_FORM); setError(null); }}
        >
          {showForm && !editingId ? "Annuler" : "+ Ajouter"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Nom *" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Plomberie" required />
              <Input label="Icône (emoji)" value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="🔧" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1F2937] block mb-1">Description courte</label>
              <textarea value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Ex: Fuites, débouchage, installation"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-[#D1E5E5] rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1CA7A6] resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="Prix de départ (CHF/h)" type="number" min="0" step="5"
                value={form.startPrice}
                onChange={(e) => setForm((f) => ({ ...f, startPrice: e.target.value }))}
                placeholder="80" />
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Couleur de fond</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.bgColor || "#F4F7F7"}
                    onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))}
                    className="w-9 h-9 rounded-[6px] border border-[#D1E5E5] cursor-pointer p-0.5" />
                  <Input value={form.bgColor} onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))} placeholder="#EFF6FF" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Couleur accent</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.accentColor || "#1CA7A6"}
                    onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))}
                    className="w-9 h-9 rounded-[6px] border border-[#D1E5E5] cursor-pointer p-0.5" />
                  <Input value={form.accentColor} onChange={(e) => setForm((f) => ({ ...f, accentColor: e.target.value }))} placeholder="#3B82F6" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Ordre d'affichage" type="number" min="0"
                value={form.displayOrder}
                onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))} />
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isVisible}
                    onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))}
                    className="w-4 h-4 rounded accent-[#1CA7A6]" />
                  <span className="text-sm font-medium text-[#1F2937]">Visible sur l'accueil</span>
                </label>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">{error}</p>
            )}
            <div className="flex gap-2">
              <Button type="submit" loading={saving} size="sm">
                {editingId ? "Enregistrer" : "Créer"}
              </Button>
              <Button type="button" variant="ghost" size="sm"
                onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && pendingUploadId) handleImageUpload(pendingUploadId, file);
          e.target.value = "";
        }} />

      <Card padding="none">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="divide-y divide-[#E6F2F2]">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-14 h-14 rounded-[10px] flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#E6F2F2] relative"
                    style={{ backgroundColor: cat.bgColor ?? "#F4F7F7" }}
                  >
                    {cat.imageUrl ? (
                      <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" sizes="56px" />
                    ) : cat.icon ? (
                      <span className="text-2xl">{cat.icon}</span>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[#1F2937]">{cat.name}</p>
                      {!cat.isVisible && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">caché</span>
                      )}
                      {cat.startPrice != null && (
                        <span className="text-xs text-[#1CA7A6] bg-[#E6F2F2] px-1.5 py-0.5 rounded font-medium">
                          Dès {cat.startPrice} CHF/h
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{cat.slug} · ordre {cat.displayOrder}</p>
                    {cat.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cat.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">
                        {cat._count.artisanServices} artisan{cat._count.artisanServices !== 1 ? "s" : ""} · {cat._count.jobRequests} mission{cat._count.jobRequests !== 1 ? "s" : ""}
                      </span>
                      {(cat.bgColor || cat.accentColor) && (
                        <span className="flex items-center gap-1">
                          {cat.bgColor && <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: cat.bgColor }} title="fond" />}
                          {cat.accentColor && <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: cat.accentColor }} title="accent" />}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 shrink-0">
                    <button onClick={() => handleEdit(cat)}
                      className="text-xs px-2 py-1 rounded-[6px] border border-[#D1E5E5] text-gray-500 hover:border-[#1CA7A6] hover:text-[#1CA7A6] transition-colors">
                      Modifier
                    </button>
                    <button
                      onClick={() => { setPendingUploadId(cat.id); fileInputRef.current?.click(); }}
                      disabled={uploadingId === cat.id}
                      title="Uploader une image"
                      className="text-xs px-2 py-1 rounded-[6px] border border-[#D1E5E5] text-gray-500 hover:border-[#1CA7A6] hover:text-[#1CA7A6] transition-colors disabled:opacity-40">
                      {uploadingId === cat.id ? "…" : "Image"}
                    </button>
                    {cat.imageUrl && (
                      <button onClick={() => handleRemoveImage(cat.id)}
                        className="text-xs px-2 py-1 rounded-[6px] border border-[#D1E5E5] text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors">
                        Retirer img
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={deletingId === cat.id || cat._count.jobRequests > 0}
                      title={cat._count.jobRequests > 0 ? "Des missions utilisent cette catégorie" : "Supprimer"}
                      className="text-xs px-2 py-1 rounded-[6px] border border-[#D1E5E5] text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
