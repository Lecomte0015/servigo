import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export const metadata = {
  title: "À propos de GoServi | Plateforme d'artisans vérifiés en Suisse",
  description:
    "Découvrez GoServi, la plateforme suisse qui met en relation les particuliers avec des artisans vérifiés — plombiers, électriciens, serruriers et bien plus.",
};

const VALEURS = [
  {
    icon: "🛡️",
    title: "Fiabilité",
    desc: "Chaque artisan est vérifié manuellement par notre équipe : RC professionnelle, assurances, qualifications. Zéro compromis.",
  },
  {
    icon: "⚡",
    title: "Rapidité",
    desc: "Intervention en moins de 30 minutes pour les urgences. Notre système de matching automatique trouve l'artisan disponible le plus proche.",
  },
  {
    icon: "🔍",
    title: "Transparence",
    desc: "Les tarifs sont affichés avant toute intervention. Pas de mauvaise surprise : vous savez exactement ce que vous payez.",
  },
  {
    icon: "🤝",
    title: "Proximité",
    desc: "Nous favorisons les artisans locaux. En choisissant GoServi, vous soutenez l'économie de votre région en Suisse.",
  },
  {
    icon: "🔒",
    title: "Sécurité",
    desc: "Paiement 100% sécurisé via Stripe. Vos données sont protégées selon la Loi fédérale sur la protection des données (LPD).",
  },
  {
    icon: "⭐",
    title: "Qualité",
    desc: "Chaque mission est évaluée par le client. Nos artisans maintiennent une note minimale pour rester sur la plateforme.",
  },
];

const STATS = [
  { value: "500+", label: "Artisans vérifiés" },
  { value: "12", label: "Cantons couverts" },
  { value: "4.9/5", label: "Note moyenne" },
  { value: "< 30min", label: "Délai d'intervention" },
];

const EQUIPE = [
  {
    initials: "GS",
    nom: "GoServi",
    role: "Fondateurs",
    desc: "Une équipe genevoise passionnée par l'artisanat et la technologie, convaincue que trouver un bon artisan ne devrait jamais être compliqué.",
  },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#E6F2F2] to-white pt-16 pb-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white border border-[#D1E5E5] text-sm font-medium px-4 py-1.5 rounded-full shadow-sm text-[#1CA7A6] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#1CA7A6] animate-pulse" />
            Plateforme suisse — Genève
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1F2937] leading-tight mb-5">
            L&apos;artisanat suisse,{" "}
            <span className="text-[#1CA7A6]">réinventé</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            GoServi est la plateforme qui connecte les particuliers et les entreprises
            aux meilleurs artisans de Suisse — vérifiés, assurés et disponibles quand vous en avez besoin.
          </p>
        </div>
      </section>

      {/* ── Notre mission ─────────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#1CA7A6] mb-3">
              Notre mission
            </p>
            <h2 className="text-3xl font-bold text-[#1F2937] mb-5 leading-tight">
              Rendre l&apos;artisanat accessible à tous
            </h2>
            <div className="flex flex-col gap-4 text-gray-500 text-sm leading-relaxed">
              <p>
                Trouver un artisan de confiance en Suisse est souvent un parcours du combattant :
                listes d&apos;attente interminables, tarifs opaques, qualité incertaine. GoServi a été
                créé pour changer ça.
              </p>
              <p>
                Notre plateforme met en relation, en quelques secondes, des particuliers avec
                des artisans qualifiés de leur région. Chaque professionnel est vérifié manuellement :
                RC professionnelle, assurances, références et qualifications contrôlées.
              </p>
              <p>
                Parce qu&apos;un bon artisan, ça se mérite — et ça ne devrait plus être une question
                de chance ou de réseau.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-[#1CA7A6] text-white font-semibold px-5 py-2.5 rounded-[10px] text-sm hover:bg-[#178F8E] transition-colors"
              >
                Trouver un artisan →
              </Link>
              <Link
                href="/devenir-artisan"
                className="inline-flex items-center gap-2 border border-[#D1E5E5] text-[#1F2937] font-semibold px-5 py-2.5 rounded-[10px] text-sm hover:bg-[#F4F7F7] transition-colors"
              >
                Rejoindre comme artisan
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="bg-[#F4F7F7] rounded-[16px] p-6 flex flex-col gap-1 border border-[#E6F2F2]"
              >
                <p className="text-3xl font-extrabold text-[#1CA7A6]">{s.value}</p>
                <p className="text-sm text-gray-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nos valeurs ───────────────────────────────────────────────────── */}
      <section className="bg-[#F4F7F7] py-16 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1CA7A6] mb-2">
              Nos valeurs
            </p>
            <h2 className="text-3xl font-bold text-[#1F2937]">
              Ce qui nous guide chaque jour
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALEURS.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-[16px] p-6 border border-[#D1E5E5] flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <span className="text-4xl">{v.icon}</span>
                <h3 className="font-bold text-[#1F2937] text-lg">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ─────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1CA7A6] mb-2">
            Le processus
          </p>
          <h2 className="text-3xl font-bold text-[#1F2937]">
            Comment fonctionne GoServi ?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", icon: "🔍", title: "Décrivez votre besoin", desc: "Choisissez le type d'intervention et décrivez le problème en quelques mots." },
            { step: "02", icon: "⚡", title: "Matching automatique", desc: "Notre algorithme sélectionne les meilleurs artisans disponibles près de chez vous." },
            { step: "03", icon: "🤝", title: "L'artisan intervient", desc: "Un professionnel vérifié se déplace à votre adresse au créneau convenu." },
            { step: "04", icon: "✅", title: "Paiement sécurisé", desc: "Vous payez uniquement une fois la mission terminée et validée. Zéro surprise." },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#E6F2F2] border-2 border-[#D1E5E5] flex items-center justify-center text-3xl">
                {s.icon}
              </div>
              <span className="text-xs font-bold text-[#1CA7A6] tracking-widest">Étape {s.step}</span>
              <h3 className="font-semibold text-[#1F2937]">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Engagement envers les artisans ────────────────────────────────── */}
      <section className="bg-[#1CA7A6] py-16 px-4">
        <div className="max-w-[900px] mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">
            Notre engagement
          </p>
          <h2 className="text-3xl font-extrabold text-white mb-5">
            Nous croyons en l&apos;artisanat suisse
          </h2>
          <p className="text-white/80 text-base leading-relaxed mb-8 max-w-2xl mx-auto">
            GoServi ne se contente pas de mettre en relation. Nous accompagnons chaque artisan
            dans le développement de son activité : visibilité, gestion des paiements, avis clients.
            Un artisan épanoui, c&apos;est un client satisfait.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/devenir-artisan"
              className="bg-white text-[#1CA7A6] font-bold px-6 py-3 rounded-[10px] hover:bg-[#F4F7F7] transition-colors text-sm"
            >
              Rejoindre GoServi en tant qu&apos;artisan →
            </Link>
            <Link
              href="/contact"
              className="border border-white/40 text-white font-semibold px-6 py-3 rounded-[10px] hover:bg-white/10 transition-colors text-sm"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer simplifié ──────────────────────────────────────────────── */}
      <section className="py-10 px-4 text-center border-t border-[#D1E5E5]">
        <p className="text-sm text-gray-500">
          Des questions ?{" "}
          <Link href="/contact" className="text-[#1CA7A6] hover:underline font-medium">
            Contactez-nous
          </Link>{" "}
          ·{" "}
          <Link href="/" className="text-[#1CA7A6] hover:underline font-medium">
            Retour à l&apos;accueil
          </Link>
        </p>
      </section>
    </div>
  );
}
