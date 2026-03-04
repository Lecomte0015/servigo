import { DashboardShell } from "@/components/layout/DashboardShell";

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
