import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { getSiteSettings } from "@/lib/site-settings";
import ReactMarkdown from "react-markdown";

export const revalidate = 60;

export const metadata = {
  title: "Politique de confidentialité | GoServi",
  description:
    "Politique de confidentialité de GoServi — collecte, traitement et protection de vos données personnelles conformément à la LPD suisse.",
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

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#F4F7F7] rounded-[12px] p-5 border border-[#E6F2F2] flex flex-col gap-2">
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-gray-400 w-52 shrink-0">{label}</span>
      <span className="text-[#1F2937] font-medium">{value}</span>
    </div>
  );
}

function StaticContent() {
  return (
    <>
      <Section title="1. Responsable du traitement">
        <p>Le responsable du traitement des données personnelles collectées sur <strong>goservi.ch</strong> est :</p>
        <InfoBox>
          <Row label="Raison sociale" value="GoServi SA" />
          <Row label="Siège social" value="Rue du Rhône 14, 1204 Genève, Suisse" />
          <Row label="Email de contact" value="contact@goservi.ch" />
          <Row label="Délégué à la protection" value="contact@goservi.ch" />
        </InfoBox>
      </Section>

      <Section title="2. Données collectées">
        <p>Nous collectons uniquement les données strictement nécessaires au bon fonctionnement de la plateforme :</p>
        <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
          <li>Prénom, nom, email, téléphone, adresse (identification)</li>
          <li>Raison sociale, assurances, certifications (artisans)</li>
          <li>Historique des missions, messages, évaluations</li>
          <li>Données de navigation (IP anonymisée, cookies techniques)</li>
        </ul>
      </Section>

      <Section title="3. Finalités du traitement">
        <p>Vos données sont utilisées pour la gestion de votre compte, la mise en relation clients/artisans, le traitement des paiements, et la sécurisation de la plateforme.</p>
      </Section>

      <Section title="4. Vos droits">
        <p>
          Conformément à la LPD suisse et au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
          d&apos;effacement, de portabilité et d&apos;opposition. Pour exercer ces droits, contactez :
        </p>
        <p>
          <a href="mailto:contact@goservi.ch" className="text-[#1CA7A6] hover:underline font-medium">
            contact@goservi.ch
          </a>
        </p>
      </Section>

      <Section title="5. Sécurité">
        <p>
          GoServi met en œuvre des mesures techniques adaptées : chiffrement AES-256-GCM, HTTPS/TLS,
          cookies HttpOnly, hashage des mots de passe, paiements certifiés PCI-DSS via Stripe.
        </p>
      </Section>

      <Section title="6. Contact">
        <p>
          Pour toute question relative à cette politique :{" "}
          <a href="mailto:contact@goservi.ch" className="text-[#1CA7A6] hover:underline font-medium">
            contact@goservi.ch
          </a>
        </p>
      </Section>
    </>
  );
}

export default async function ConfidentialitePage() {
  const settings = await getSiteSettings();
  const mdContent = settings.legalPages?.confidentialite ?? "";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#E6F2F2] to-white pt-14 pb-10 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-[#1F2937] mb-3">
            Politique de confidentialité
          </h1>
          <p className="text-gray-500">
            Dernière mise à jour : <span className="font-semibold">{LAST_UPDATED}</span>
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Conforme à la <strong>LPD suisse</strong> et au <strong>RGPD</strong>.
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
          <Link href="/mentions-legales" className="text-[#1CA7A6] hover:underline">Mentions légales</Link>
          <Link href="/contact" className="text-[#1CA7A6] hover:underline">Nous contacter</Link>
        </div>
      </main>
    </div>
  );
}
