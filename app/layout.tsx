import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ChatWidget } from "@/components/ui/ChatWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const APP_URL = "https://goservi.ch";
// GA Measurement ID — public (visible dans le HTML), fallback hardcodé pour garantir le chargement
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-7QSWF5BHF4";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "GoServi — Artisans urgents à Genève & Lausanne",
    template: "%s | GoServi",
  },
  description:
    "Trouvez un artisan disponible en quelques minutes. Plombiers, électriciens, serruriers — intervention rapide en Suisse romande. Artisans vérifiés, paiement sécurisé.",
  keywords: [
    "artisan urgence Genève",
    "plombier urgent Genève",
    "électricien Genève",
    "serrurier Genève",
    "artisan Lausanne",
    "artisan vérifiés Suisse",
    "intervention rapide Suisse romande",
    "GoServi",
  ],
  authors: [{ name: "GoServi SA", url: APP_URL }],
  creator: "GoServi SA",
  publisher: "GoServi SA",
  openGraph: {
    type: "website",
    locale: "fr_CH",
    url: APP_URL,
    siteName: "GoServi",
    title: "GoServi — Artisans urgents à Genève & Lausanne",
    description:
      "Trouvez un artisan disponible en quelques minutes. Plombiers, électriciens, serruriers — intervention rapide en Suisse romande.",
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "GoServi — La plateforme des artisans suisses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GoServi — Artisans urgents à Genève & Lausanne",
    description:
      "Trouvez un artisan disponible en quelques minutes. Plombiers, électriciens, serruriers — intervention rapide.",
    images: [`${APP_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
  verification: {
    other: { "msvalidate.01": "E4C02AE927F3A41014C0A6C0D8333590" },
  },
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${APP_URL}/#organization`,
      name: "GoServi",
      url: APP_URL,
      logo: {
        "@type": "ImageObject",
        url: `${APP_URL}/logo.png`,
        width: 200,
        height: 60,
      },
      email: "contact@goservi.ch",
      areaServed: {
        "@type": "State",
        name: "Suisse romande",
        containedInPlace: { "@type": "Country", name: "Suisse" },
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "contact@goservi.ch",
        contactType: "customer service",
        availableLanguage: "French",
      },
      knowsAbout: [
        "Plomberie", "Électricité", "Serrurerie", "Chauffage",
        "Peinture", "Menuiserie", "Nettoyage", "Couverture",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${APP_URL}/#website`,
      url: APP_URL,
      name: "GoServi",
      description: "Plateforme de mise en relation entre clients et artisans vérifiés en Suisse romande",
      inLanguage: "fr-CH",
      publisher: { "@id": `${APP_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${APP_URL}/trouver-artisan/{search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        {children}
        <ChatWidget />

        {/* Google Analytics GA4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `}
        </Script>
      </body>
    </html>
  );
}
