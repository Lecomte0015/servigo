import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const CLIENT_STEPS = [
  { n: "01", icon: "📝", title: "Décrivez votre besoin", desc: "Choisissez le type d'intervention, décrivez le problème et renseignez votre adresse en 30 secondes." },
  { n: "02", icon: "🔔", title: "Un artisan vous répond", desc: "Notre algorithme contacte les 5 meilleurs artisans disponibles près de chez vous. Le premier à accepter est assigné." },
  { n: "03", icon: "🔧", title: "L'artisan intervient", desc: "L'artisan se déplace à votre domicile. Vous êtes notifié en temps réel à chaque étape." },
  { n: "04", icon: "✅", title: "Vous validez et payez", desc: "Une fois la mission terminée, vous confirmez et le paiement est capturé. Simple et sécurisé." },
];

const ARTISAN_STEPS = [
  { n: "01", icon: "✍️", title: "Créez votre compte", desc: "Renseignez vos informations professionnelles (RC, assurances, services proposés)." },
  { n: "02", icon: "🔍", title: "Validation par notre équipe", desc: "Nous vérifions votre dossier sous 24h ouvrées. Une fois approuvé, vous recevez des missions." },
  { n: "03", icon: "📱", title: "Acceptez des missions", desc: "Recevez des notifications en temps réel. Acceptez les missions qui vous correspondent." },
  { n: "04", icon: "💶", title: "Soyez payé rapidement", desc: "Le paiement est viré sur votre compte après chaque mission complétée. Pas de paperasse." },
];

const FAQS = [
  { q: "Combien coûte le service ?", a: "ServiGo prend une commission de 10% sur chaque mission complétée. L'inscription et l'utilisation de la plateforme sont gratuites." },
  { q: "Comment les artisans sont-ils sélectionnés ?", a: "Chaque artisan passe par un processus de vérification : numéro RC, assurance responsabilité civile, et entretien avec notre équipe." },
  { q: "Que se passe-t-il si je ne suis pas satisfait ?", a: "Notre équipe support est disponible 7j/7. En cas de litige, nous faisons office de médiateur et pouvons procéder à un remboursement." },
  { q: "Puis-je annuler une mission ?", a: "Oui, tant que la mission n'a pas commencé. Aucun frais si elle est en cours de recherche d'artisan." },
  { q: "La plateforme est-elle disponible dans toute la Suisse ?", a: "Pour l'instant, ServiGo est actif à Genève et dans les communes environnantes. Nous expandons progressivement." },
];

export default function CommentCaMarchePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#E6F2F2] to-white pt-12 pb-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] mb-3">
            Comment fonctionne ServiGo ?
          </h1>
          <p className="text-gray-500 text-lg">
            Trouvez un artisan qualifié en moins de 2 minutes. Voici comment ça marche.
          </p>
        </div>
      </section>

      {/* Client steps */}
      <section className="max-w-[1200px] mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-[#1CA7A6] bg-[#E6F2F2] px-3 py-1 rounded-full uppercase tracking-wider">Pour les clients</span>
          <h2 className="text-2xl font-bold text-[#1F2937] mt-3">Trouvez un artisan en 4 étapes</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CLIENT_STEPS.map((s) => (
            <div key={s.n} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#E6F2F2] text-[#1CA7A6] text-xs font-bold flex items-center justify-center shrink-0">{s.n}</span>
                <div className="h-px flex-1 bg-[#E6F2F2]" />
              </div>
              <div className="text-3xl">{s.icon}</div>
              <h3 className="font-semibold text-[#1F2937]">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/auth/register" className="inline-flex items-center gap-2 bg-[#1CA7A6] text-white font-semibold px-6 py-3 rounded-[10px] hover:bg-[#178F8E] transition-colors shadow-sm">
            Créer une demande maintenant →
          </Link>
        </div>
      </section>

      {/* Artisan steps */}
      <section className="bg-[#F4F7F7] py-14 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-[#1CA7A6] bg-[#E6F2F2] px-3 py-1 rounded-full uppercase tracking-wider">Pour les artisans</span>
            <h2 className="text-2xl font-bold text-[#1F2937] mt-3">Développez votre activité</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ARTISAN_STEPS.map((s) => (
              <div key={s.n} className="bg-white rounded-[12px] border border-[#D1E5E5] p-5 flex flex-col gap-3">
                <div className="text-3xl">{s.icon}</div>
                <span className="text-xs font-bold text-[#1CA7A6]">ÉTAPE {s.n}</span>
                <h3 className="font-semibold text-[#1F2937]">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/devenir-artisan" className="inline-flex items-center gap-2 border-2 border-[#1CA7A6] text-[#1CA7A6] font-semibold px-6 py-3 rounded-[10px] hover:bg-[#E6F2F2] transition-colors">
              Rejoindre le réseau →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[800px] mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-[#1F2937] mb-8 text-center">Questions fréquentes</h2>
        <div className="flex flex-col gap-4">
          {FAQS.map((faq) => (
            <div key={faq.q} className="border border-[#D1E5E5] rounded-[12px] p-5">
              <p className="font-semibold text-[#1F2937] mb-1">{faq.q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
