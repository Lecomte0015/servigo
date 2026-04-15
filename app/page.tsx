import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { HomeSearchBar } from "@/components/home/HomeSearchBar";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";

// ── Icônes SVG (remplacent les emojis pour un rendu professionnel) ────────────
const STEP_ICONS: Record<string, React.ReactNode> = {
  edit: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  bell: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  check: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

const GUARANTEE_ICONS: Record<string, React.ReactNode> = {
  shield: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  payment: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
      <line x1="5" y1="15" x2="9" y2="15" />
    </svg>
  ),
  star: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

// Revalidate every 60 seconds (ISR) so homepage reflects CMS changes quickly
export const revalidate = 60;

const APP_URL = "https://goservi.ch";

export const metadata: Metadata = {
  title: "GoServi — Artisans urgents à Genève & Lausanne",
  description:
    "Trouvez un artisan disponible en quelques minutes. Plombiers, électriciens, serruriers, menuisiers — intervention rapide en Suisse romande. Artisans vérifiés, paiement sécurisé Stripe.",
  alternates: { canonical: APP_URL },
  openGraph: {
    url: APP_URL,
    title: "GoServi — Artisans urgents à Genève & Lausanne",
    description:
      "Trouvez un artisan disponible en quelques minutes. Artisans vérifiés, intervention rapide en Suisse romande.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GoServi",
  url: APP_URL,
  logo: `${APP_URL}/og-image.png`,
  description:
    "Marketplace d'artisans vérifiés en Suisse romande. Intervention rapide à Genève, Lausanne et environs.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Genève",
    addressCountry: "CH",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@goservi.ch",
    contactType: "customer service",
    availableLanguage: "French",
  },
  sameAs: [],
};

const FOOTER_LINKS = [
  {
    title: "Clients",
    links: [
      { label: "Comment ça marche ?", href: "/comment-ca-marche" },
      { label: "Nos services", href: "/services" },
      { label: "Artisans par ville", href: "/trouver-artisan" },
      { label: "S'inscrire", href: "/auth/register" },
      { label: "Se connecter", href: "/auth/login" },
    ],
  },
  {
    title: "Villes",
    links: [
      { label: "Artisan Genève", href: "/trouver-artisan/geneve" },
      { label: "Artisan Lausanne", href: "/trouver-artisan/lausanne" },
      { label: "Artisan Fribourg", href: "/trouver-artisan/fribourg" },
      { label: "Artisan Neuchâtel", href: "/trouver-artisan/neuchatel" },
      { label: "Artisan Sion", href: "/trouver-artisan/sion" },
      { label: "Toutes les villes →", href: "/trouver-artisan" },
    ],
  },
  {
    title: "Professionnels",
    links: [
      { label: "Devenir artisan", href: "/devenir-artisan" },
      { label: "Plombier — rejoindre", href: "/devenir-artisan/plombier" },
      { label: "Électricien — rejoindre", href: "/devenir-artisan/electricien" },
      { label: "Serrurier — rejoindre", href: "/devenir-artisan/serrurier" },
      { label: "Tous les métiers →", href: "/devenir-artisan" },
    ],
  },
  {
    title: "GoServi",
    links: [
      { label: "À propos", href: "/a-propos" },
      { label: "Contact", href: "/contact" },
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Confidentialité", href: "/confidentialite" },
    ],
  },
];

export default async function HomePage() {
  // Fetch settings + categories in parallel
  const [settings, dbCategories] = await Promise.all([
    getSiteSettings(),
    prisma.serviceCategory.findMany({
      where: { isVisible: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  const { hero, stats, popularServices, howItWorks, guarantees, proCta, footer } = settings;

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD — Organisation GoServi */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Navbar />

      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="pt-14 pb-20 px-4"
        style={{
          background: `linear-gradient(to bottom, ${hero.bgFrom.startsWith("#") ? hero.bgFrom : "#E6F2F2"}, ${hero.bgTo.startsWith("#") ? hero.bgTo : "#ffffff"})`,
        }}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col items-center text-center gap-7">

          {/* Live badge */}
          <div
            className="inline-flex items-center gap-2 bg-white border text-sm font-medium px-4 py-1.5 rounded-full shadow-sm"
            style={{ borderColor: "#D1E5E5", color: settings.darkColor }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: settings.primaryColor }}
            />
            {hero.badge}
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[56px] font-extrabold text-[#1F2937] w-full max-w-4xl leading-[1.1] tracking-tight text-balance">
            {hero.title}{" "}
            <span style={{ color: settings.primaryColor }}>{hero.titleHighlight}</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-xl leading-relaxed">{hero.subtitle}</p>

          {/* Barre de recherche intelligente :
               · Dropdown avec les catégories filtrées en temps réel
               · Non connecté → item affiche "Se connecter" + bannière login
               · Connecté → redirige directement sur /dashboard/new-job?categoryId=...   */}
          <HomeSearchBar
            categories={dbCategories}
            placeholder={hero.searchPlaceholder}
            ctaText={hero.searchCta}
            primaryColor={settings.primaryColor}
          />

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {dbCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/dashboard/new-job?categoryId=${cat.id}`}
                className="flex items-center gap-1.5 bg-white border border-[#D1E5E5] text-[#1F2937] text-sm font-medium px-3.5 py-1.5 rounded-full transition-all shadow-sm"
                style={{"--hover-color": settings.primaryColor} as React.CSSProperties}
              >
                <span>{cat.icon ?? "🔧"}</span>
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="text-green-500 font-bold">✓</span> Artisans vérifiés
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1">
              <span className="text-amber-400 text-base">★★★★★</span>
              <span className="font-semibold text-[#1F2937] ml-1">4.9</span>
              <span className="ml-1">(200+ avis)</span>
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1.5">
              <span>🔒</span> Paiement sécurisé Stripe
            </span>
          </div>
        </div>
      </section>

      {/* ─── Popular services ──────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#1F2937]">{popularServices.title}</h2>
          <p className="text-gray-500 mt-2 text-base">{popularServices.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dbCategories.map((cat) => {
            const bg = cat.bgColor ?? "#F4F7F7";
            const accent = cat.accentColor ?? settings.primaryColor;
            return (
              <Link
                key={cat.id}
                href={`/dashboard/new-job?categoryId=${cat.id}`}
                className="group bg-white rounded-[16px] border border-[#D1E5E5] hover:shadow-xl transition-all overflow-hidden"
                style={{ "--accent": accent } as React.CSSProperties}
              >
                {/* Visual area */}
                <div
                  className="h-44 flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: bg }}
                >
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <>
                      <span className="text-8xl group-hover:scale-110 transition-transform duration-300 select-none relative z-10">
                        {cat.icon ?? "🔧"}
                      </span>
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `radial-gradient(circle at 50% 60%, ${accent}22, transparent 70%)`,
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-[#1F2937] transition-colors group-hover:text-[var(--accent)]">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {cat.description ?? "Service professionnel disponible"}
                      </p>
                    </div>
                    {cat.startPrice != null && (
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap"
                        style={{ color: settings.primaryColor, backgroundColor: "#E6F2F2" }}
                      >
                        Dès {cat.startPrice} CHF/h
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                    <span className="text-amber-400 text-sm">★★★★</span>
                    <span className="font-medium text-gray-600">4.9</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                      Disponible maintenant
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Stats banner ──────────────────────────────────────────────── */}
      <section style={{ backgroundColor: settings.primaryColor }}>
        <div className="max-w-[1200px] mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">{stat.value}</p>
              <p className="text-sm text-white/70 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it works ──────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1F2937]">{howItWorks.title}</h2>
          <p className="text-gray-500 mt-2 text-base">{howItWorks.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+40px)] right-[calc(16.67%+40px)] h-0.5 bg-[#D1E5E5]" />
          {howItWorks.steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[#E6F2F2] border-2 border-[#D1E5E5] flex items-center justify-center relative z-10 shadow-sm" style={{ color: settings.primaryColor }}>
                {STEP_ICONS[step.icon] ?? <span className="text-3xl">{step.icon}</span>}
              </div>
              <p
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: settings.primaryColor }}
              >
                Étape 0{i + 1}
              </p>
              <h3 className="text-lg font-semibold text-[#1F2937]">{step.title}</h3>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link href="/auth/register">
            <button
              className="text-white font-semibold px-8 py-3.5 rounded-[10px] text-sm transition-colors shadow-md"
              style={{ backgroundColor: settings.primaryColor }}
            >
              {howItWorks.ctaText}
            </button>
          </Link>
        </div>
      </section>

      {/* ─── Guarantees ────────────────────────────────────────────────── */}
      <section className="bg-[#F4F7F7] py-16 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#1F2937]">
              {guarantees.title}{" "}
              <span style={{ color: settings.primaryColor }}>{guarantees.titleHighlight}</span>
            </h2>
            <p className="text-gray-500 mt-2 text-base">{guarantees.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guarantees.items.map((g, i) => (
              <div
                key={i}
                className="bg-white rounded-[16px] p-6 border border-[#D1E5E5] flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-[#E6F2F2] flex items-center justify-center shrink-0" style={{ color: settings.primaryColor }}>
                  {GUARANTEE_ICONS[g.icon] ?? <span className="text-2xl">{g.icon}</span>}
                </div>
                <h3 className="font-bold text-[#1F2937] text-lg">{g.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pro recruitment CTA ───────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="rounded-[20px] overflow-hidden flex flex-col md:flex-row">
          {/* Left — teal content */}
          <div
            className="flex-1 p-8 md:p-12 flex flex-col justify-center gap-5"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">
              {proCta.badge}
            </p>
            <h2 className="text-3xl font-extrabold text-white leading-tight">{proCta.title}</h2>
            <p className="text-white/80 text-sm leading-relaxed max-w-md">{proCta.subtitle}</p>
            <ul className="flex flex-col gap-2 text-sm text-white/90">
              {proCta.benefits.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <Link href="/auth/register">
                <button className="bg-white font-bold px-6 py-3 rounded-[10px] text-sm hover:bg-[#F4F7F7] transition-colors shadow-md"
                  style={{ color: settings.primaryColor }}>
                  {proCta.ctaText}
                </button>
              </Link>
            </div>
          </div>

          {/* Right — stat panel */}
          <div className="bg-[#E6F2F2] md:w-72 p-8 flex flex-col justify-center items-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-white/60 flex items-center justify-center" style={{ color: settings.primaryColor }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
                <path d="M7 7h10M8.5 4.5 7 7M15.5 4.5 17 7"/>
                <path d="M6.5 7h11"/>
              </svg>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#1F2937]">{proCta.statValue}</p>
              <p className="text-sm text-gray-500">{proCta.statLabel}</p>
            </div>
            <div className="w-full h-px bg-[#D1E5E5]" />
            <div>
              <p className="text-3xl font-extrabold" style={{ color: settings.primaryColor }}>
                {proCta.revenueValue}
              </p>
              <p className="text-sm text-gray-500">{proCta.revenueLabel}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <footer className="bg-[#1F2937] text-white">
        <div className="max-w-[1200px] mx-auto px-4 pt-14 pb-10 grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" aria-label="GoServi — Accueil" className="inline-flex">
              <div className="bg-white rounded-xl px-4 py-2 inline-flex items-center">
                <Image
                  src="/logo.png"
                  alt="GoServi"
                  width={160}
                  height={48}
                  className="h-11 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">{footer.tagline}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span>📍</span> {footer.location}
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-4">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <span>© {new Date().getFullYear()} {footer.copyright}</span>
            <span>Réalisé avec ❤️ en Suisse romande</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
