"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { logoutAction } from "@/app/actions/auth";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const CLIENT_NAV: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: "🏠" },
  { href: "/dashboard/new-job", label: "Nouvelle demande", icon: "➕" },
  { href: "/artisans", label: "Carte des artisans", icon: "🗺️" },
  { href: "/dashboard/history", label: "Historique", icon: "📋" },
  { href: "/dashboard/payments", label: "Paiements", icon: "💳" },
  { href: "/dashboard/payment-methods", label: "Mes cartes", icon: "🏦" },
  { href: "/dashboard/profile", label: "Mon profil", icon: "👤" },
];

const ARTISAN_NAV: NavItem[] = [
  { href: "/pro/dashboard", label: "Tableau de bord", icon: "🏠" },
  { href: "/pro/jobs", label: "Missions", icon: "🔧" },
  { href: "/pro/wallet", label: "Wallet", icon: "💰" },
  { href: "/pro/earnings", label: "Revenus", icon: "💶" },
  { href: "/pro/profile", label: "Mon profil", icon: "👤" },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Vue d'ensemble", icon: "📊" },
  { href: "/admin/clients", label: "Clients", icon: "👤" },
  { href: "/admin/artisans", label: "Artisans", icon: "🔧" },
  { href: "/admin/jobs", label: "Missions", icon: "📋" },
  { href: "/admin/payments", label: "Paiements", icon: "💳" },
  { href: "/admin/payouts", label: "Retraits", icon: "🏦" },
  { href: "/admin/categories", label: "Catégories", icon: "🏷️" },
  { href: "/admin/audit", label: "Journal d'audit", icon: "🔍" },
  { href: "/admin/security", label: "Sécurité", icon: "🔐" },
  { href: "/admin/settings", label: "Paramètres", icon: "⚙️" },
];

export function DashboardShell({
  children,
  fullBleed = false,
}: {
  children: React.ReactNode;
  /** Supprime le max-w et le padding du contenu principal (pour les pages plein écran comme la carte) */
  fullBleed?: boolean;
}) {
  const { user, setUser } = useAuth();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ── Session recovery ───────────────────────────────────────────────────────
  // Si Zustand a user=null (ex: logout raté qui a vidé l'état client mais pas
  // le cookie), on récupère les données depuis /api/auth/me au montage du shell.
  useEffect(() => {
    if (!user) {
      fetch("/api/auth/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (j?.success && j?.data) {
            setUser({
              id: j.data.id,
              email: j.data.email,
              role: j.data.role,
              firstName: j.data.firstName,
              lastName: j.data.lastName,
              isApproved: j.data.artisanProfile?.isApproved ?? null,
              phone: j.data.phone ?? null,
            });
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Logout via Server Action (garanti de fonctionner) ─────────────────────
  const handleLogout = () => {
    setDrawerOpen(false);
    startTransition(async () => {
      await logoutAction();
    });
  };

  const nav =
    user?.role === "ARTISAN"
      ? ARTISAN_NAV
      : user?.role === "ADMIN"
      ? ADMIN_NAV
      : CLIENT_NAV;

  // Bottom nav = first 4 items
  const bottomNav = nav.slice(0, 4);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-[#F4F7F7] flex">

      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="hidden md:flex w-56 bg-white border-r border-[#D1E5E5] flex-col shrink-0">
        {/* Logo + notification bell */}
        <div className="h-14 px-3 flex items-center justify-between border-b border-[#D1E5E5]">
          <Link href="/" aria-label="GoServi — Accueil">
            <Image
              src="/logo.png"
              alt="GoServi"
              width={460}
              height={156}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <NotificationBell align="left" />
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
          {nav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-sm transition-colors",
                  isActive
                    ? "bg-[#E6F2F2] text-[#1CA7A6] font-semibold"
                    : "text-[#1F2937] hover:bg-[#F4F7F7]"
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout ─ bouton TOUJOURS visible (même si Zustand est null) */}
        <div className="p-3 border-t border-[#D1E5E5]">
          {user && (
            <div className="mb-2">
              <p className="text-xs font-medium text-[#1F2937] truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 text-left transition-colors disabled:opacity-50"
          >
            <span>🚪</span>
            {isPending ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ───────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#D1E5E5] h-14 flex items-center justify-between px-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-[8px] hover:bg-[#F4F7F7] transition-colors"
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <Link href="/" aria-label="GoServi — Accueil">
          <Image
            src="/logo.png"
            alt="GoServi"
            width={460}
              height={156}
              className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <div className="w-9 h-9 rounded-full bg-[#1CA7A6] flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : initials}
          </div>
        </div>
      </div>

      {/* ── Mobile slide-over drawer ─────────────────────── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white flex flex-col shadow-2xl">
            {/* Drawer header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-[#D1E5E5]">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                aria-label="GoServi — Accueil"
              >
                <Image
                  src="/logo.png"
                  alt="GoServi"
                  width={460}
              height={156}
              className="h-9 w-auto object-contain"
                />
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-[8px] text-gray-400 hover:bg-[#F4F7F7]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* User card */}
            {user && (
              <div className="mx-3 mt-3 p-3 bg-[#F4F7F7] rounded-[10px] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1CA7A6] flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1F2937] truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* Drawer nav */}
            <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
              {nav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-[8px] text-sm transition-colors",
                      isActive
                        ? "bg-[#E6F2F2] text-[#1CA7A6] font-semibold"
                        : "text-[#1F2937] hover:bg-[#F4F7F7]"
                    )}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout ─ toujours visible */}
            <div className="p-3 border-t border-[#D1E5E5]">
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <span>🚪</span>
                {isPending ? "Déconnexion en cours…" : "Se déconnecter"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Main content ─────────────────────────────────── */}
      <main className={`flex-1 min-w-0 ${fullBleed ? "overflow-hidden flex flex-col" : "overflow-auto"}`}>
        {/* Spacer for mobile top bar */}
        <div className="md:hidden h-14 shrink-0" />

        {fullBleed ? (
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        ) : (
          <>
            <div className="max-w-[1000px] mx-auto px-4 py-4 md:p-6">
              {children}
            </div>
            {/* Spacer for mobile bottom nav */}
            <div className="md:hidden h-20" />
          </>
        )}
      </main>

      {/* ── Mobile bottom tab bar ────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#D1E5E5] flex">
        {bottomNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors text-center",
                isActive ? "text-[#1CA7A6]" : "text-gray-400 hover:text-[#1F2937]"
              )}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className={cn(
                "text-[10px] font-medium leading-none",
                isActive ? "text-[#1CA7A6]" : "text-gray-400"
              )}>
                {item.label.split(" ")[0]}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#1CA7A6] rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
