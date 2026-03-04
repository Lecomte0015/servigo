import { DashboardShell } from "@/components/layout/DashboardShell";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
