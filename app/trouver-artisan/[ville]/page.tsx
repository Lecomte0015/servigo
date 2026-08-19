import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";
import { TradeIcon, IconMapPin, IconZap, IconClock, IconStar, IconShieldCheck, StarRating } from "@/components/ui/Icons";

// ── Données par ville ──────────────────────────────────────────────────────────
const CITIES: Record<string, {
  slug: string;
  name: string;
  canton: string;
  region: string;
  population: string;
  description: string;
  neighborhoods: string[];
}> = {
  geneve: {
    slug: "geneve",
    name: "Genève",
    canton: "GE",
    region: "Genève",
    population: "200 000",
    description: "Trouvez un artisan disponible à Genève rapidement. Plombiers, électriciens, serruriers disponibles 24h/24.",
    neighborhoods: ["Carouge", "Plainpalais", "Eaux-Vives", "Champel", "Pâquis", "Meyrin", "Onex", "Lancy"],
  },
  lausanne: {
    slug: "lausanne",
    name: "Lausanne",
    canton: "VD",
    region: "Vaud",
    population: "140 000",
    description: "Artisans disponibles à Lausanne pour vos urgences et travaux. Intervention rapide dans tout le canton de Vaud.",
    neighborhoods: ["Ouchy", "Flon", "Pully", "Prilly", "Renens", "Lutry", "Paudex", "Belmont-sur-Lausanne"],
  },
  fribourg: {
    slug: "fribourg",
    name: "Fribourg",
    canton: "FR",
    region: "Fribourg",
    population: "40 000",
    description: "Trouvez un artisan qualifié à Fribourg. Interventions urgentes et travaux planifiés dans toute la région fribourgeoise.",
    neighborhoods: ["Villars-sur-Glâne", "Granges-Paccot", "Marly", "Givisiez", "Düdingen", "Murten"],
  },
  neuchatel: {
    slug: "neuchatel",
    name: "Neuchâtel",
    canton: "NE",
    region: "Neuchâtel",
    population: "44 000",
    description: "Artisans disponibles à Neuchâtel et dans le canton. Plomberie, électricité, serrurerie — intervention rapide.",
    neighborhoods: ["La Chaux-de-Fonds", "Le Locle", "Boudry", "Colombier", "Hauterive", "Marin-Epagnier"],
  },
  sion: {
    slug: "sion",
    name: "Sion",
    canton: "VS",
    region: "Valais",
    population: "35 000",
    description: "Trouvez un artisan à Sion et en Valais romand. Dépannage urgent et travaux de rénovation.",
    neighborhoods: ["Conthey", "Martigny", "Monthey", "Sierre", "Nendaz", "Vétroz", "Savièse"],
  },
  bienne: {
    slug: "bienne",
    name: "Bienne",
    canton: "BE",
    region: "Berne (Jura bernois)",
    population: "56 000",
    description: "Artisans qualifiés à Bienne et dans le Jura bernois. Urgences et travaux dans tout le secteur.",
    neighborhoods: ["Nidau", "Port", "Brügg", "Mett", "Madretsch", "Boujean"],
  },
  yverdon: {
    slug: "yverdon",
    name: "Yverdon-les-Bains",
    canton: "VD",
    region: "Nord vaudois",
    population: "30 000",
    description: "Trouvez un artisan à Yverdon-les-Bains et dans le Nord vaudois. Intervention rapide pour vos urgences.",
    neighborhoods: ["Grandson", "Orbe", "Chavornay", "Essert-sous-Champvent", "Yvonand", "Payerne"],
  },
  montreux: {
    slug: "montreux",
    name: "Montreux",
    canton: "VD",
    region: "Riviera vaudoise",
    population: "27 000",
    description: "Artisans disponibles à Montreux et sur la Riviera vaudoise. Plombiers, électriciens, serruriers — dépannage express.",
    neighborhoods: ["Vevey", "Cully", "Villeneuve", "Blonay", "Saint-Légier", "Corsier-sur-Vevey"],
  },
  nyon: {
    slug: "nyon",
    name: "Nyon",
    canton: "VD",
    region: "District de Nyon",
    population: "22 000",
    description: "Trouvez un artisan à Nyon et dans le district. Interventions urgentes et travaux planifiés rapidement.",
    neighborhoods: ["Gland", "Rolle", "Prangins", "Coppet", "Crans-près-Céligny", "Founex"],
  },
  morges: {
    slug: "morges",
    name: "Morges",
    canton: "VD",
    region: "District de Morges",
    population: "17 000",
    description: "Artisans disponibles à Morges et environs. Plomberie, électricité, serrurerie — intervention rapide.",
    neighborhoods: ["Aubonne", "Allaman", "Etoy", "Echichens", "Tolochenaz", "Saint-Prex"],
  },
  "la-chaux-de-fonds": {
    slug: "la-chaux-de-fonds",
    name: "La Chaux-de-Fonds",
    canton: "NE",
    region: "Neuchâtel",
    population: "39 000",
    description: "Trouvez un artisan à La Chaux-de-Fonds. Dépannage urgent et travaux dans toute la région.",
    neighborhoods: ["Le Locle", "Les Ponts-de-Martel", "La Brévine", "Les Brenets", "Fleurier"],
  },
  martigny: {
    slug: "martigny",
    name: "Martigny",
    canton: "VS",
    region: "Valais",
    population: "20 000",
    description: "Artisans qualifiés à Martigny et en Bas-Valais. Urgences et rénovations, disponibles rapidement.",
    neighborhoods: ["Saxon", "Riddes", "Saillon", "Fully", "Bovernier", "Sembrancher"],
  },
};

const SERVICES = [
  { slug: "plombier", name: "Plombier", desc: "Fuite, canalisation bouchée, chauffe-eau" },
  { slug: "electricien", name: "Électricien", desc: "Panne électrique, installation, mise aux normes" },
  { slug: "serrurier", name: "Serrurier", desc: "Porte claquée, serrure cassée, cylindre" },
  { slug: "chauffagiste", name: "Chauffagiste", desc: "Chaudière en panne, radiateurs, pompe à chaleur" },
  { slug: "couvreur", name: "Couvreur", desc: "Tuiles cassées, fuite toiture, gouttières" },
  { slug: "menuisier", name: "Menuisier", desc: "Porte, parquet, fenêtres, placards" },
  { slug: "peintre", name: "Peintre", desc: "Peinture intérieure, façade, rénovation" },
  { slug: "nettoyage", name: "Nettoyage", desc: "Après sinistre, remise en état, fin de chantier" },
];

export async function generateStaticParams() {
  return Object.keys(CITIES).map((slug) => ({ ville: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ville: string }>;
}): Promise<Metadata> {
  const { ville } = await params;
  const city = CITIES[ville];
  if (!city) return {};

  const title = `Artisan ${city.name} — Plombier, Électricien, Serrurier disponible 24h/24`;
  const description = `Trouvez un artisan qualifié à ${city.name} en moins de 30 minutes. Plombiers, électriciens, serruriers vérifiés disponibles 24h/24, 7j/7. Intervention d'urgence rapide.`;

  return {
    title,
    description,
    keywords: [
      `artisan ${city.name.toLowerCase()}`,
      `plombier ${city.name.toLowerCase()} urgence`,
      `électricien ${city.name.toLowerCase()}`,
      `serrurier ${city.name.toLowerCase()}`,
      `dépannage ${city.name.toLowerCase()}`,
      `artisan urgence ${city.canton}`,
    ],
    alternates: { canonical: `https://goservi.ch/trouver-artisan/${ville}` },
    openGraph: {
      url: `https://goservi.ch/trouver-artisan/${ville}`,
      title,
      description,
      type: "website",
    },
  };
}

export default async function TrouverArtisanVillePage({
  params,
}: {
  params: Promise<{ ville: string }>;
}) {
  const { ville } = await params;
  const city = CITIES[ville];
  if (!city) notFound();

  // Artisans approuvés dans cette ville (insensible à la casse)
  const artisans = await prisma.artisanProfile.findMany({
    where: {
      isApproved: true,
      city: { equals: city.name, mode: "insensitive" },
    },
    select: {
      id: true,
      companyName: true,
      ratingAverage: true,
      ratingCount: true,
      emergencyAvailable: true,
      photoUrl: true,
      slug: true,
      services: {
        where: { isActive: true },
        select: { category: { select: { name: true, icon: true } } },
        take: 3,
      },
    },
    take: 8,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
    "@id": `https://goservi.ch/trouver-artisan/${ville}`,
    name: `GoServi — Artisans à ${city.name}`,
    description: city.description,
    url: `https://goservi.ch/trouver-artisan/${ville}`,
    image: "https://goservi.ch/logo.png",
    logo: "https://goservi.ch/logo.png",
    email: "contact@goservi.ch",
    priceRange: "$$",
    currenciesAccepted: "CHF",
    paymentAccepted: "Credit Card, Twint",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: { "@type": "State", name: city.region, containedInPlace: { "@type": "Country", name: "Suisse" } },
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Services d'artisanat à ${city.name}`,
      itemListElement: SERVICES.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          name: s.name,
          description: s.desc,
          provider: { "@id": "https://goservi.ch/#organization" },
          areaServed: { "@type": "City", name: city.name },
        },
      })),
    },
    aggregateRating: artisans.length > 0 ? {
      "@type": "AggregateRating",
      ratingValue: (
        artisans.reduce((sum, a) => sum + (a.ratingAverage ?? 0), 0) / artisans.length
      ).toFixed(1),
      reviewCount: artisans.reduce((sum, a) => sum + (a.ratingCount ?? 0), 0),
      bestRating: "5",
    } : undefined,
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1CA7A6] to-[#178F8E] text-white pt-14 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full mb-4">
            <IconMapPin size={14} /> {city.name} · Canton {city.canton}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
            Artisan à {city.name}<br />
            <span className="text-white/90">en moins de 30 minutes</span>
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Plombiers, électriciens, serruriers et plus — des artisans vérifiés disponibles 24h/24 à {city.name} et dans la région {city.region}.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register"
              className="bg-white text-[#1CA7A6] font-semibold px-6 py-3 rounded-[10px] hover:bg-[#F4F7F7] transition-colors shadow-sm"
            >
              Trouver un artisan maintenant →
            </Link>
            <Link
              href="/artisans"
              className="border-2 border-white/50 text-white font-medium px-6 py-3 rounded-[10px] hover:bg-white/10 transition-colors"
            >
              Voir la carte des artisans
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { value: "< 30 min", label: "Délai d'intervention moyen", Icon: IconZap },
            { value: "24h/24", label: "Disponibilité 7j/7", Icon: IconClock },
            { value: "4.9/5", label: "Note moyenne des artisans", Icon: IconStar },
            { value: "100%", label: "Artisans vérifiés & assurés", Icon: IconShieldCheck },
          ].map((s) => (
            <div key={s.label} className="bg-[#F4F7F7] rounded-[12px] p-5 text-center">
              <span className="inline-flex w-9 h-9 rounded-full bg-[#E6F2F2] items-center justify-center text-[#1CA7A6] mb-2">
                <s.Icon size={18} />
              </span>
              <p className="text-xl font-extrabold text-[#1CA7A6]">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services disponibles */}
      <section className="max-w-[1200px] mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-[#1F2937] mb-2 text-center">
          Services disponibles à {city.name}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          Des artisans qualifiés pour toutes vos interventions urgentes et planifiées
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((service) => (
            <Link
              key={service.slug}
              href={`/auth/register?service=${service.slug}&city=${encodeURIComponent(city.name)}`}
              className="flex flex-col gap-3 p-4 border border-[#D1E5E5] rounded-[12px] hover:border-[#1CA7A6] hover:bg-[#F4F7F7] transition-all group"
            >
              <span className="w-10 h-10 flex items-center justify-center rounded-[10px] bg-[#E6F2F2] text-[#1CA7A6] shrink-0"><TradeIcon slug={service.slug} size={22} /></span>
              <p className="font-semibold text-[#1F2937] group-hover:text-[#1CA7A6] transition-colors">
                {service.name} à {city.name}
              </p>
              <p className="text-xs text-gray-400">{service.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Artisans disponibles dans cette ville */}
      {artisans.length > 0 && (
        <section className="bg-[#F4F7F7] py-12 px-4">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-2 text-center">
              Artisans vérifiés à {city.name}
            </h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              {artisans.length} artisan{artisans.length > 1 ? "s" : ""} disponible{artisans.length > 1 ? "s" : ""} dans votre secteur
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {artisans.map((artisan) => (
                <div
                  key={artisan.id}
                  className="bg-white rounded-[12px] border border-[#D1E5E5] p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#1CA7A6] flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
                      {artisan.photoUrl ? (
                        <img src={artisan.photoUrl} alt={artisan.companyName} className="w-full h-full object-cover" />
                      ) : (
                        artisan.companyName[0]
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1F2937] text-sm truncate">{artisan.companyName}</p>
                      {artisan.ratingCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-amber-500">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          <span>{artisan.ratingAverage.toFixed(1)} ({artisan.ratingCount} avis)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {artisan.services.slice(0, 2).map((s, i) => (
                      <span key={i} className="text-xs bg-[#E6F2F2] text-[#1CA7A6] px-2 py-0.5 rounded-full">
                        {s.category.icon} {s.category.name}
                      </span>
                    ))}
                    {artisan.emergencyAvailable && (
                      <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        Urgences
                      </span>
                    )}
                  </div>
                  {artisan.slug && (
                    <Link
                      href={`/artisans/${artisan.slug}`}
                      className="text-xs text-[#1CA7A6] hover:underline font-medium"
                    >
                      Voir le profil →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quartiers couverts */}
      <section className="max-w-[1200px] mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-[#1F2937] mb-6 text-center">
          Zones d&apos;intervention autour de {city.name}
        </h2>
        <div className="flex flex-wrap gap-2 justify-center">
          {[city.name, ...city.neighborhoods].map((n) => (
            <span
              key={n}
              className="px-3 py-1.5 bg-[#F4F7F7] border border-[#D1E5E5] rounded-full text-sm text-gray-600"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1CA7A6]"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {n}
            </span>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="bg-[#F4F7F7] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-8 text-center">
            Comment trouver un artisan à {city.name} ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Décrivez votre besoin", desc: "Choisissez le type d'intervention et décrivez le problème en 30 secondes." },
              { step: "2", title: "Un artisan vous répond", desc: `Les meilleurs artisans disponibles à ${city.name} sont notifiés immédiatement.` },
              { step: "3", title: "Intervention rapide", desc: "L'artisan arrive en moins de 30 minutes pour les urgences. Paiement sécurisé." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1CA7A6] text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                  {s.step}
                </div>
                <p className="font-semibold text-[#1F2937]">{s.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Communes de l'agglomération — uniquement sur la page Genève */}
      {ville === "geneve" && (
        <section className="bg-[#F4F7F7] py-12 px-4">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-2 text-center">
              Artisan d&apos;urgence dans les communes genevoises
            </h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              Plombier, électricien et serrurier disponibles dans toute l&apos;agglomération genevoise
            </p>
            {[
              { slug: "plombier", name: "Plombier d'urgence", icon: "💧" },
              { slug: "electricien", name: "Électricien d'urgence", icon: "⚡" },
              { slug: "serrurier", name: "Serrurier d'urgence", icon: "🔑" },
            ].map((svc) => (
              <div key={svc.slug} className="mb-6">
                <p className="text-sm font-semibold text-[#1CA7A6] mb-3 flex items-center gap-2">
                  <TradeIcon slug={svc.slug} size={15} />
                  {svc.name} — communes genevoises
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { slug: "carouge", name: "Carouge" },
                    { slug: "plan-les-ouates", name: "Plan-les-Ouates" },
                    { slug: "meyrin", name: "Meyrin" },
                    { slug: "vernier", name: "Vernier" },
                    { slug: "lancy", name: "Lancy" },
                    { slug: "cologny", name: "Cologny" },
                    { slug: "collonges-bellerive", name: "Collonges-Bellerive" },
                  ].map((commune) => (
                    <Link
                      key={commune.slug}
                      href={`/trouver-artisan/${commune.slug}/${svc.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D1E5E5] rounded-full text-sm text-[#1F2937] hover:border-[#1CA7A6] hover:text-[#1CA7A6] transition-colors"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1CA7A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {svc.name.split(" ")[0]} {commune.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Autres villes */}
      <section className="max-w-[1200px] mx-auto px-4 py-10">
        <p className="text-sm text-center text-gray-500 mb-5">GoServi est aussi disponible dans ces villes</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.values(CITIES)
            .filter((c) => c.slug !== ville)
            .map((c) => (
              <Link
                key={c.slug}
                href={`/trouver-artisan/${c.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D1E5E5] rounded-full text-sm text-[#1CA7A6] hover:border-[#1CA7A6] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {c.name}
              </Link>
            ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="py-14 px-4 text-center bg-gradient-to-br from-[#1CA7A6] to-[#178F8E] text-white">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">
            Besoin d&apos;un artisan à {city.name} maintenant ?
          </h2>
          <p className="text-white/80 mb-6">
            Créez votre demande en 2 minutes. Un artisan vérifié vous répond rapidement.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-[#1CA7A6] font-semibold px-8 py-3.5 rounded-[10px] hover:bg-[#F4F7F7] transition-colors shadow-sm text-base"
          >
            Trouver un artisan à {city.name} →
          </Link>
        </div>
      </section>
    </div>
  );
}
