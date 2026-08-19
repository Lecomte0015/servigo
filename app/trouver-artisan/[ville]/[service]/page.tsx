import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { IconMapPin, IconZap, IconClock, IconShieldCheck, IconPhone, IconCheckCircle, TradeIcon } from "@/components/ui/Icons";

// ── Communes de l'agglomération genevoise ────────────────────────────────────
const CITIES: Record<string, {
  name: string;
  canton: string;
  postalCode: string;
  parent: string;
  parentSlug: string;
  distance: string;
  description: string;
  character: string;
  neighborhoods: string[];
  population: string;
}> = {
  carouge: {
    name: "Carouge",
    canton: "GE",
    postalCode: "1227",
    parent: "Genève",
    parentSlug: "geneve",
    distance: "3 km du centre de Genève",
    description: "Carouge, surnommée la « ville sarde », est une commune dynamique au charme bohème au sud immédiat de Genève.",
    character: "la ville sarde au sud de Genève",
    neighborhoods: ["La Praille", "Les Acacias", "Les Savoises", "Jonction", "Veyrier"],
    population: "22 000",
  },
  "plan-les-ouates": {
    name: "Plan-les-Ouates",
    canton: "GE",
    postalCode: "1228",
    parent: "Genève",
    parentSlug: "geneve",
    distance: "8 km du centre de Genève",
    description: "Plan-les-Ouates est une commune résidentielle et industrielle en plein développement, au sud de Genève, connue pour ses nombreuses entreprises horlogères.",
    character: "la commune industrielle et résidentielle au sud de Genève",
    neighborhoods: ["Bernex", "Confignon", "Cartigny", "Soral", "Laconnex"],
    population: "14 000",
  },
  meyrin: {
    name: "Meyrin",
    canton: "GE",
    postalCode: "1217",
    parent: "Genève",
    parentSlug: "geneve",
    distance: "8 km du centre de Genève",
    description: "Meyrin est une commune internationale à l'ouest de Genève, connue pour abriter le CERN et une population très diverse.",
    character: "la commune internationale abritant le CERN",
    neighborhoods: ["Cointrin", "Satigny", "Vernier", "Le Grand-Saconnex", "Zimeysa"],
    population: "25 000",
  },
  vernier: {
    name: "Vernier",
    canton: "GE",
    postalCode: "1214",
    parent: "Genève",
    parentSlug: "geneve",
    distance: "5 km du centre de Genève",
    description: "Vernier est la deuxième plus grande commune du canton de Genève, une ville ouvrière et résidentielle au nord-ouest de Genève.",
    character: "la deuxième plus grande commune du canton de Genève",
    neighborhoods: ["Châtelaine", "Aïre", "Lignon", "Avanchets", "Meyrin-Village"],
    population: "35 000",
  },
  lancy: {
    name: "Lancy",
    canton: "GE",
    postalCode: "1212",
    parent: "Genève",
    parentSlug: "geneve",
    distance: "4 km du centre de Genève",
    description: "Lancy est une commune résidentielle au sud-ouest de Genève, appréciée pour ses quartiers calmes et sa proximité avec le centre-ville.",
    character: "la commune résidentielle au sud-ouest de Genève",
    neighborhoods: ["Petit-Lancy", "Grand-Lancy", "Les Palettes", "Onex", "Bachet"],
    population: "32 000",
  },
  cologny: {
    name: "Cologny",
    canton: "GE",
    postalCode: "1223",
    parent: "Genève",
    parentSlug: "geneve",
    distance: "5 km du centre de Genève",
    description: "Cologny est une commune résidentielle haut de gamme sur les rives du lac Léman, à l'est de Genève, réputée pour ses villas et son cadre exceptionnel.",
    character: "la commune résidentielle haut de gamme sur le lac Léman",
    neighborhoods: ["Vésenaz", "Vandœuvres", "Gy", "Presinge", "Puplinge"],
    population: "5 500",
  },
  "collonges-bellerive": {
    name: "Collonges-Bellerive",
    canton: "GE",
    postalCode: "1245",
    parent: "Genève",
    parentSlug: "geneve",
    distance: "7 km du centre de Genève",
    description: "Collonges-Bellerive est une commune verdoyante sur la rive gauche du lac Léman, à l'est de Genève, prisée pour son environnement calme et résidentiel.",
    character: "la commune résidentielle en bord de lac à l'est de Genève",
    neighborhoods: ["Anières", "Corsier", "Hermance", "Gy", "Meinier"],
    population: "3 200",
  },
};

// ── Services d'urgence ────────────────────────────────────────────────────────
const SERVICES: Record<string, {
  name: string;
  slug: string;
  headline: string;
  urgencyDesc: string;
  interventions: string[];
  avgPrice: string;
  avgTime: string;
  urgencyRatio: string;
  faqs: { q: string; a: string }[];
  relatedServices: string[];
}> = {
  plombier: {
    name: "Plombier",
    slug: "plombier",
    headline: "Plombier d'urgence",
    urgencyDesc:
      "Une fuite d'eau, une canalisation bouchée ou un chauffe-eau en panne peut causer des dégâts importants en quelques heures. Nos plombiers interviennent en urgence dans les 30 minutes.",
    interventions: [
      "Fuite d'eau — robinet, joint, canalisation",
      "Canalisation bouchée ou débordement",
      "Chauffe-eau en panne ou qui fuit",
      "WC bouché ou fuite au niveau du siphon",
      "Tuyau gelé ou éclaté",
      "Dégât des eaux et coupure d'urgence",
      "Remplacement de robinetterie",
      "Installation sanitaire et remise en état",
    ],
    avgPrice: "120–200 CHF",
    avgTime: "30 min",
    urgencyRatio: "72%",
    faqs: [
      {
        q: "Combien coûte un plombier d'urgence ?",
        a: "Le tarif d'un plombier d'urgence en Suisse romande varie entre 120 et 200 CHF pour une intervention de base. Un supplément urgence de 30 à 60 CHF peut s'appliquer les nuits, week-ends et jours fériés.",
      },
      {
        q: "Que faire en attendant le plombier ?",
        a: "Coupez immédiatement l'alimentation en eau principale (vanne d'arrêt sous l'évier ou au compteur). Épongez l'eau stagnante pour éviter les dégâts. Photographiez les dommages pour votre assurance.",
      },
      {
        q: "Le plombier peut-il intervenir la nuit ?",
        a: "Oui, nos plombiers partenaires sont disponibles 24h/24, 7j/7, y compris la nuit et les week-ends. Un supplément d'urgence nocturne s'applique.",
      },
    ],
    relatedServices: ["electricien", "serrurier"],
  },
  electricien: {
    name: "Électricien",
    slug: "electricien",
    headline: "Électricien d'urgence",
    urgencyDesc:
      "Une panne électrique, un court-circuit ou une installation défectueuse représente un danger réel. Nos électriciens certifiés NIBT interviennent rapidement pour sécuriser votre logement.",
    interventions: [
      "Panne électrique générale ou partielle",
      "Disjoncteur qui saute en permanence",
      "Court-circuit et odeur de brûlé",
      "Prise ou interrupteur défectueux",
      "Tableau électrique à remplacer",
      "Mise aux normes NIBT",
      "Installation prise / éclairage",
      "Détection de panne et diagnostic électrique",
    ],
    avgPrice: "150–250 CHF",
    avgTime: "45 min",
    urgencyRatio: "65%",
    faqs: [
      {
        q: "Mon disjoncteur saute constamment, est-ce urgent ?",
        a: "Oui, c'est un signe de surcharge ou d'un défaut sur votre installation. Ne réenclenchez pas le disjoncteur sans comprendre la cause — appelez un électricien pour un diagnostic.",
      },
      {
        q: "Faut-il des certifications pour les travaux électriques en Suisse ?",
        a: "Oui, en Suisse les travaux électriques doivent être réalisés par un professionnel certifié selon les normes NIBT (NFC 15-100 suisse). Tous nos électriciens partenaires sont certifiés.",
      },
      {
        q: "Combien coûte un diagnostic électrique ?",
        a: "Un diagnostic électrique complet coûte entre 80 et 150 CHF. En cas d'intervention immédiate, ce tarif est généralement inclus dans le devis global.",
      },
    ],
    relatedServices: ["plombier", "serrurier"],
  },
  serrurier: {
    name: "Serrurier",
    slug: "serrurier",
    headline: "Serrurier d'urgence",
    urgencyDesc:
      "Porte claquée, serrure bloquée, cambriolage — une urgence serrurerie peut survenir à tout moment. Nos serruriers interviennent en moins de 30 minutes, sans destruction si possible.",
    interventions: [
      "Ouverture de porte claquée (sans clé)",
      "Serrure bloquée ou cylindre cassé",
      "Remplacement de cylindre après cambriolage",
      "Porte blindée et serrure multipoints",
      "Changement de serrure après perte de clés",
      "Ouverture de coffre-fort",
      "Installation de verrou et barillet",
      "Sécurisation d'urgence après effraction",
    ],
    avgPrice: "150–300 CHF",
    avgTime: "20 min",
    urgencyRatio: "90%",
    faqs: [
      {
        q: "Combien coûte l'ouverture d'une porte claquée ?",
        a: "L'ouverture d'une porte claquée coûte généralement entre 150 et 300 CHF. Le tarif dépend du type de serrure, de l'heure d'intervention et de la complexité. Méfiez-vous des serruriers affichant des prix anormalement bas.",
      },
      {
        q: "Le serrurier peut-il ouvrir ma porte sans la détruire ?",
        a: "Dans la grande majorité des cas oui — nos serruriers utilisent des techniques de crochetage non-destructif. La destruction n'est nécessaire que sur les serrures très haute sécurité.",
      },
      {
        q: "Que faire après un cambriolage ?",
        a: "Appelez d'abord la police (117) pour constater les faits. Appelez ensuite un serrurier pour sécuriser votre logement immédiatement. Ne touchez à rien avant le passage de la police.",
      },
    ],
    relatedServices: ["plombier", "electricien"],
  },
};

const CITY_SLUGS = Object.keys(CITIES);
const SERVICE_SLUGS = Object.keys(SERVICES);

export async function generateStaticParams() {
  const params: { ville: string; service: string }[] = [];
  for (const ville of CITY_SLUGS) {
    for (const service of SERVICE_SLUGS) {
      params.push({ ville, service });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ville: string; service: string }>;
}): Promise<Metadata> {
  const { ville, service } = await params;
  const city = CITIES[ville];
  const svc = SERVICES[service];
  if (!city || !svc) return {};

  const title = `${svc.name} ${city.name} — Urgence 24h/24 | GoServi`;
  const description = `${svc.name} d'urgence à ${city.name} (${city.postalCode}) — intervention en ${svc.avgTime}, disponible 24h/24 et 7j/7. Artisans vérifiés, assurés. Dès ${svc.avgPrice}.`;

  return {
    title,
    description,
    keywords: [
      `${svc.name.toLowerCase()} ${city.name.toLowerCase()}`,
      `${svc.name.toLowerCase()} ${city.name.toLowerCase()} urgence`,
      `${svc.name.toLowerCase()} urgence ${city.name.toLowerCase()} 24h`,
      `${svc.slug} ${city.name.toLowerCase()} pas cher`,
      `${svc.slug} ${city.canton.toLowerCase()} ${city.name.toLowerCase()}`,
      `artisan ${city.name.toLowerCase()} urgence`,
      `dépannage ${svc.slug} ${city.name.toLowerCase()}`,
    ],
    alternates: { canonical: `https://goservi.ch/trouver-artisan/${ville}/${service}` },
    openGraph: {
      url: `https://goservi.ch/trouver-artisan/${ville}/${service}`,
      title,
      description,
      type: "website",
    },
  };
}

export default async function ServiceVillePage({
  params,
}: {
  params: Promise<{ ville: string; service: string }>;
}) {
  const { ville, service } = await params;
  const city = CITIES[ville];
  const svc = SERVICES[service];
  if (!city || !svc) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
    "@id": `https://goservi.ch/trouver-artisan/${ville}/${service}`,
    name: `GoServi — ${svc.name} à ${city.name}`,
    description: `${svc.name} d'urgence à ${city.name}. Intervention rapide, artisans vérifiés et assurés. Disponible 24h/24, 7j/7.`,
    url: `https://goservi.ch/trouver-artisan/${ville}/${service}`,
    image: "https://goservi.ch/logo.png",
    telephone: "+41-22-000-00-00",
    email: "contact@goservi.ch",
    priceRange: svc.avgPrice,
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
      postalCode: city.postalCode,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: `Canton de ${city.canton}`,
        containedInPlace: { "@type": "Country", name: "Suisse" },
      },
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${svc.name} à ${city.name}`,
      itemListElement: svc.interventions.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          name: item,
          provider: { "@id": "https://goservi.ch/#organization" },
          areaServed: { "@type": "City", name: city.name },
        },
      })),
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: svc.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#1CA7A6] to-[#178F8E] text-white pt-14 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Breadcrumb pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-5">
            <Link
              href={`/trouver-artisan/${city.parentSlug}`}
              className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1 rounded-full transition-colors"
            >
              <IconMapPin size={11} /> {city.parent}
            </Link>
            <span className="text-white/40 text-xs">›</span>
            <Link
              href={`/trouver-artisan/${ville}`}
              className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1 rounded-full transition-colors"
            >
              {city.name}
            </Link>
            <span className="text-white/40 text-xs">›</span>
            <span className="inline-flex items-center gap-1 bg-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {svc.name}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
            {svc.headline} à {city.name}
            <span className="block text-white/85 text-2xl sm:text-3xl font-bold mt-1">
              Intervention en {svc.avgTime} — 24h/24, 7j/7
            </span>
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            {svc.urgencyDesc} Couvrant {city.name} et ses quartiers — {city.distance}.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/auth/register?service=${svc.slug}&city=${encodeURIComponent(city.name)}`}
              className="bg-white text-[#1CA7A6] font-bold px-8 py-4 rounded-[12px] hover:bg-[#F4F7F7] transition-colors shadow-lg text-base"
            >
              Appeler un {svc.name.toLowerCase()} à {city.name} →
            </Link>
          </div>

          <p className="text-white/60 text-xs mt-4">
            Gratuit · Sans engagement · Réponse en {svc.avgTime}
          </p>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { value: `< ${svc.avgTime}`, label: "Délai d'intervention", Icon: IconZap },
            { value: "24h/24", label: "Disponibilité 7j/7", Icon: IconClock },
            { value: "100%", label: "Artisans vérifiés", Icon: IconShieldCheck },
            { value: svc.urgencyRatio, label: "Missions urgentes", Icon: IconPhone },
          ].map((s) => (
            <div key={s.label} className="bg-[#F4F7F7] rounded-[12px] p-5 text-center">
              <span className="inline-flex w-9 h-9 rounded-full bg-[#E6F2F2] items-center justify-center text-[#1CA7A6] mb-2">
                <s.Icon size={18} />
              </span>
              <p className="text-2xl font-extrabold text-[#1CA7A6]">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Interventions ─────────────────────────────────────────────────── */}
      <section className="bg-[#F4F7F7] py-12 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#1F2937]">
              Interventions de {svc.name.toLowerCase()} à {city.name}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Tous types d&apos;urgences et de travaux de {svc.slug} couverts à {city.name}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {svc.interventions.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 bg-white rounded-[12px] border border-[#D1E5E5] p-4"
              >
                <span className="w-7 h-7 rounded-full bg-[#E6F2F2] text-[#1CA7A6] flex items-center justify-center shrink-0 mt-0.5">
                  <IconCheckCircle size={14} />
                </span>
                <p className="text-sm text-[#1F2937] font-medium leading-snug">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pourquoi GoServi à {city.name} ───────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Left — text */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-4">
              Pourquoi GoServi pour votre {svc.name.toLowerCase()} à {city.name} ?
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              {city.description} Que vous soyez dans les quartiers de{" "}
              {city.neighborhoods.slice(0, 3).join(", ")} ou ailleurs à {city.name},
              nos {svc.name.toLowerCase()}s partenaires sont positionnés à proximité pour
              une intervention ultra-rapide.
            </p>
            <div className="flex flex-col gap-3">
              {[
                `${svc.name}s disponibles à ${city.name} et ${city.distance}`,
                `Artisans vérifiés : RC, assurance RC Pro, qualifications`,
                `Tarif transparent communiqué avant intervention`,
                `Paiement sécurisé par carte ou Twint`,
                `Avis clients vérifiés après chaque mission`,
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#1CA7A6] flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — pricing card */}
          <div className="lg:w-80 bg-[#F4F7F7] rounded-[20px] border border-[#D1E5E5] p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-12 h-12 rounded-[12px] bg-[#E6F2F2] text-[#1CA7A6] flex items-center justify-center shrink-0">
                <TradeIcon slug={svc.slug} size={24} />
              </span>
              <div>
                <p className="font-bold text-[#1F2937]">{svc.name} à {city.name}</p>
                <p className="text-xs text-gray-400">Tarif indicatif</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-[#E6F2F2]">
                <span className="text-gray-600">Intervention standard</span>
                <span className="font-semibold text-[#1CA7A6]">{svc.avgPrice}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#E6F2F2]">
                <span className="text-gray-600">Supplément nuit / WE</span>
                <span className="font-semibold text-[#1CA7A6]">+30–60 CHF</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Déplacement</span>
                <span className="font-semibold text-green-600">Inclus</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              * Tarifs indicatifs — devis précis fourni avant intervention
            </p>
            <Link
              href={`/auth/register?service=${svc.slug}&city=${encodeURIComponent(city.name)}`}
              className="block mt-5 w-full bg-[#1CA7A6] text-white font-bold py-3 rounded-[10px] text-center hover:bg-[#178F8E] transition-colors text-sm"
            >
              Obtenir un {svc.name.toLowerCase()} maintenant →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ─────────────────────────────────────────────── */}
      <section className="bg-[#F4F7F7] py-12 px-4">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-8 text-center">
            Trouver un {svc.name.toLowerCase()} à {city.name} en 3 étapes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                n: "1",
                title: "Décrivez votre problème",
                desc: `Sélectionnez le service ${svc.slug}, décrivez votre situation à ${city.name} en 30 secondes.`,
              },
              {
                n: "2",
                title: `Un ${svc.name.toLowerCase()} vous répond`,
                desc: `Les ${svc.name.toLowerCase()}s disponibles à ${city.name} reçoivent votre demande. Le premier disponible accepte.`,
              },
              {
                n: "3",
                title: "Intervention rapide",
                desc: `L'artisan arrive en ${svc.avgTime}. Paiement sécurisé par carte ou Twint après intervention.`,
              },
            ].map((s) => (
              <div key={s.n} className="bg-white rounded-[14px] border border-[#D1E5E5] p-5 flex flex-col gap-3 text-center">
                <div className="w-10 h-10 rounded-full bg-[#1CA7A6] text-white font-extrabold text-lg flex items-center justify-center mx-auto">
                  {s.n}
                </div>
                <h3 className="font-semibold text-[#1F2937]">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quartiers couverts ────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-[#1F2937] mb-5 text-center">
          Zones d&apos;intervention — {svc.name} à {city.name} et alentours
        </h2>
        <div className="flex flex-wrap gap-2 justify-center">
          {[city.name, ...city.neighborhoods].map((n) => (
            <span
              key={n}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F7F7] border border-[#D1E5E5] rounded-full text-sm text-gray-600"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1CA7A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {n}
            </span>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#F4F7F7] py-12 px-4">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-8 text-center">
            Questions fréquentes — {svc.name} à {city.name}
          </h2>
          <div className="flex flex-col gap-4">
            {svc.faqs.map((faq) => (
              <div key={faq.q} className="bg-white border border-[#D1E5E5] rounded-[14px] p-5">
                <p className="font-semibold text-[#1F2937] mb-2">{faq.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
            {/* Question spécifique à la ville */}
            <div className="bg-white border border-[#D1E5E5] rounded-[14px] p-5">
              <p className="font-semibold text-[#1F2937] mb-2">
                GoServi couvre-t-il bien {city.name} ?
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Oui, GoServi dispose de {svc.name.toLowerCase()}s partenaires basés à {city.name} et
                dans l&apos;agglomération genevoise. {city.description} Nos artisans
                connaissent bien {city.character} et peuvent intervenir rapidement dans
                tous les quartiers, à seulement {city.distance}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Autres services à {city} ──────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-[#1F2937] mb-5 text-center">
          Autres services d&apos;urgence à {city.name}
        </h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {svc.relatedServices.map((slug) => {
            const rel = SERVICES[slug];
            if (!rel) return null;
            return (
              <Link
                key={slug}
                href={`/trouver-artisan/${ville}/${slug}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D1E5E5] rounded-full text-sm text-[#1CA7A6] hover:border-[#1CA7A6] hover:bg-[#E6F2F2] transition-all font-medium"
              >
                <TradeIcon slug={rel.slug} size={15} />
                {rel.name} à {city.name}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Autres communes autour de Genève ──────────────────────────────── */}
      <section className="bg-[#F4F7F7] py-10 px-4">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-sm text-center text-gray-500 mb-5">
            {svc.name} disponible dans toute l&apos;agglomération genevoise
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {CITY_SLUGS.filter((s) => s !== ville).map((slug) => {
              const c = CITIES[slug];
              return (
                <Link
                  key={slug}
                  href={`/trouver-artisan/${slug}/${service}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D1E5E5] rounded-full text-sm text-[#1CA7A6] hover:border-[#1CA7A6] transition-colors"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {svc.name} {c.name}
                </Link>
              );
            })}
            <Link
              href={`/trouver-artisan/geneve/${service}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1CA7A6] text-white rounded-full text-sm hover:bg-[#178F8E] transition-colors font-medium"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {svc.name} Genève →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Final ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#1CA7A6] to-[#178F8E] text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">
            Besoin d&apos;un {svc.name.toLowerCase()} à {city.name} maintenant ?
          </h2>
          <p className="text-white/80 mb-6 leading-relaxed">
            Décrivez votre situation en 30 secondes. Un {svc.name.toLowerCase()} vérifié
            répond et intervient en {svc.avgTime} à {city.name}.
          </p>
          <Link
            href={`/auth/register?service=${svc.slug}&city=${encodeURIComponent(city.name)}`}
            className="inline-flex items-center gap-2 bg-white text-[#1CA7A6] font-bold px-8 py-4 rounded-[12px] hover:bg-[#F4F7F7] transition-colors shadow-lg text-base"
          >
            Trouver un {svc.name.toLowerCase()} à {city.name} →
          </Link>
          <p className="text-white/50 text-xs mt-3">
            Sans inscription requise · Réponse en {svc.avgTime} · Dès {svc.avgPrice}
          </p>
        </div>
      </section>
    </div>
  );
}
