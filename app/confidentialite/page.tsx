import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

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

export default function ConfidentialitePage() {
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
            GoServi SA s&apos;engage à protéger vos données personnelles conformément à la{" "}
            <strong>Loi fédérale suisse sur la protection des données (LPD)</strong> et au{" "}
            <strong>Règlement général sur la protection des données (RGPD)</strong> pour les
            utilisateurs de l&apos;Union Européenne.
          </p>
        </div>
      </section>

      {/* Contenu */}
      <main className="max-w-[860px] mx-auto px-4 py-12">

        <Section title="1. Responsable du traitement">
          <p>
            Le responsable du traitement des données personnelles collectées sur le site{" "}
            <strong>goservi.ch</strong> est :
          </p>
          <InfoBox>
            <Row label="Raison sociale" value="GoServi SA" />
            <Row label="Siège social" value="Rue du Rhône 14, 1204 Genève, Suisse" />
            <Row label="Email de contact" value="contact@goservi.ch" />
            <Row label="Délégué à la protection" value="contact@goservi.ch" />
          </InfoBox>
        </Section>

        <Section title="2. Données collectées">
          <p>
            Nous collectons uniquement les données strictement nécessaires au bon fonctionnement
            de la plateforme. Selon votre usage, les données suivantes peuvent être traitées :
          </p>

          <div>
            <p className="font-semibold text-[#1F2937] mb-2">Données d&apos;identification</p>
            <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
              <li>Prénom, nom de famille</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone (optionnel)</li>
              <li>Adresse postale (pour les missions à domicile)</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-[#1F2937] mb-2">Données professionnelles (artisans)</p>
            <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
              <li>Raison sociale, numéro IDE</li>
              <li>Assurances et certifications professionnelles</li>
              <li>Photo de profil, description de l&apos;activité</li>
              <li>Coordonnées bancaires (IBAN pour les virements — chiffrées)</li>
              <li>Zone d&apos;intervention et tarifs</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-[#1F2937] mb-2">Données de navigation</p>
            <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
              <li>Adresse IP (anonymisée après traitement)</li>
              <li>Type de navigateur et système d&apos;exploitation</li>
              <li>Pages visitées, heure et date de connexion</li>
              <li>Cookies techniques nécessaires au fonctionnement</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-[#1F2937] mb-2">Données transactionnelles</p>
            <ul className="list-disc list-inside flex flex-col gap-1 pl-2">
              <li>Historique des missions et devis</li>
              <li>Évaluations et avis laissés</li>
              <li>Messages échangés via la messagerie intégrée</li>
              <li>Informations de paiement (gérées exclusivement par Stripe — non stockées chez GoServi)</li>
            </ul>
          </div>
        </Section>

        <Section title="3. Finalités du traitement">
          <p>
            Vos données sont collectées et traitées pour les finalités suivantes :
          </p>
          <div className="flex flex-col gap-3">
            {[
              {
                base: "Exécution du contrat",
                desc: "Création et gestion de votre compte, mise en relation clients/artisans, traitement des paiements, envoi de notifications liées à vos missions.",
              },
              {
                base: "Intérêt légitime",
                desc: "Sécurisation de la plateforme, prévention des fraudes, amélioration de nos services, statistiques d'utilisation anonymisées.",
              },
              {
                base: "Obligation légale",
                desc: "Conservation des données comptables et fiscales, réponse aux réquisitions légales des autorités suisses compétentes.",
              },
              {
                base: "Consentement",
                desc: "Envoi d'emails marketing et newsletters (uniquement si vous avez coché la case correspondante lors de l'inscription).",
              },
            ].map((item) => (
              <div key={item.base} className="bg-[#F4F7F7] rounded-[10px] p-4 border border-[#E6F2F2]">
                <p className="font-semibold text-[#1CA7A6] text-xs uppercase tracking-wide mb-1">
                  Base légale : {item.base}
                </p>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="4. Sous-traitants et transferts de données">
          <p>
            GoServi SA fait appel à des sous-traitants de confiance pour assurer certaines
            fonctionnalités. Ces partenaires traitent vos données uniquement sur instruction de
            GoServi SA et dans le cadre de contrats de traitement conformes à la LPD/RGPD :
          </p>
          <InfoBox>
            <Row label="Hébergement & base de données" value="Supabase Inc. (États-Unis — Standard Contractual Clauses)" />
            <Row label="Déploiement & CDN" value="Vercel Inc. (États-Unis — Standard Contractual Clauses)" />
            <Row label="Paiements" value="Stripe Inc. (États-Unis — certifié PCI-DSS niveau 1)" />
            <Row label="Emails transactionnels" value="Resend Inc. (États-Unis — Standard Contractual Clauses)" />
          </InfoBox>
          <p>
            Certains sous-traitants sont établis hors de Suisse ou de l&apos;Espace Économique
            Européen. Dans ce cas, les transferts sont encadrés par des{" "}
            <strong>clauses contractuelles types (CCT)</strong> approuvées par la Commission
            Européenne, offrant un niveau de protection adéquat.
          </p>
        </Section>

        <Section title="5. Durée de conservation">
          <p>
            Vos données sont conservées pendant la durée strictement nécessaire aux finalités
            pour lesquelles elles ont été collectées :
          </p>
          <InfoBox>
            <Row label="Données de compte actif" value="Durée de la relation contractuelle" />
            <Row label="Données après suppression du compte" value="3 ans (recours légaux potentiels)" />
            <Row label="Données comptables et transactions" value="10 ans (obligation légale suisse — CO art. 958f)" />
            <Row label="Cookies techniques" value="Session ou 12 mois maximum" />
            <Row label="Logs de sécurité" value="12 mois glissants" />
            <Row label="Emails marketing" value="Jusqu'au désabonnement + 3 ans" />
          </InfoBox>
          <p>
            À l&apos;expiration de ces délais, vos données sont supprimées de façon sécurisée
            ou anonymisées.
          </p>
        </Section>

        <Section title="6. Cookies">
          <p>
            GoServi utilise des cookies strictement nécessaires au fonctionnement de la
            plateforme. Aucun cookie de traçage publicitaire tiers n&apos;est déposé sans
            votre consentement explicite.
          </p>
          <div className="flex flex-col gap-2">
            {[
              {
                name: "goservi_token",
                type: "Cookie d'authentification",
                desc: "Cookie HttpOnly sécurisé contenant votre jeton de session JWT. Nécessaire pour vous maintenir connecté.",
                duration: "Session + 7 jours",
              },
              {
                name: "Cookies de préférence",
                type: "Fonctionnel",
                desc: "Mémorise vos préférences d'affichage et de langue.",
                duration: "12 mois",
              },
            ].map((c) => (
              <div key={c.name} className="bg-[#F4F7F7] rounded-[10px] p-4 border border-[#E6F2F2]">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-[#1F2937] font-mono text-xs">{c.name}</p>
                  <span className="text-xs bg-[#E6F2F2] text-[#1CA7A6] font-semibold px-2 py-0.5 rounded-full shrink-0">
                    {c.type}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{c.desc}</p>
                <p className="text-xs text-gray-400 mt-1">Durée : {c.duration}</p>
              </div>
            ))}
          </div>
          <p>
            Vous pouvez gérer ou supprimer les cookies via les paramètres de votre navigateur.
            La désactivation des cookies nécessaires peut altérer le bon fonctionnement du site.
          </p>
        </Section>

        <Section title="7. Vos droits">
          <p>
            Conformément à la LPD suisse et au RGPD (pour les résidents de l&apos;UE), vous
            disposez des droits suivants sur vos données personnelles :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: "👁️", right: "Droit d'accès", desc: "Obtenir une copie de vos données personnelles traitées par GoServi." },
              { icon: "✏️", right: "Droit de rectification", desc: "Corriger des données inexactes ou incomplètes vous concernant." },
              { icon: "🗑️", right: "Droit à l'effacement", desc: "Demander la suppression de vos données (sous réserve des obligations légales)." },
              { icon: "⏸️", right: "Droit à la limitation", desc: "Restreindre temporairement le traitement de vos données." },
              { icon: "📦", right: "Droit à la portabilité", desc: "Recevoir vos données dans un format structuré et lisible par machine." },
              { icon: "🚫", right: "Droit d'opposition", desc: "Vous opposer au traitement fondé sur l'intérêt légitime ou à des fins de prospection." },
            ].map((r) => (
              <div key={r.right} className="bg-[#F4F7F7] rounded-[10px] p-4 border border-[#E6F2F2] flex gap-3">
                <span className="text-2xl shrink-0">{r.icon}</span>
                <div>
                  <p className="font-semibold text-[#1F2937] mb-0.5">{r.right}</p>
                  <p className="text-xs text-gray-500">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p>
            Pour exercer ces droits, adressez votre demande à{" "}
            <a href="mailto:contact@goservi.ch" className="text-[#1CA7A6] hover:underline font-medium">
              contact@goservi.ch
            </a>{" "}
            en précisant votre identité. Nous traiterons votre demande dans un délai maximum de{" "}
            <strong>30 jours</strong>.
          </p>
          <p>
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une
            réclamation auprès du{" "}
            <strong>Préposé fédéral à la protection des données et à la transparence (PFPDT)</strong>{" "}
            en Suisse, ou auprès de l&apos;autorité de contrôle de votre pays de résidence pour
            les résidents de l&apos;UE.
          </p>
        </Section>

        <Section title="8. Sécurité des données">
          <p>
            GoServi SA met en œuvre des mesures techniques et organisationnelles appropriées
            pour protéger vos données contre tout accès non autorisé, perte, altération ou
            divulgation :
          </p>
          <ul className="list-disc list-inside flex flex-col gap-1.5 pl-2">
            <li>Chiffrement des données sensibles (AES-256-GCM) en base de données</li>
            <li>Connexions chiffrées via TLS 1.3 (HTTPS sur tout le site)</li>
            <li>Authentification par cookie HttpOnly (non accessible depuis JavaScript)</li>
            <li>Hashage des mots de passe (bcrypt, facteur de coût adaptatif)</li>
            <li>Limitation du taux de requêtes (rate limiting) sur toutes les API sensibles</li>
            <li>Paiements traités exclusivement par Stripe (certifié PCI-DSS niveau 1)</li>
            <li>Journaux de sécurité (audit logs) conservés 12 mois</li>
            <li>Revues régulières des accès et des permissions</li>
          </ul>
          <p>
            En cas de violation de données susceptible d&apos;engendrer un risque pour vos droits
            et libertés, GoServi SA s&apos;engage à vous notifier et à informer les autorités
            compétentes dans les délais légaux prévus.
          </p>
        </Section>

        <Section title="9. Mineurs">
          <p>
            La plateforme GoServi est réservée aux personnes âgées de <strong>18 ans et plus</strong>.
            Nous ne collectons pas sciemment de données personnelles relatives à des mineurs.
            Si vous constatez qu&apos;un mineur a créé un compte sur notre plateforme, veuillez
            nous contacter immédiatement à{" "}
            <a href="mailto:contact@goservi.ch" className="text-[#1CA7A6] hover:underline font-medium">
              contact@goservi.ch
            </a>{" "}
            afin que nous puissions supprimer le compte concerné.
          </p>
        </Section>

        <Section title="10. Modifications de la présente politique">
          <p>
            GoServi SA se réserve le droit de modifier la présente politique de confidentialité
            à tout moment, notamment pour se conformer à l&apos;évolution de la législation ou
            de nos pratiques.
          </p>
          <p>
            En cas de modification substantielle, nous vous en informerons par email ou par une
            notification visible sur la plateforme. La date de la dernière mise à jour est
            indiquée en haut de cette page.
          </p>
          <p>
            En continuant à utiliser GoServi après la publication des modifications, vous
            acceptez la politique révisée.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Pour toute question relative à la présente politique ou pour exercer vos droits,
            contactez notre délégué à la protection des données :
          </p>
          <InfoBox>
            <Row label="Email" value="contact@goservi.ch" />
            <Row label="Courrier" value="GoServi SA — DPO, Rue du Rhône 14, 1204 Genève, Suisse" />
            <Row label="Délai de réponse" value="30 jours maximum" />
          </InfoBox>
        </Section>

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
