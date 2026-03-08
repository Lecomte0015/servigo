import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export const metadata = {
  title: "Mentions légales | GoServi",
  description: "Mentions légales de GoServi — éditeur, hébergeur, propriété intellectuelle et droit applicable.",
};

const LAST_UPDATED = "8 mars 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[#E6F2F2] pb-8 mb-8 last:border-0 last:mb-0">
      <h2 className="text-xl font-bold text-[#1F2937] mb-4">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed flex flex-col gap-3">
        {children}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-gray-400 w-40 shrink-0">{label}</span>
      <span className="text-[#1F2937] font-medium">{value}</span>
    </div>
  );
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#E6F2F2] to-white pt-14 pb-10 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-[#1F2937] mb-3">Mentions légales</h1>
          <p className="text-gray-500">
            Dernière mise à jour : <span className="font-semibold">{LAST_UPDATED}</span>
          </p>
        </div>
      </section>

      {/* Contenu */}
      <main className="max-w-[860px] mx-auto px-4 py-12">

        <Section title="1. Éditeur du site">
          <p>
            Le site <strong>goservi.ch</strong> est édité par la société <strong>GoServi SA</strong>,
            société anonyme de droit suisse dont le siège social est établi à :
          </p>
          <div className="bg-[#F4F7F7] rounded-[12px] p-5 flex flex-col gap-2 border border-[#E6F2F2]">
            <Row label="Raison sociale" value="GoServi SA" />
            <Row label="Siège social" value="Rue du Rhône 14, 1204 Genève, Suisse" />
            <Row label="Forme juridique" value="Société Anonyme (SA)" />
            <Row label="Email de contact" value="contact@goservi.ch" />
            <Row label="Site web" value="https://goservi.ch" />
          </div>
        </Section>

        <Section title="2. Hébergement">
          <p>
            Le site GoServi est hébergé par la société <strong>Vercel Inc.</strong> :
          </p>
          <div className="bg-[#F4F7F7] rounded-[12px] p-5 flex flex-col gap-2 border border-[#E6F2F2]">
            <Row label="Société" value="Vercel Inc." />
            <Row label="Adresse" value="440 N Barranca Ave #4133, Covina, CA 91723, États-Unis" />
            <Row label="Site web" value="https://vercel.com" />
          </div>
          <p>
            Les données des utilisateurs sont stockées sur des serveurs sécurisés gérés par
            <strong> Supabase Inc.</strong> (base de données et fichiers) et <strong>Stripe Inc.</strong> (paiements).
          </p>
        </Section>

        <Section title="3. Propriété intellectuelle">
          <p>
            L&apos;ensemble du contenu publié sur le site goservi.ch — notamment la marque GoServi,
            le logo, les textes, les images, les graphismes, le code source et la structure du site —
            est la propriété exclusive de GoServi SA, sauf mention contraire.
          </p>
          <p>
            Toute reproduction, représentation, modification, publication ou adaptation de tout ou
            partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite
            sans l&apos;autorisation écrite préalable de GoServi SA.
          </p>
          <p>
            Les marques et logos des partenaires (Stripe, Supabase, Vercel…) sont la propriété de
            leurs titulaires respectifs.
          </p>
        </Section>

        <Section title="4. Activité de la plateforme">
          <p>
            GoServi est une plateforme de mise en relation entre des particuliers ou entreprises
            (ci-après «&nbsp;clients&nbsp;») et des artisans professionnels indépendants
            (ci-après «&nbsp;artisans&nbsp;»).
          </p>
          <p>
            GoServi SA agit en qualité d&apos;intermédiaire et <strong>ne fournit pas elle-même les
            prestations artisanales</strong>. Les artisans inscrits sur la plateforme sont des
            professionnels indépendants, responsables de leurs propres prestations, soumis aux
            obligations légales suisses applicables à leur corps de métier.
          </p>
          <p>
            Chaque artisan doit disposer d&apos;une responsabilité civile professionnelle (RC) valide
            et des assurances requises par la législation suisse. GoServi SA se réserve le droit de
            vérifier ces documents à tout moment et de suspendre ou supprimer tout profil non conforme.
          </p>
        </Section>

        <Section title="5. Limitation de responsabilité">
          <p>
            GoServi SA met tout en œuvre pour assurer l&apos;exactitude et la mise à jour des
            informations diffusées sur ce site. Toutefois, GoServi SA ne peut garantir l&apos;exactitude,
            la précision ou l&apos;exhaustivité des informations mises à disposition.
          </p>
          <p>
            GoServi SA ne saurait être tenue responsable :
          </p>
          <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
            <li>de l&apos;indisponibilité temporaire du site pour des raisons de maintenance ou techniques ;</li>
            <li>des dommages directs ou indirects causés par l&apos;utilisation du site ;</li>
            <li>de la qualité des prestations réalisées par les artisans inscrits ;</li>
            <li>des litiges survenant directement entre clients et artisans.</li>
          </ul>
          <p>
            En cas de litige entre un client et un artisan, GoServi SA peut intervenir en tant que
            médiateur à titre volontaire, sans y être légalement tenue.
          </p>
        </Section>

        <Section title="6. Paiements">
          <p>
            Les paiements sur la plateforme GoServi sont traités par <strong>Stripe Inc.</strong>,
            prestataire de services de paiement agréé. GoServi SA ne stocke à aucun moment les
            coordonnées bancaires ou numéros de carte des utilisateurs.
          </p>
          <p>
            Une commission de service est prélevée par GoServi SA sur chaque transaction réalisée.
            Cette commission est clairement indiquée avant toute validation de paiement.
          </p>
        </Section>

        <Section title="7. Liens hypertextes">
          <p>
            Le site goservi.ch peut contenir des liens vers des sites tiers. Ces liens sont fournis
            à titre informatif uniquement. GoServi SA n&apos;exerce aucun contrôle sur le contenu de
            ces sites et ne peut être tenue responsable de leur contenu ou de leurs pratiques en
            matière de protection des données personnelles.
          </p>
        </Section>

        <Section title="8. Droit applicable et juridiction">
          <p>
            Le présent site et ses mentions légales sont soumis au <strong>droit suisse</strong>.
          </p>
          <p>
            Tout litige relatif à l&apos;utilisation du site goservi.ch sera soumis à la compétence
            exclusive des <strong>tribunaux de Genève (Suisse)</strong>, sauf disposition légale
            contraire.
          </p>
          <p>
            En cas de litige de consommation, les utilisateurs domiciliés dans l&apos;Union Européenne
            peuvent également recourir à la plateforme de règlement en ligne des litiges de la
            Commission Européenne.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter à
            l&apos;adresse suivante :{" "}
            <a href="mailto:contact@goservi.ch" className="text-[#1CA7A6] hover:underline font-medium">
              contact@goservi.ch
            </a>
          </p>
        </Section>

        {/* Navigation */}
        <div className="mt-10 pt-8 border-t border-[#E6F2F2] flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-[#1CA7A6] hover:underline">← Retour à l&apos;accueil</Link>
          <Link href="/confidentialite" className="text-[#1CA7A6] hover:underline">Politique de confidentialité</Link>
          <Link href="/contact" className="text-[#1CA7A6] hover:underline">Nous contacter</Link>
        </div>
      </main>
    </div>
  );
}
