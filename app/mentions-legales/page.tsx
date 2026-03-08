import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { getSiteSettings } from "@/lib/site-settings";
import ReactMarkdown from "react-markdown";

export const revalidate = 60;

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

// Contenu statique de secours (affiché si l'admin n'a pas encore renseigné le markdown)
function StaticContent() {
  return (
    <>
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
        <p>Le site GoServi est hébergé par la société <strong>Vercel Inc.</strong> :</p>
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
          partie des éléments du site est interdite sans l&apos;autorisation écrite préalable de GoServi SA.
        </p>
      </Section>

      <Section title="4. Activité de la plateforme">
        <p>
          GoServi est une plateforme de mise en relation entre des particuliers ou entreprises
          et des artisans professionnels indépendants.
        </p>
        <p>
          GoServi SA agit en qualité d&apos;intermédiaire et <strong>ne fournit pas elle-même les
          prestations artisanales</strong>. Les artisans inscrits sont des professionnels indépendants,
          responsables de leurs propres prestations.
        </p>
      </Section>

      <Section title="5. Limitation de responsabilité">
        <p>GoServi SA ne saurait être tenue responsable :</p>
        <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
          <li>de l&apos;indisponibilité temporaire du site pour des raisons de maintenance ou techniques ;</li>
          <li>des dommages directs ou indirects causés par l&apos;utilisation du site ;</li>
          <li>de la qualité des prestations réalisées par les artisans inscrits ;</li>
          <li>des litiges survenant directement entre clients et artisans.</li>
        </ul>
      </Section>

      <Section title="6. Paiements">
        <p>
          Les paiements sont traités par <strong>Stripe Inc.</strong>, prestataire de services de paiement
          agréé. GoServi SA ne stocke à aucun moment les coordonnées bancaires des utilisateurs.
        </p>
      </Section>

      <Section title="7. Droit applicable et juridiction">
        <p>Le présent site est soumis au <strong>droit suisse</strong>.</p>
        <p>
          Tout litige sera soumis à la compétence exclusive des{" "}
          <strong>tribunaux de Genève (Suisse)</strong>.
        </p>
      </Section>

      <Section title="8. Contact">
        <p>
          Pour toute question :{" "}
          <a href="mailto:contact@goservi.ch" className="text-[#1CA7A6] hover:underline font-medium">
            contact@goservi.ch
          </a>
        </p>
      </Section>
    </>
  );
}

export default async function MentionsLegalesPage() {
  const settings = await getSiteSettings();
  const mdContent = settings.legalPages?.mentionsLegales ?? "";

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
        {mdContent.trim() ? (
          // Contenu markdown édité par l'admin
          <div className="prose prose-sm prose-gray max-w-none
            prose-headings:text-[#1F2937] prose-headings:font-bold
            prose-h1:text-3xl prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
            prose-p:text-gray-600 prose-p:leading-relaxed
            prose-a:text-[#1CA7A6] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-[#1F2937]
            prose-ul:text-gray-600 prose-li:my-1
            prose-hr:border-[#E6F2F2]">
            <ReactMarkdown>{mdContent}</ReactMarkdown>
          </div>
        ) : (
          // Contenu statique de secours
          <StaticContent />
        )}

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
