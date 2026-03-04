import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ServiGo — Artisans urgents à Lausanne",
  description:
    "Trouvez un artisan disponible en quelques minutes. Plombiers, électriciens, serruriers — intervention rapide à Lausanne.",
  keywords: "artisan urgence Lausanne, plombier urgent, électricien, serrurier",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
