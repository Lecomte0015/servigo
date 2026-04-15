import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

// ── Données par métier ─────────────────────────────────────────────────────────
const TRADES: Record<string, {
  slug: string;
  name: string;
  icon: string;
  namePlural: string;
  description: string;
  longDesc: string;
  avgRevenue: string;
  jobsPerMonth: string;
  urgencyRatio: string;
  skills: string[];
  faqs: { q: string; a: string }[];
}> = {
  plombier: {
    slug: "plombier",
    name: "Plombier",
    icon: "🚿",
    namePlural: "plombiers",
    description: "Développez votre activité de plomberie en Suisse romande avec GoServi.",
    longDesc: "En tant que plombier, vous intervenez sur des problèmes urgents du quotidien — fuites, canalisations bouchées, chauffe-eaux en panne. GoServi vous connecte directement avec des clients qui ont besoin de vous maintenant.",
    avgRevenue: "2 400 CHF",
    jobsPerMonth: "18–25",
    urgencyRatio: "72%",
    skills: ["Débouchage canalisation", "Fuite robinet / chauffe-eau", "Installation sanitaire", "Dépannage tuyauterie", "Remplacement siphon"],
    faqs: [
      { q: "Combien de missions par mois puis-je espérer en tant que plombier ?", a: "Nos plombiers actifs en Suisse romande reçoivent entre 18 et 25 demandes par mois, dont 72% sont urgentes (intervention sous 2h)." },
      { q: "Dois-je être disponible 24h/24 ?", a: "Non. Vous activez ou désactivez vos disponibilités depuis votre espace artisan. Vous ne recevez des missions que quand vous êtes disponible." },
      { q: "GoServi prend-il une commission ?", a: "Oui, GoServi prélève une commission de 15% sur chaque mission. Aucun abonnement mensuel, aucun frais fixe." },
    ],
  },
  electricien: {
    slug: "electricien",
    name: "Électricien",
    icon: "⚡",
    namePlural: "électriciens",
    description: "Trouvez des clients pour votre activité d'électricien en Suisse romande.",
    longDesc: "Les pannes électriques, les installations défectueuses et les mises aux normes sont des besoins constants. Rejoignez GoServi pour recevoir des demandes qualifiées d'électricité dans votre secteur.",
    avgRevenue: "2 600 CHF",
    jobsPerMonth: "15–22",
    urgencyRatio: "65%",
    skills: ["Dépannage panne électrique", "Installation tableau électrique", "Prise / interrupteur défectueux", "Mise aux normes", "Éclairage & domotique"],
    faqs: [
      { q: "Faut-il des certifications particulières pour rejoindre GoServi en tant qu'électricien ?", a: "Oui, nous vérifions votre assurance RC Pro et votre numéro RC. Pour les travaux électriques en Suisse, les habilitations NIBT sont requises." },
      { q: "Quel est le montant moyen d'une mission électricité ?", a: "Les interventions d'urgence (dépannage) se situent entre 150 et 400 CHF. Les installations complètes peuvent atteindre 2 000 CHF." },
      { q: "Comment suis-je payé ?", a: "Le client prépaye via Stripe avant l'intervention. Le montant vous est versé sous 2–3 jours ouvrables après confirmation de la mission." },
    ],
  },
  serrurier: {
    slug: "serrurier",
    name: "Serrurier",
    icon: "🔒",
    namePlural: "serruriers",
    description: "Recevez des missions de serrurerie urgentes en Suisse romande.",
    longDesc: "Ouverture de porte claquée, serrure cassée, remplacement de cylindre — les urgences de serrurerie arrivent à toute heure. GoServi vous envoie des clients en temps réel, sans prospection.",
    avgRevenue: "2 200 CHF",
    jobsPerMonth: "20–30",
    urgencyRatio: "90%",
    skills: ["Ouverture de porte claquée", "Remplacement serrure / cylindre", "Porte blindée", "Coffre-fort", "Serrure multipoints"],
    faqs: [
      { q: "Les missions de serrurerie sont-elles vraiment urgentes ?", a: "Oui, 90% des demandes de serrurerie sur GoServi sont des urgences : porte claquée, cambriolage, serrure bloquée. Vous intervenez généralement sous 30–60 minutes." },
      { q: "Suis-je en concurrence avec d'autres serruriers ?", a: "Pour chaque demande, GoServi sélectionne le top 5 des artisans disponibles les plus proches. Le premier à accepter reçoit la mission." },
      { q: "Puis-je fixer mes propres tarifs ?", a: "Oui, vous définissez votre prix de base par heure et votre supplément urgence dans votre profil artisan." },
    ],
  },
  chauffagiste: {
    slug: "chauffagiste",
    name: "Chauffagiste",
    icon: "🌡️",
    namePlural: "chauffagistes",
    description: "Développez votre activité de chauffage en Suisse romande avec GoServi.",
    longDesc: "Chaudières en panne, radiateurs qui ne chauffent plus, pompes à chaleur défaillantes — les besoins en chauffage sont critiques, surtout en hiver. GoServi vous met en relation avec des clients qui ont besoin d'une intervention rapide.",
    avgRevenue: "2 800 CHF",
    jobsPerMonth: "12–18",
    urgencyRatio: "60%",
    skills: ["Dépannage chaudière gaz / mazout", "Entretien annuel chauffage", "Pompe à chaleur", "Radiateurs & plancher chauffant", "Installation chauffe-eau"],
    faqs: [
      { q: "Y a-t-il des missions en dehors de l'hiver ?", a: "Oui. Entretiens annuels, installations de pompes à chaleur et remplacement de chauffe-eaux génèrent des missions toute l'année." },
      { q: "Les clients paient-ils vraiment à l'avance ?", a: "Oui, chaque mission est prépayée par le client via Stripe. Vous intervenez en sachant que le paiement est sécurisé." },
      { q: "L'inscription est-elle vraiment gratuite ?", a: "Oui. Aucun abonnement, aucun frais d'entrée. GoServi se rémunère uniquement sur les missions réalisées (15% de commission)." },
    ],
  },
  couvreur: {
    slug: "couvreur",
    name: "Couvreur",
    icon: "🏠",
    namePlural: "couvreurs",
    description: "Trouvez des clients pour votre activité de couverture en Suisse romande.",
    longDesc: "Tuiles cassées, fuites de toiture, étanchéité défaillante — les problèmes de couverture exigent une intervention rapide pour éviter les dégâts des eaux. Rejoignez GoServi pour recevoir des demandes qualifiées.",
    avgRevenue: "2 300 CHF",
    jobsPerMonth: "10–16",
    urgencyRatio: "55%",
    skills: ["Réparation tuiles cassées", "Étanchéité toiture terrasse", "Nettoyage gouttières", "Pose de velux", "Isolation toiture"],
    faqs: [
      { q: "Les missions de couverture sont-elles saisonnières ?", a: "Les urgences (après tempêtes) sont concentrées en automne et hiver. Mais les rénovations et mises aux normes génèrent des missions toute l'année." },
      { q: "Puis-je travailler avec une équipe ?", a: "Oui, votre compte artisan est à votre nom mais vous pouvez intervenir avec vos collaborateurs." },
      { q: "GoServi propose-t-il des missions de grande envergure ?", a: "GoServi est principalement orienté urgences et petites réparations. Les gros chantiers passent généralement par des appels d'offres classiques." },
    ],
  },
  menuisier: {
    slug: "menuisier",
    name: "Menuisier",
    icon: "🔧",
    namePlural: "menuisiers",
    description: "Recevez des missions de menuiserie et de pose en Suisse romande.",
    longDesc: "Portes à réparer, parquet à poser, meubles sur mesure — les besoins en menuiserie sont variés. GoServi vous connecte avec des particuliers qui cherchent un menuisier de confiance dans leur région.",
    avgRevenue: "2 100 CHF",
    jobsPerMonth: "10–15",
    urgencyRatio: "40%",
    skills: ["Pose et réparation de portes", "Parquet & revêtement de sol", "Placards & dressing sur mesure", "Fenêtres & volets", "Mobilier & agencement"],
    faqs: [
      { q: "Les clients sur GoServi cherchent-ils principalement des urgences ?", a: "Pour la menuiserie, environ 40% des missions sont urgentes (porte bloquée, fenêtre cassée). Les 60% restants sont des travaux planifiés." },
      { q: "Puis-je refuser des missions qui ne correspondent pas à mes compétences ?", a: "Oui, vous acceptez uniquement les missions qui vous conviennent. Vous choisissez parmi les demandes qui correspondent à vos services activés." },
      { q: "Comment GoServi vérifie-t-il la qualité des artisans ?", a: "Nous vérifions votre RC, votre assurance et vos qualifications. Les clients laissent des avis après chaque mission." },
    ],
  },
  peintre: {
    slug: "peintre",
    name: "Peintre",
    icon: "🖌️",
    namePlural: "peintres",
    description: "Trouvez des missions de peinture en bâtiment en Suisse romande.",
    longDesc: "Murs à rafraîchir, appartements à rénover, façades à remettre en état — les travaux de peinture sont omniprésents. GoServi vous apporte des clients sans prospection ni démarchage.",
    avgRevenue: "1 900 CHF",
    jobsPerMonth: "8–14",
    urgencyRatio: "30%",
    skills: ["Peinture intérieure / extérieure", "Rénovation appartement", "Peinture façade", "Enduit & ragréage", "Papier peint & revêtements"],
    faqs: [
      { q: "Les missions de peinture sont-elles bien rémunérées sur GoServi ?", a: "Le tarif moyen d'une mission peinture est de 300–800 CHF pour un particulier. Les grandes rénovations peuvent atteindre plusieurs milliers." },
      { q: "Puis-je indiquer mes spécialités (façades, décoration, etc.) ?", a: "Oui, dans votre profil artisan vous pouvez préciser vos spécialités dans la description de votre entreprise." },
      { q: "Combien de temps pour être validé par GoServi ?", a: "La validation prend en général moins de 24 heures après envoi de vos documents (RC + assurance RC Pro)." },
    ],
  },
  nettoyage: {
    slug: "nettoyage",
    name: "Agent de nettoyage",
    icon: "🧹",
    namePlural: "agents de nettoyage",
    description: "Recevez des missions de nettoyage professionnel en Suisse romande.",
    longDesc: "Nettoyage après sinistre, remise en état d'appartement, nettoyage de fin de chantier — les besoins sont constants. GoServi vous apporte des clients professionnels et des particuliers exigeants.",
    avgRevenue: "1 600 CHF",
    jobsPerMonth: "12–20",
    urgencyRatio: "45%",
    skills: ["Nettoyage après sinistre (dégât des eaux)", "Remise en état appartement", "Nettoyage de fin de chantier", "Désinfection & assainissement", "Nettoyage vitres & façades"],
    faqs: [
      { q: "Faut-il du matériel spécifique pour rejoindre GoServi ?", a: "Vous devez disposer du matériel professionnel adapté à votre activité. GoServi ne fournit pas d'équipement." },
      { q: "Les clients sont-ils des particuliers ou des professionnels ?", a: "Les deux. Environ 60% sont des particuliers (après dégât des eaux, déménagement), 40% sont des professionnels (bureaux, commerces)." },
      { q: "Puis-je travailler avec plusieurs équipes ?", a: "Oui. Votre compte artisan vous permet d'accepter plusieurs missions simultanément si vous avez les ressources humaines." },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(TRADES).map((slug) => ({ metier: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ metier: string }>;
}): Promise<Metadata> {
  const { metier } = await params;
  const trade = TRADES[metier];
  if (!trade) return {};

  const title = `Devenir ${trade.name} sur GoServi — Trouvez des clients en Suisse romande`;
  const description = `Rejoignez GoServi en tant que ${trade.name.toLowerCase()} : recevez ${trade.jobsPerMonth} missions/mois, gagnez en moyenne ${trade.avgRevenue}/mois. Inscription gratuite, paiement sécurisé.`;

  return {
    title,
    description,
    keywords: [`${trade.name.toLowerCase()} suisse romande`, `trouver clients ${trade.name.toLowerCase()}`, `mission ${trade.name.toLowerCase()} lausanne`, `mission ${trade.name.toLowerCase()} genève`, `plateforme artisan ${trade.name.toLowerCase()}`],
    alternates: { canonical: `https://goservi.ch/devenir-artisan/${metier}` },
    openGraph: {
      url: `https://goservi.ch/devenir-artisan/${metier}`,
      title,
      description,
      type: "website",
    },
  };
}

export default async function DevenirArtisanMetierPage({
  params,
}: {
  params: Promise<{ metier: string }>;
}) {
  const { metier } = await params;
  const trade = TRADES[metier];
  if (!trade) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Devenir ${trade.name} sur GoServi`,
    description: trade.description,
    url: `https://goservi.ch/devenir-artisan/${metier}`,
    publisher: {
      "@type": "Organization",
      name: "GoServi",
      url: "https://goservi.ch",
    },
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
            {trade.icon} Spécialité : {trade.name}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
            Trouvez des clients<br />
            <span className="text-white/90">en tant que {trade.name.toLowerCase()}</span><br />
            en Suisse romande
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            {trade.longDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register?role=artisan"
              className="bg-white text-[#1CA7A6] font-semibold px-6 py-3 rounded-[10px] hover:bg-[#F4F7F7] transition-colors shadow-sm"
            >
              Rejoindre GoServi gratuitement →
            </Link>
            <Link
              href="/devenir-artisan"
              className="border-2 border-white/50 text-white font-medium px-6 py-3 rounded-[10px] hover:bg-white/10 transition-colors"
            >
              En savoir plus
            </Link>
          </div>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { value: trade.jobsPerMonth, label: "Missions/mois en moyenne", icon: "📋" },
            { value: trade.avgRevenue, label: "Revenus supplémentaires/mois", icon: "💶" },
            { value: trade.urgencyRatio, label: "De missions urgentes (tarif majoré)", icon: "⚡" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#F4F7F7] rounded-[12px] p-5 text-center">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-extrabold text-[#1CA7A6]">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services couverts */}
      <section className="max-w-[1200px] mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-[#1F2937] mb-6 text-center">
          Types d&apos;interventions pour les {trade.namePlural}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trade.skills.map((skill) => (
            <div key={skill} className="flex items-center gap-3 p-4 border border-[#D1E5E5] rounded-[10px] bg-white">
              <span className="w-6 h-6 rounded-full bg-[#E6F2F2] text-[#1CA7A6] flex items-center justify-center text-xs shrink-0 font-bold">✓</span>
              <p className="text-sm text-[#1F2937] font-medium">{skill}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="bg-[#F4F7F7] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-8 text-center">Comment ça fonctionne ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Inscrivez-vous", desc: "Créez votre profil artisan en 5 minutes. Nous vérifions vos documents sous 24h." },
              { step: "2", title: "Recevez des missions", desc: `Un client demande un ${trade.name.toLowerCase()} près de chez vous ? Vous êtes notifié en temps réel.` },
              { step: "3", title: "Intervenez et soyez payé", desc: "Le client prépaye. Vous intervenez. Vous êtes crédité sous 2–3 jours." },
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

      {/* FAQ */}
      <section className="max-w-[1200px] mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-[#1F2937] mb-8 text-center">
          Questions fréquentes des {trade.namePlural}
        </h2>
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          {trade.faqs.map((faq) => (
            <div key={faq.q} className="border border-[#D1E5E5] rounded-[12px] p-5">
              <p className="font-semibold text-[#1F2937] mb-2">{faq.q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Liens vers autres métiers */}
      <section className="bg-[#F4F7F7] py-10 px-4">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-sm text-center text-gray-500 mb-5">Autres métiers sur GoServi</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.values(TRADES)
              .filter((t) => t.slug !== metier)
              .map((t) => (
                <Link
                  key={t.slug}
                  href={`/devenir-artisan/${t.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D1E5E5] rounded-full text-sm text-[#1CA7A6] hover:border-[#1CA7A6] transition-colors"
                >
                  {t.icon} {t.name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-14 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-3">
            Prêt à recevoir vos premières missions ?
          </h2>
          <p className="text-gray-500 mb-6">
            Inscription gratuite. Validation en moins de 24h. Commencez à recevoir des missions {trade.name.toLowerCase()} dès demain.
          </p>
          <Link
            href="/auth/register?role=artisan"
            className="inline-flex items-center gap-2 bg-[#1CA7A6] text-white font-semibold px-8 py-3.5 rounded-[10px] hover:bg-[#178F8E] transition-colors shadow-sm text-base"
          >
            Créer mon compte {trade.name.toLowerCase()} gratuitement →
          </Link>
        </div>
      </section>
    </div>
  );
}
