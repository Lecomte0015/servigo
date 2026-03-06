import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const ADVANTAGES = [
  { icon: "📱", title: "Missions qualifiées", desc: "Recevez des demandes de clients sérieux, géolocalisés près de chez vous." },
  { icon: "💶", title: "Paiement rapide", desc: "Chaque mission est prépayée. Vous êtes réglé dès la validation par le client." },
  { icon: "📅", title: "Agenda flexible", desc: "Vous choisissez quelles missions accepter. Aucune obligation de volume." },
  { icon: "⭐", title: "Réputation en ligne", desc: "Vos avis clients s'accumulent et vous permettent d'obtenir plus de missions." },
  { icon: "🛡️", title: "Accompagnement", desc: "Notre équipe vous accompagne en cas de litige ou de problème sur une mission." },
  { icon: "📈", title: "+2 000 CHF/mois", desc: "Nos artisans actifs génèrent en moyenne 2 000 CHF de revenus supplémentaires par mois." },
];

const REQUIREMENTS = [
  "Numéro RC valide (Registre du Commerce suisse)",
  "Assurance responsabilité civile professionnelle",
  "Minimum 2 ans d'expérience dans votre domaine",
  "Smartphone pour recevoir les missions",
];

export default function DevenirArtisanPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1CA7A6] to-[#178F8E] text-white pt-14 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full mb-4">
            🏆 Réseau de +500 artisans à Genève
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
            Développez votre activité<br />avec GoServi
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Rejoignez notre réseau d&apos;artisans vérifiés. Recevez des missions qualifiées, gérez votre agenda librement et soyez payé rapidement.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/register?role=artisan"
              className="bg-white text-[#1CA7A6] font-semibold px-6 py-3 rounded-[10px] hover:bg-[#F4F7F7] transition-colors shadow-sm"
            >
              Rejoindre le réseau →
            </Link>
            <Link
              href="/comment-ca-marche"
              className="border-2 border-white/50 text-white font-medium px-6 py-3 rounded-[10px] hover:bg-white/10 transition-colors"
            >
              Comment ça marche ?
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { value: "500+", label: "Artisans actifs" },
            { value: "+2 000 CHF", label: "Revenus/mois en moyenne" },
            { value: "4.9/5", label: "Note moyenne artisans" },
            { value: "< 24h", label: "Délai d'approbation" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#F4F7F7] rounded-[12px] p-5 text-center">
              <p className="text-2xl font-extrabold text-[#1CA7A6]">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Advantages */}
      <section className="max-w-[1200px] mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-[#1F2937] mb-8 text-center">Pourquoi rejoindre GoServi ?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ADVANTAGES.map((a) => (
            <div key={a.title} className="flex gap-4 p-5 border border-[#D1E5E5] rounded-[12px] hover:border-[#1CA7A6] transition-colors">
              <span className="text-3xl shrink-0">{a.icon}</span>
              <div>
                <p className="font-semibold text-[#1F2937]">{a.title}</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Requirements */}
      <section className="bg-[#F4F7F7] py-12 px-4">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-[#1F2937] mb-2 text-center">Conditions d&apos;adhésion</h2>
          <p className="text-sm text-gray-500 text-center mb-6">Pour garantir la qualité du réseau, nous vérifions chaque candidature.</p>
          <div className="flex flex-col gap-3">
            {REQUIREMENTS.map((r) => (
              <div key={r} className="flex items-start gap-3 bg-white p-4 rounded-[10px] border border-[#D1E5E5]">
                <span className="w-5 h-5 rounded-full bg-[#1CA7A6] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <p className="text-sm text-[#1F2937]">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-14 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-3">Prêt à rejoindre le réseau ?</h2>
          <p className="text-gray-500 mb-6">L&apos;inscription est gratuite. Vous commencez à recevoir des missions dès votre validation.</p>
          <Link
            href="/auth/register?role=artisan"
            className="inline-flex items-center gap-2 bg-[#1CA7A6] text-white font-semibold px-8 py-3.5 rounded-[10px] hover:bg-[#178F8E] transition-colors shadow-sm text-base"
          >
            Créer mon compte artisan gratuitement →
          </Link>
        </div>
      </section>
    </div>
  );
}
