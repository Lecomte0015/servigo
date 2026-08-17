import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import {
  IconSmartphone, IconEuro, IconCalendar, IconStar, IconShieldCheck,
  IconTrendingUp, IconDroplet, IconZap, IconLock, IconFlame,
  IconHome, IconHammer, IconPaintbrush, IconSparkles, IconAward, StarRating,
} from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Devenir artisan GoServi — Développez votre activité en Suisse romande",
  description:
    "Rejoignez GoServi et recevez des missions qualifiées près de chez vous. Plombier, électricien, serrurier — inscription gratuite, paiement sécurisé, 0 abonnement.",
  alternates: { canonical: "https://goservi.ch/devenir-artisan" },
  openGraph: {
    url: "https://goservi.ch/devenir-artisan",
    title: "Devenir artisan GoServi | Développez votre activité",
    description:
      "Recevez des missions qualifiées en Suisse romande. Commission 15% uniquement sur mission réalisée. Inscription gratuite.",
  },
};

const ADVANTAGES = [
  { icon: <IconSmartphone size={24} />, title: "Missions qualifiées", desc: "Des clients sérieux, géolocalisés près de chez vous. Chaque demande est filtrée et payée d'avance." },
  { icon: <IconEuro size={24} />, title: "Paiement garanti", desc: "Le client paie avant l'intervention. Vous recevez votre argent dans les 48h après validation de la mission." },
  { icon: <IconCalendar size={24} />, title: "100% flexible", desc: "Activez ou désactivez vos disponibilités en un clic. Aucun volume minimum, aucune obligation." },
  { icon: <IconStar size={24} />, title: "Réputation digitale", desc: "Vos avis clients s'accumulent sur votre profil. Plus d'avis = plus de missions = plus de revenus." },
  { icon: <IconShieldCheck size={24} />, title: "0 frais cachés", desc: "Pas d'abonnement, pas de frais fixes. GoServi prélève 15% uniquement sur les missions réalisées." },
  { icon: <IconTrendingUp size={24} />, title: "+2 000 CHF/mois", desc: "Nos artisans actifs génèrent en moyenne 2 000 CHF de revenus complémentaires par mois." },
];

const STEPS = [
  {
    num: "1",
    title: "Créez votre profil",
    desc: "Inscrivez-vous en 5 minutes. Renseignez votre métier, votre zone d'intervention et téléchargez votre assurance RC Pro.",
  },
  {
    num: "2",
    title: "Validation sous 24h",
    desc: "Notre équipe vérifie votre dossier et active votre compte. Vous recevez un email de confirmation.",
  },
  {
    num: "3",
    title: "Recevez vos premières missions",
    desc: "Dès votre validation, GoServi vous envoie des demandes en temps réel. Acceptez celles qui vous conviennent.",
  },
];

const TESTIMONIALS = [
  {
    name: "Marc D.",
    trade: "Plombier indépendant, Genève",
    quote:
      "En 3 mois, GoServi représente 40% de mon chiffre d'affaires. Les clients sont sérieux et le paiement est toujours là. Je regrette de ne pas avoir rejoint plus tôt.",
    rating: 5,
  },
  {
    name: "Karim B.",
    trade: "Électricien, Lausanne",
    quote:
      "Ce qui m'a convaincu : aucun abonnement mensuel. Je paye seulement quand je travaille. Et les missions d'urgence le soir et le week-end, ça rapporte vraiment bien.",
    rating: 5,
  },
  {
    name: "Florian M.",
    trade: "Serrurier, Fribourg",
    quote:
      "L'appli est simple, les clients sont prévenus du tarif avant d'appeler. Moins de négociations inutiles, plus de missions concrètes.",
    rating: 5,
  },
];

const FAQS = [
  {
    q: "Combien coûte l'inscription ?",
    a: "L'inscription est entièrement gratuite. GoServi prélève une commission de 15% uniquement sur les missions réalisées et payées. Aucun abonnement, aucun frais fixe.",
  },
  {
    q: "Quels documents dois-je fournir ?",
    a: "Vous devez fournir votre assurance RC Pro valide et votre numéro au Registre du Commerce suisse (ou équivalent). C'est tout.",
  },
  {
    q: "Dans quelles villes GoServi opère-t-il ?",
    a: "Genève, Lausanne, Fribourg, Neuchâtel, Sion, Nyon, Montreux, Yverdon, Morges, Bienne, Martigny et La Chaux-de-Fonds. D'autres villes arrivent prochainement.",
  },
  {
    q: "Suis-je obligé d'accepter toutes les missions ?",
    a: "Non. Chaque mission vous est proposée et vous êtes libre d'accepter ou de refuser. Vous contrôlez entièrement votre agenda.",
  },
  {
    q: "Quand est-ce que je reçois mon argent ?",
    a: "Le paiement est sécurisé dès la création de la mission. Dès que le client valide la fin de l'intervention, GoServi déclenche le virement. Vous recevez l'argent sous 24-48h ouvrés.",
  },
  {
    q: "Que se passe-t-il en cas de litige avec un client ?",
    a: "Notre équipe intervient comme médiateur. Nous protégeons les artisans autant que les clients et tranchons de manière équitable selon les preuves fournies.",
  },
];

const TRADES_LIST = [
  { slug: "plombier", Icon: IconDroplet, name: "Plombier" },
  { slug: "electricien", Icon: IconZap, name: "Électricien" },
  { slug: "serrurier", Icon: IconLock, name: "Serrurier" },
  { slug: "chauffagiste", Icon: IconFlame, name: "Chauffagiste" },
  { slug: "couvreur", Icon: IconHome, name: "Couvreur" },
  { slug: "menuisier", Icon: IconHammer, name: "Menuisier" },
  { slug: "peintre", Icon: IconPaintbrush, name: "Peintre" },
  { slug: "nettoyage", Icon: IconSparkles, name: "Nettoyage" },
];

export default function DevenirArtisanPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1CA7A6] to-[#0e7c7b] text-white pt-14 pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-5">
            <IconAward size={15} /> Réseau actif en Suisse romande · Commission 15% uniquement
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-5 leading-tight">
            Plus de clients.<br />Sans effort de prospection.
          </h1>
          <p className="text-white/85 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            GoServi vous envoie des missions qualifiées directement sur votre téléphone. Vous travaillez, on s&apos;occupe du reste.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register?role=artisan"
              className="bg-white text-[#1CA7A6] font-bold px-8 py-3.5 rounded-[10px] hover:bg-[#F4F7F7] transition-colors shadow-md text-base"
            >
              Rejoindre gratuitement →
            </Link>
            <a
              href="#comment-ca-marche"
              className="border-2 border-white/50 text-white font-medium px-6 py-3.5 rounded-[10px] hover:bg-white/10 transition-colors text-base"
            >
              Voir comment ça marche
            </a>
          </div>
          <p className="text-white/60 text-sm mt-4">Inscription gratuite · Validation sous 24h · 0 abonnement</p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-[1200px] mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { value: "500+", label: "Artisans actifs" },
            { value: "2 000 CHF", label: "Revenus moyens/mois" },
            { value: "4.9/5", label: "Note artisans" },
            { value: "< 24h", label: "Délai d'approbation" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-[14px] p-5 text-center shadow-md border border-[#E6F2F2]">
              <p className="text-2xl font-extrabold text-[#1CA7A6]">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Avantages */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-[#1F2937] mb-3 text-center">Pourquoi les artisans choisissent GoServi</h2>
        <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
          Pas de publicité à gérer, pas de clients à démarcher. Concentrez-vous sur votre métier.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ADVANTAGES.map((a) => (
            <div key={a.title} className="flex gap-4 p-5 border border-[#D1E5E5] rounded-[14px] hover:border-[#1CA7A6] hover:shadow-sm transition-all">
              <span className="text-[#1CA7A6] shrink-0 mt-0.5">{a.icon}</span>
              <div>
                <p className="font-semibold text-[#1F2937]">{a.title}</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="bg-[#F4F7F7] py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-2 text-center">Commencez en 3 étapes</h2>
          <p className="text-gray-500 text-center mb-10">De l&apos;inscription à votre première mission en moins de 24h.</p>
          <div className="flex flex-col gap-6">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex gap-5 items-start">
                <div className="w-12 h-12 rounded-full bg-[#1CA7A6] text-white font-bold text-lg flex items-center justify-center shrink-0">
                  {s.num}
                </div>
                <div className="flex-1 pt-2">
                  <p className="font-semibold text-[#1F2937] text-base">{s.title}</p>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="absolute ml-6 mt-12 w-0.5 h-6 bg-[#D1E5E5]" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/auth/register?role=artisan"
              className="inline-flex items-center gap-2 bg-[#1CA7A6] text-white font-semibold px-8 py-3.5 rounded-[10px] hover:bg-[#178F8E] transition-colors shadow-sm"
            >
              Créer mon compte gratuitement →
            </Link>
          </div>
        </div>
      </section>

      {/* Métiers */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-[#1F2937] mb-2 text-center">Votre métier est le bienvenu</h2>
        <p className="text-gray-500 text-center mb-8">Découvrez les opportunités spécifiques à votre corps de métier.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TRADES_LIST.map((t) => (
            <Link
              key={t.slug}
              href={`/devenir-artisan/${t.slug}`}
              className="flex flex-col items-center gap-3 p-5 border border-[#D1E5E5] rounded-[14px] hover:border-[#1CA7A6] hover:shadow-sm transition-all text-center"
            >
              <span className="w-10 h-10 rounded-[10px] bg-[#E6F2F2] flex items-center justify-center text-[#1CA7A6]">
                <t.Icon size={20} />
              </span>
              <p className="font-medium text-[#1F2937] text-sm">{t.name}</p>
              <span className="text-xs text-[#1CA7A6]">Voir les missions →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Témoignages */}
      <section className="bg-[#E6F2F2] py-16 px-4">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-2 text-center">Ce que disent nos artisans</h2>
          <p className="text-gray-500 text-center mb-10">Ils ont rejoint GoServi et développé leur activité.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-[14px] p-6 shadow-sm border border-[#D1E5E5]">
                <div className="mb-3">
                  <StarRating rating={t.rating} size={16} />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-[#1F2937] text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.trade}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[800px] mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-[#1F2937] mb-2 text-center">Questions fréquentes</h2>
        <p className="text-gray-500 text-center mb-10">Tout ce que vous devez savoir avant de rejoindre GoServi.</p>
        <div className="flex flex-col gap-4">
          {FAQS.map((faq) => (
            <div key={faq.q} className="border border-[#D1E5E5] rounded-[12px] p-5">
              <p className="font-semibold text-[#1F2937] mb-2">{faq.q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gradient-to-br from-[#1CA7A6] to-[#0e7c7b] py-16 px-4 text-center text-white">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">Prêt à recevoir vos premières missions ?</h2>
          <p className="text-white/80 mb-8">
            L&apos;inscription est gratuite et prend 5 minutes. Vous pouvez recevoir votre première mission dès demain.
          </p>
          <Link
            href="/auth/register?role=artisan"
            className="inline-flex items-center gap-2 bg-white text-[#1CA7A6] font-bold px-8 py-4 rounded-[10px] hover:bg-[#F4F7F7] transition-colors shadow-md text-base"
          >
            Rejoindre GoServi gratuitement →
          </Link>
          <p className="text-white/60 text-sm mt-4">Sans carte bancaire · Sans engagement · Validation sous 24h</p>
        </div>
      </section>
    </div>
  );
}
