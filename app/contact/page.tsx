import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export const metadata = {
  title: "Contact | GoServi",
  description:
    "Contactez l'équipe GoServi pour toute question concernant notre plateforme d'artisans vérifiés en Suisse.",
};

const TOPICS = [
  {
    icon: "👤",
    title: "Vous êtes client",
    desc: "Problème avec une mission, question sur un paiement, besoin d'aide pour créer votre demande.",
    email: "contact@goservi.ch",
    subject: "Support client",
  },
  {
    icon: "🔧",
    title: "Vous êtes artisan",
    desc: "Questions sur votre compte, votre profil, les paiements ou pour rejoindre la plateforme.",
    email: "contact@goservi.ch",
    subject: "Espace artisan",
  },
  {
    icon: "🤝",
    title: "Partenariats",
    desc: "Entreprises, collectivités, assurances — explorons ensemble une collaboration.",
    email: "contact@goservi.ch",
    subject: "Partenariat",
  },
  {
    icon: "📰",
    title: "Presse & médias",
    desc: "Demandes d'interview, dossier de presse, informations pour les journalistes.",
    email: "contact@goservi.ch",
    subject: "Presse",
  },
];

const FAQ = [
  {
    q: "Dans quel délai vais-je recevoir une réponse ?",
    a: "Notre équipe répond dans les 24 heures ouvrées, généralement beaucoup plus vite. Pour les urgences, précisez-le dans l'objet de votre email.",
  },
  {
    q: "J'ai un problème urgent avec une mission en cours, que faire ?",
    a: "Connectez-vous à votre espace et utilisez la messagerie intégrée pour contacter l'artisan directement. Si le problème persiste, écrivez-nous avec \"URGENT\" en objet.",
  },
  {
    q: "Je suis artisan et je veux rejoindre GoServi, comment faire ?",
    a: "Rendez-vous sur la page \"Devenir artisan\", remplissez le formulaire d'inscription et téléchargez vos documents. Notre équipe examine chaque candidature sous 48h.",
  },
  {
    q: "Comment signaler un problème avec un artisan ?",
    a: "Via la messagerie de votre espace client, ou par email en nous précisant le numéro de mission. Nous traitons chaque signalement avec la plus grande attention.",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#E6F2F2] to-white pt-16 pb-12 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-[#1F2937] mb-3">
            Contactez-nous
          </h1>
          <p className="text-gray-500 text-lg">
            Une question, un problème ou une idée ? Notre équipe est là pour vous.
            <br />
            Réponse garantie sous <span className="font-semibold text-[#1CA7A6]">24 heures ouvrées</span>.
          </p>
        </div>
      </section>

      {/* ── Contact principal ─────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4 py-10">

        {/* Email principal mis en avant */}
        <div className="bg-[#1CA7A6] rounded-[20px] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
          <div className="text-center sm:text-left">
            <p className="text-white/70 text-sm font-medium mb-1">Notre adresse email principale</p>
            <p className="text-white text-2xl font-extrabold tracking-tight">
              contact@goservi.ch
            </p>
            <p className="text-white/60 text-sm mt-1">
              Disponible du lundi au vendredi, 8h–18h (heure de Genève)
            </p>
          </div>
          <a
            href="mailto:contact@goservi.ch"
            className="shrink-0 bg-white text-[#1CA7A6] font-bold px-6 py-3 rounded-[12px] hover:bg-[#F4F7F7] transition-colors text-sm"
          >
            Envoyer un email →
          </a>
        </div>

        {/* Grille thématique */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {TOPICS.map((t) => (
            <a
              key={t.title}
              href={`mailto:${t.email}?subject=${encodeURIComponent(t.subject + " — GoServi")}`}
              className="group bg-white border border-[#D1E5E5] rounded-[16px] p-5 flex flex-col gap-3 hover:border-[#1CA7A6] hover:shadow-md transition-all"
            >
              <span className="text-3xl">{t.icon}</span>
              <div>
                <h3 className="font-semibold text-[#1F2937] group-hover:text-[#1CA7A6] transition-colors">
                  {t.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t.desc}</p>
              </div>
              <span className="text-xs text-[#1CA7A6] font-semibold mt-auto group-hover:underline">
                Écrire →
              </span>
            </a>
          ))}
        </div>

        {/* Alternatives */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          <div className="bg-[#F4F7F7] rounded-[16px] p-6 flex flex-col gap-2">
            <span className="text-2xl">💬</span>
            <h3 className="font-semibold text-[#1F2937]">Messagerie intégrée</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Vous avez un compte GoServi ? Utilisez la messagerie depuis votre espace pour contacter
              directement votre artisan ou notre support.
            </p>
            <Link
              href="/auth/login"
              className="text-xs text-[#1CA7A6] font-semibold mt-2 hover:underline"
            >
              Se connecter →
            </Link>
          </div>

          <div className="bg-[#F4F7F7] rounded-[16px] p-6 flex flex-col gap-2">
            <span className="text-2xl">📍</span>
            <h3 className="font-semibold text-[#1F2937]">Adresse</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              GoServi SA<br />
              Rue du Rhône 14<br />
              1204 Genève, Suisse
            </p>
            <p className="text-xs text-gray-400 mt-1">Pas de rendez-vous en personne — contact par email uniquement.</p>
          </div>

          <div className="bg-[#F4F7F7] rounded-[16px] p-6 flex flex-col gap-2">
            <span className="text-2xl">⏱️</span>
            <h3 className="font-semibold text-[#1F2937]">Délais de réponse</h3>
            <div className="flex flex-col gap-1.5 text-sm text-gray-500 mt-1">
              <div className="flex justify-between">
                <span>Support client</span>
                <span className="font-semibold text-[#1CA7A6]">&lt; 24h</span>
              </div>
              <div className="flex justify-between">
                <span>Candidature artisan</span>
                <span className="font-semibold text-[#1CA7A6]">&lt; 48h</span>
              </div>
              <div className="flex justify-between">
                <span>Partenariats</span>
                <span className="font-semibold text-[#1CA7A6]">&lt; 72h</span>
              </div>
              <div className="flex justify-between">
                <span>Presse</span>
                <span className="font-semibold text-[#1CA7A6]">&lt; 48h</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Questions fréquentes</h2>
          <div className="flex flex-col gap-4">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="bg-white border border-[#D1E5E5] rounded-[14px] p-5"
              >
                <p className="font-semibold text-[#1F2937] mb-2">{item.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer simplifié ──────────────────────────────────────────────── */}
      <section className="py-8 px-4 text-center border-t border-[#D1E5E5] mt-6">
        <p className="text-sm text-gray-500">
          <Link href="/a-propos" className="text-[#1CA7A6] hover:underline font-medium">À propos</Link>
          {" · "}
          <Link href="/mentions-legales" className="text-[#1CA7A6] hover:underline font-medium">Mentions légales</Link>
          {" · "}
          <Link href="/confidentialite" className="text-[#1CA7A6] hover:underline font-medium">Confidentialité</Link>
        </p>
      </section>
    </div>
  );
}
