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
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} antialiased`}>
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
