import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/DashboardShell";

export const metadata: Metadata = {
  title: "Carte des artisans — Trouvez un pro près de chez vous",
  description:
    "Explorez la carte interactive des artisans GoServi. Filtrez par service et par ville pour trouver le bon professionnel : plombier, électricien, serrurier et plus à Genève.",
  alternates: { canonical: "https://goservi.ch/artisans" },
  openGraph: {
    url: "https://goservi.ch/artisans",
    title: "Carte des artisans GoServi — Trouvez un pro près de chez vous",
    description:
      "Carte interactive des artisans vérifiés en Suisse romande. Filtrez par métier et par ville.",
  },
};

export default function ArtisansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // fullBleed = sidebar visible, mais pas de max-width/padding sur le contenu
  // → la carte occupe tout l'espace disponible
  return <DashboardShell fullBleed>{children}</DashboardShell>;
}
