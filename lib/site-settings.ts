import { prisma } from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeroSettings {
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  searchPlaceholder: string;
  searchCta: string;
  bgFrom: string;
  bgTo: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface StepItem {
  icon: string;
  title: string;
  desc: string;
}

export interface GuaranteeItem {
  icon: string;
  title: string;
  desc: string;
}

export interface SiteSettingsData {
  primaryColor: string;
  darkColor: string;
  fontFamily: string;
  hero: HeroSettings;
  stats: StatItem[];
  popularServices: { title: string; subtitle: string };
  howItWorks: {
    title: string;
    subtitle: string;
    ctaText: string;
    steps: StepItem[];
  };
  guarantees: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    items: GuaranteeItem[];
  };
  proCta: {
    badge: string;
    title: string;
    subtitle: string;
    benefits: string[];
    ctaText: string;
    statValue: string;
    statLabel: string;
    revenueValue: string;
    revenueLabel: string;
  };
  footer: {
    tagline: string;
    location: string;
    copyright: string;
  };
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: SiteSettingsData = {
  primaryColor: "#1CA7A6",
  darkColor: "#178F8E",
  fontFamily: "Inter",
  hero: {
    badge: "Artisans disponibles maintenant à Genève",
    title: "Tous les artisans de Genève,",
    titleHighlight: "en moins de 30 min",
    subtitle:
      "GoServi met en relation les particuliers avec des artisans locaux vérifiés pour toutes vos interventions urgentes — 24h/24, 7j/7.",
    searchPlaceholder: "Quel service cherchez-vous ? (ex : plomberie, électricité…)",
    searchCta: "Rechercher",
    bgFrom: "#E6F2F2",
    bgTo: "white",
  },
  stats: [
    { value: "500+", label: "Artisans actifs" },
    { value: "4.9/5", label: "Note moyenne" },
    { value: "< 30 min", label: "Délai d'intervention" },
    { value: "98%", label: "Clients satisfaits" },
  ],
  popularServices: {
    title: "Services populaires à Genève",
    subtitle: "Des artisans qualifiés disponibles pour toutes vos urgences",
  },
  howItWorks: {
    title: "Comment ça marche ?",
    subtitle: "Trouvez un artisan en moins de 2 minutes",
    ctaText: "Créer une demande maintenant →",
    steps: [
      {
        icon: "📝",
        title: "Décrivez votre besoin",
        desc: "Choisissez le type d'intervention et décrivez votre problème en 30 secondes.",
      },
      {
        icon: "🔔",
        title: "Un artisan vous répond",
        desc: "Notre algorithme contacte les meilleurs artisans disponibles près de chez vous.",
      },
      {
        icon: "✅",
        title: "Intervention & paiement",
        desc: "L'artisan intervient, vous confirmez la fin et le paiement est capturé via Stripe.",
      },
    ],
  },
  guarantees: {
    title: "Votre satisfaction,",
    titleHighlight: "garantie",
    subtitle: "GoServi s'engage pour une expérience irréprochable",
    items: [
      {
        icon: "🛡️",
        title: "Artisans vérifiés",
        desc: "Chaque artisan est contrôlé par notre équipe : assurance RC, qualifications, antécédents.",
      },
      {
        icon: "💳",
        title: "Paiement sécurisé",
        desc: "Pré-autorisation Stripe. Vous ne payez qu'après validation de l'intervention terminée.",
      },
      {
        icon: "⭐",
        title: "Satisfaction garantie",
        desc: "Un problème ? Notre équipe est disponible 7j/7 pour vous accompagner et résoudre tout litige.",
      },
    ],
  },
  proCta: {
    badge: "Vous êtes professionnel ?",
    title: "Développez votre activité avec GoServi",
    subtitle:
      "Rejoignez notre réseau d'artisans vérifiés à Genève. Recevez des missions qualifiées, gérez votre agenda et soyez payé rapidement.",
    benefits: [
      "Inscription gratuite",
      "Missions urgentes et standard",
      "Paiement sécurisé et rapide",
    ],
    ctaText: "Devenir artisan GoServi →",
    statValue: "500+",
    statLabel: "artisans nous font confiance",
    revenueValue: "+2 000 CHF",
    revenueLabel: "de revenus/mois en moyenne",
  },
  footer: {
    tagline: "La marketplace des artisans de confiance à Genève.",
    location: "Genève, Suisse",
    copyright: "GoServi Sàrl — Genève, Suisse",
  },
};

// ─── Fetch helper (Server Component safe) ────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    if (!row) return DEFAULT_SETTINGS;
    // Deep merge: DB overrides defaults
    return deepMerge(DEFAULT_SETTINGS, row.data as Partial<SiteSettingsData>);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Simple deep merge (DB values override defaults)
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key in source) {
    const val = source[key];
    if (val !== null && val !== undefined) {
      if (typeof val === "object" && !Array.isArray(val) && typeof target[key] === "object") {
        (result as Record<string, unknown>)[key] = deepMerge(
          target[key] as object,
          val as object
        );
      } else {
        (result as Record<string, unknown>)[key] = val;
      }
    }
  }
  return result;
}
