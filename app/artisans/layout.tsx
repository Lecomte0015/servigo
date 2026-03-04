import { DashboardShell } from "@/components/layout/DashboardShell";

export default function ArtisansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // fullBleed = sidebar visible, mais pas de max-width/padding sur le contenu
  // → la carte occupe tout l'espace disponible
  return <DashboardShell fullBleed>{children}</DashboardShell>;
}
