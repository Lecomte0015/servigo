import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";

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
  { icon: "🚿", name: "Plombier", slug: "plombier", desc: "Fuite, canalisation bouchée, chauffe-eau" },
  { icon: "⚡", name: "Électricien", slug: "electricien", desc: "Panne électrique, installation, mise aux normes" },
  { icon: "🔒", name: "Serrurier", slug: "serrurier", desc: "Porte claquée, serrure cassée, cylindre" },
  { icon: "🌡️", name: "Chauffagiste", slug: "chauffagiste", desc: "Chaudière en panne, radiateurs, pompe à chaleur" },
  { icon: "🏠", name: "Couvreur", slug: "couvreur", desc: "Tuiles cassées, fuite toiture, gouttières" },
  { icon: "🔧", name: "Menuisier", slug: "menuisier", desc: "Porte, parquet, fenêtres, placards" },
  { icon: "🖌️", name: "Peintre", slug: "peintre", desc: "Peinture intérieure, façade, rénovation" },
  { icon: "🧹", name: "Nettoyage", slug: "nettoyage", desc: "Après sinistre, remise en état, fin de chantier" },
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
    "@type": "LocalBusiness",
    name: `GoServi — Artisans à ${city.name}`,
    description: city.description,
    url: `https://goservi.ch/trouver-artisan/${ville}`,
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: { "@type": "State", name: city.region },
    },
    serviceType: SERVICES.map((s) => s.name).join(", "),
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
          <span className="inline-block bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full mb-4">
            📍 {city.name} · Canton {city.canton}
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
            { value: "< 30 min", label: "Délai d'intervention moyen", icon: "⚡" },
            { value: "24h/24", label: "Disponibilité 7j/7", icon: "🕐" },
            { value: "4.9/5", label: "Note moyenne des artisans", icon: "⭐" },
            { value: "100%", label: "Artisans vérifiés & assurés", icon: "🛡️" },
          ].map((s) => (
            <div key={s.label} className="bg-[#F4F7F7] rounded-[12px] p-5 text-center">
              <p className="text-2xl mb-1">{s.icon}</p>
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
              className="flex flex-col gap-2 p-4 border border-[#D1E5E5] rounded-[12px] hover:border-[#1CA7A6] hover:bg-[#F4F7F7] transition-all group"
            >
              <span className="text-3xl">{service.icon}</span>
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
                        <p className="text-xs text-amber-500">
                          ★ {artisan.ratingAverage.toFixed(1)} ({artisan.ratingCount} avis)
                        </p>
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
                      <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
                        ⚡ Urgences
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
              📍 {n}
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
                📍 {c.name}
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
