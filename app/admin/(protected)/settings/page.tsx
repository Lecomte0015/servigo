"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { SiteSettingsData } from "@/lib/site-settings";
import { DEFAULT_SETTINGS } from "@/lib/site-settings";

type Tab = "apparence" | "hero" | "stats" | "steps" | "garanties" | "pro" | "footer" | "legal";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "apparence", label: "Apparence", icon: "🎨" },
  { id: "hero", label: "Hero", icon: "🏠" },
  { id: "stats", label: "Statistiques", icon: "📊" },
  { id: "steps", label: "Étapes", icon: "📝" },
  { id: "garanties", label: "Garanties", icon: "🛡️" },
  { id: "pro", label: "CTA Pro", icon: "👷" },
  { id: "footer", label: "Footer", icon: "📄" },
  { id: "legal", label: "Pages légales", icon: "⚖️" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("apparence");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((j) => setSettings({ ...DEFAULT_SETTINGS, ...(j.data ?? {}) }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const save = async (partial: Partial<SiteSettingsData>) => {
    setSaving(true);
    setSaved(false);
    try {
      // Read current saved settings and merge
      const res = await fetch("/api/admin/settings");
      const current = await res.json();
      const merged = { ...(current.data ?? DEFAULT_SETTINGS), ...partial };

      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });
      setSettings((prev) => ({ ...prev, ...partial }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof SiteSettingsData>(key: K, value: SiteSettingsData[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin w-6 h-6 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1F2937]">Paramètres du site</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Personnalisez la page d'accueil et l'apparence générale
          </p>
        </div>
        {saved && (
          <span className="text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-[8px] font-medium">
            ✓ Sauvegardé
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeTab === t.id
                ? "bg-[#1CA7A6] text-white border-[#1CA7A6]"
                : "bg-white text-gray-600 border-[#D1E5E5] hover:border-[#1CA7A6] hover:text-[#1CA7A6]"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Apparence ─────────────────────────────────────── */}
      {activeTab === "apparence" && (
        <Card>
          <CardHeader><CardTitle>Couleurs & Typographie</CardTitle></CardHeader>
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  Couleur principale
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => update("primaryColor", e.target.value)}
                    className="w-10 h-10 rounded-[6px] border border-[#D1E5E5] cursor-pointer p-0.5"
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) => update("primaryColor", e.target.value)}
                    placeholder="#1CA7A6"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  Couleur sombre (hover)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.darkColor}
                    onChange={(e) => update("darkColor", e.target.value)}
                    className="w-10 h-10 rounded-[6px] border border-[#D1E5E5] cursor-pointer p-0.5"
                  />
                  <Input
                    value={settings.darkColor}
                    onChange={(e) => update("darkColor", e.target.value)}
                    placeholder="#178F8E"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-[10px] border border-[#D1E5E5] bg-[#F4F7F7]">
              <span className="text-sm font-medium text-gray-500">Aperçu :</span>
              <button
                style={{ backgroundColor: settings.primaryColor }}
                className="text-white text-xs font-semibold px-4 py-1.5 rounded-[8px]"
              >
                Bouton primaire
              </button>
              <span
                className="text-sm font-semibold"
                style={{ color: settings.primaryColor }}
              >
                Lien coloré
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Police d'écriture
              </label>
              <select
                value={settings.fontFamily}
                onChange={(e) => update("fontFamily", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D1E5E5] rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1CA7A6]"
              >
                <option value="Inter">Inter (défaut)</option>
                <option value="Poppins">Poppins</option>
                <option value="DM Sans">DM Sans</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Nunito">Nunito</option>
              </select>
            </div>

            <Button
              size="sm"
              loading={saving}
              onClick={() => save({ primaryColor: settings.primaryColor, darkColor: settings.darkColor, fontFamily: settings.fontFamily })}
            >
              Sauvegarder l'apparence
            </Button>
          </div>
        </Card>
      )}

      {/* ── Tab: Hero ──────────────────────────────────────────── */}
      {activeTab === "hero" && (
        <Card>
          <CardHeader><CardTitle>Section Hero</CardTitle></CardHeader>
          <div className="flex flex-col gap-4">
            <Input
              label="Badge (pastille en haut)"
              value={settings.hero.badge}
              onChange={(e) => update("hero", { ...settings.hero, badge: e.target.value })}
              placeholder="Artisans disponibles maintenant à Genève"
            />
            <Input
              label="Titre (1ère ligne)"
              value={settings.hero.title}
              onChange={(e) => update("hero", { ...settings.hero, title: e.target.value })}
              placeholder="Tous les artisans de Genève,"
            />
            <Input
              label="Titre (2ème ligne — en couleur)"
              value={settings.hero.titleHighlight}
              onChange={(e) => update("hero", { ...settings.hero, titleHighlight: e.target.value })}
              placeholder="en moins de 30 min"
            />
            <div>
              <label className="text-sm font-medium text-[#1F2937] block mb-1">Sous-titre</label>
              <textarea
                value={settings.hero.subtitle}
                onChange={(e) => update("hero", { ...settings.hero, subtitle: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-[#D1E5E5] rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1CA7A6] resize-none"
              />
            </div>
            <Input
              label="Placeholder barre de recherche"
              value={settings.hero.searchPlaceholder}
              onChange={(e) => update("hero", { ...settings.hero, searchPlaceholder: e.target.value })}
            />
            <Input
              label="Texte bouton recherche"
              value={settings.hero.searchCta}
              onChange={(e) => update("hero", { ...settings.hero, searchCta: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  Couleur fond (début gradient)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.hero.bgFrom.startsWith("#") ? settings.hero.bgFrom : "#E6F2F2"}
                    onChange={(e) => update("hero", { ...settings.hero, bgFrom: e.target.value })}
                    className="w-9 h-9 rounded-[6px] border border-[#D1E5E5] cursor-pointer p-0.5"
                  />
                  <Input
                    value={settings.hero.bgFrom}
                    onChange={(e) => update("hero", { ...settings.hero, bgFrom: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  Couleur fond (fin gradient)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.hero.bgTo.startsWith("#") ? settings.hero.bgTo : "#ffffff"}
                    onChange={(e) => update("hero", { ...settings.hero, bgTo: e.target.value })}
                    className="w-9 h-9 rounded-[6px] border border-[#D1E5E5] cursor-pointer p-0.5"
                  />
                  <Input
                    value={settings.hero.bgTo}
                    onChange={(e) => update("hero", { ...settings.hero, bgTo: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <Button size="sm" loading={saving} onClick={() => save({ hero: settings.hero })}>
              Sauvegarder le Hero
            </Button>
          </div>
        </Card>
      )}

      {/* ── Tab: Stats ─────────────────────────────────────────── */}
      {activeTab === "stats" && (
        <Card>
          <CardHeader><CardTitle>Bannière de statistiques</CardTitle></CardHeader>
          <div className="flex flex-col gap-4">
            {settings.stats.map((stat, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 p-3 bg-[#F4F7F7] rounded-[10px] border border-[#E6F2F2]">
                <Input
                  label={`Valeur ${i + 1}`}
                  value={stat.value}
                  onChange={(e) => {
                    const next = [...settings.stats];
                    next[i] = { ...next[i], value: e.target.value };
                    update("stats", next);
                  }}
                />
                <Input
                  label="Label"
                  value={stat.label}
                  onChange={(e) => {
                    const next = [...settings.stats];
                    next[i] = { ...next[i], label: e.target.value };
                    update("stats", next);
                  }}
                />
              </div>
            ))}
            <Button size="sm" loading={saving} onClick={() => save({ stats: settings.stats })}>
              Sauvegarder les stats
            </Button>
          </div>
        </Card>
      )}

      {/* ── Tab: Steps ─────────────────────────────────────────── */}
      {activeTab === "steps" && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Section "Comment ça marche ?"</CardTitle></CardHeader>
            <div className="flex flex-col gap-3">
              <Input
                label="Titre de la section"
                value={settings.howItWorks.title}
                onChange={(e) => update("howItWorks", { ...settings.howItWorks, title: e.target.value })}
              />
              <Input
                label="Sous-titre"
                value={settings.howItWorks.subtitle}
                onChange={(e) => update("howItWorks", { ...settings.howItWorks, subtitle: e.target.value })}
              />
              <Input
                label="Texte du bouton CTA"
                value={settings.howItWorks.ctaText}
                onChange={(e) => update("howItWorks", { ...settings.howItWorks, ctaText: e.target.value })}
              />
            </div>
          </Card>

          {settings.howItWorks.steps.map((step, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-sm">Étape {i + 1}</CardTitle>
              </CardHeader>
              <div className="flex flex-col gap-3">
                <Input
                  label="Icône (emoji)"
                  value={step.icon}
                  onChange={(e) => {
                    const next = [...settings.howItWorks.steps];
                    next[i] = { ...next[i], icon: e.target.value };
                    update("howItWorks", { ...settings.howItWorks, steps: next });
                  }}
                />
                <Input
                  label="Titre"
                  value={step.title}
                  onChange={(e) => {
                    const next = [...settings.howItWorks.steps];
                    next[i] = { ...next[i], title: e.target.value };
                    update("howItWorks", { ...settings.howItWorks, steps: next });
                  }}
                />
                <div>
                  <label className="text-sm font-medium text-[#1F2937] block mb-1">Description</label>
                  <textarea
                    value={step.desc}
                    onChange={(e) => {
                      const next = [...settings.howItWorks.steps];
                      next[i] = { ...next[i], desc: e.target.value };
                      update("howItWorks", { ...settings.howItWorks, steps: next });
                    }}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-[#D1E5E5] rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1CA7A6] resize-none"
                  />
                </div>
              </div>
            </Card>
          ))}

          <Button size="sm" loading={saving} onClick={() => save({ howItWorks: settings.howItWorks })}>
            Sauvegarder les étapes
          </Button>
        </div>
      )}

      {/* ── Tab: Garanties ─────────────────────────────────────── */}
      {activeTab === "garanties" && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>Section Garanties</CardTitle></CardHeader>
            <div className="flex flex-col gap-3">
              <Input
                label="Titre (partie 1)"
                value={settings.guarantees.title}
                onChange={(e) => update("guarantees", { ...settings.guarantees, title: e.target.value })}
              />
              <Input
                label="Titre (partie colorée)"
                value={settings.guarantees.titleHighlight}
                onChange={(e) => update("guarantees", { ...settings.guarantees, titleHighlight: e.target.value })}
              />
              <Input
                label="Sous-titre"
                value={settings.guarantees.subtitle}
                onChange={(e) => update("guarantees", { ...settings.guarantees, subtitle: e.target.value })}
              />
            </div>
          </Card>

          {settings.guarantees.items.map((g, i) => (
            <Card key={i}>
              <CardHeader><CardTitle className="text-sm">Garantie {i + 1}</CardTitle></CardHeader>
              <div className="flex flex-col gap-3">
                <Input
                  label="Icône (emoji)"
                  value={g.icon}
                  onChange={(e) => {
                    const next = [...settings.guarantees.items];
                    next[i] = { ...next[i], icon: e.target.value };
                    update("guarantees", { ...settings.guarantees, items: next });
                  }}
                />
                <Input
                  label="Titre"
                  value={g.title}
                  onChange={(e) => {
                    const next = [...settings.guarantees.items];
                    next[i] = { ...next[i], title: e.target.value };
                    update("guarantees", { ...settings.guarantees, items: next });
                  }}
                />
                <div>
                  <label className="text-sm font-medium text-[#1F2937] block mb-1">Description</label>
                  <textarea
                    value={g.desc}
                    onChange={(e) => {
                      const next = [...settings.guarantees.items];
                      next[i] = { ...next[i], desc: e.target.value };
                      update("guarantees", { ...settings.guarantees, items: next });
                    }}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-[#D1E5E5] rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1CA7A6] resize-none"
                  />
                </div>
              </div>
            </Card>
          ))}

          <Button size="sm" loading={saving} onClick={() => save({ guarantees: settings.guarantees })}>
            Sauvegarder les garanties
          </Button>
        </div>
      )}

      {/* ── Tab: CTA Pro ───────────────────────────────────────── */}
      {activeTab === "pro" && (
        <Card>
          <CardHeader><CardTitle>Section CTA Professionnels</CardTitle></CardHeader>
          <div className="flex flex-col gap-4">
            <Input label="Badge (étiquette)" value={settings.proCta.badge}
              onChange={(e) => update("proCta", { ...settings.proCta, badge: e.target.value })} />
            <Input label="Titre principal" value={settings.proCta.title}
              onChange={(e) => update("proCta", { ...settings.proCta, title: e.target.value })} />
            <div>
              <label className="text-sm font-medium text-[#1F2937] block mb-1">Sous-titre</label>
              <textarea value={settings.proCta.subtitle} rows={3}
                onChange={(e) => update("proCta", { ...settings.proCta, subtitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-[#D1E5E5] rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1CA7A6] resize-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#1F2937]">Avantages (liste)</label>
              {settings.proCta.benefits.map((b, i) => (
                <Input key={i} value={b}
                  onChange={(e) => {
                    const next = [...settings.proCta.benefits];
                    next[i] = e.target.value;
                    update("proCta", { ...settings.proCta, benefits: next });
                  }} />
              ))}
            </div>
            <Input label="Texte bouton CTA" value={settings.proCta.ctaText}
              onChange={(e) => update("proCta", { ...settings.proCta, ctaText: e.target.value })} />
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#F4F7F7] rounded-[10px] border border-[#E6F2F2]">
              <Input label="Valeur stat (ex: 500+)" value={settings.proCta.statValue}
                onChange={(e) => update("proCta", { ...settings.proCta, statValue: e.target.value })} />
              <Input label="Label stat" value={settings.proCta.statLabel}
                onChange={(e) => update("proCta", { ...settings.proCta, statLabel: e.target.value })} />
              <Input label="Revenu moyen (ex: +2 000 CHF)" value={settings.proCta.revenueValue}
                onChange={(e) => update("proCta", { ...settings.proCta, revenueValue: e.target.value })} />
              <Input label="Label revenu" value={settings.proCta.revenueLabel}
                onChange={(e) => update("proCta", { ...settings.proCta, revenueLabel: e.target.value })} />
            </div>
            <Button size="sm" loading={saving} onClick={() => save({ proCta: settings.proCta })}>
              Sauvegarder le CTA Pro
            </Button>
          </div>
        </Card>
      )}

      {/* ── Tab: Footer ────────────────────────────────────────── */}
      {activeTab === "footer" && (
        <Card>
          <CardHeader><CardTitle>Footer</CardTitle></CardHeader>
          <div className="flex flex-col gap-4">
            <Input label="Slogan" value={settings.footer.tagline}
              onChange={(e) => update("footer", { ...settings.footer, tagline: e.target.value })} />
            <Input label="Localisation" value={settings.footer.location}
              onChange={(e) => update("footer", { ...settings.footer, location: e.target.value })} />
            <Input label="Texte copyright (sans l'année)" value={settings.footer.copyright}
              onChange={(e) => update("footer", { ...settings.footer, copyright: e.target.value })} />
            <Button size="sm" loading={saving} onClick={() => save({ footer: settings.footer })}>
              Sauvegarder le footer
            </Button>
          </div>
        </Card>
      )}

      {/* ── Tab: Pages légales ─────────────────────────────────── */}
      {activeTab === "legal" && (
        <div className="flex flex-col gap-5">
          <div className="bg-[#F4F7F7] border border-[#D1E5E5] rounded-[12px] px-4 py-3 text-sm text-gray-600 flex gap-2 items-start">
            <span className="text-lg shrink-0">💡</span>
            <div>
              <p className="font-semibold text-[#1F2937] mb-0.5">Syntaxe Markdown supportée</p>
              <p className="text-xs text-gray-500">
                <code className="bg-white px-1 rounded"># Titre</code> &nbsp;
                <code className="bg-white px-1 rounded">## Sous-titre</code> &nbsp;
                <code className="bg-white px-1 rounded">**gras**</code> &nbsp;
                <code className="bg-white px-1 rounded">- liste</code> &nbsp;
                <code className="bg-white px-1 rounded">[lien](url)</code>
                <br />
                Si le champ est vide, la version statique par défaut s&apos;affiche.
              </p>
            </div>
          </div>

          {/* Mentions légales */}
          <Card>
            <CardHeader>
              <CardTitle>Mentions légales</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-500">
                Contenu affiché sur{" "}
                <a href="/mentions-legales" target="_blank" className="text-[#1CA7A6] hover:underline">
                  /mentions-legales ↗
                </a>
              </p>
              <textarea
                value={settings.legalPages?.mentionsLegales ?? ""}
                onChange={(e) =>
                  update("legalPages", {
                    ...settings.legalPages,
                    mentionsLegales: e.target.value,
                  })
                }
                rows={22}
                placeholder={"# Mentions légales\n\nDernière mise à jour : ...\n\n## 1. Éditeur du site\n\nLe site goservi.ch est édité par..."}
                className="w-full px-3 py-2.5 text-sm font-mono border border-[#D1E5E5] rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1CA7A6] resize-y"
              />
              <Button
                size="sm"
                loading={saving}
                onClick={() => save({ legalPages: settings.legalPages })}
              >
                Sauvegarder les mentions légales
              </Button>
            </div>
          </Card>

          {/* Politique de confidentialité */}
          <Card>
            <CardHeader>
              <CardTitle>Politique de confidentialité</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-500">
                Contenu affiché sur{" "}
                <a href="/confidentialite" target="_blank" className="text-[#1CA7A6] hover:underline">
                  /confidentialite ↗
                </a>
              </p>
              <textarea
                value={settings.legalPages?.confidentialite ?? ""}
                onChange={(e) =>
                  update("legalPages", {
                    ...settings.legalPages,
                    confidentialite: e.target.value,
                  })
                }
                rows={22}
                placeholder={"# Politique de confidentialité\n\nDernière mise à jour : ...\n\n## 1. Responsable du traitement\n\nGoServi SA..."}
                className="w-full px-3 py-2.5 text-sm font-mono border border-[#D1E5E5] rounded-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1CA7A6] resize-y"
              />
              <Button
                size="sm"
                loading={saving}
                onClick={() => save({ legalPages: settings.legalPages })}
              >
                Sauvegarder la politique de confidentialité
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
