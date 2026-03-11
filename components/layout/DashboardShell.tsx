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
  icon: React.ReactNode;
}

// ── SVG icons (Heroicons-style, 20×20, stroke-based) ─────────────────────────

const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const IconMap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

const IconClipboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);

const IconCreditCard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const IconBank = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="22" x2="21" y2="22" />
    <line x1="6" y1="18" x2="6" y2="11" />
    <line x1="10" y1="18" x2="10" y2="11" />
    <line x1="14" y1="18" x2="14" y2="11" />
    <line x1="18" y1="18" x2="18" y2="11" />
    <polygon points="12 2 20 7 4 7 12 2" />
  </svg>
);

const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconWrench = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const IconWallet = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <circle cx="16.5" cy="13" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const IconTrendingUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconBarChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);

const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconTag = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

const CLIENT_NAV: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: <IconHome /> },
  { href: "/dashboard/new-job", label: "Nouvelle demande", icon: <IconPlus /> },
  { href: "/artisans", label: "Carte des artisans", icon: <IconMap /> },
  { href: "/dashboard/history", label: "Historique", icon: <IconClipboard /> },
  { href: "/dashboard/payments", label: "Paiements", icon: <IconCreditCard /> },
  { href: "/dashboard/payment-methods", label: "Mes cartes", icon: <IconBank /> },
  { href: "/dashboard/profile", label: "Mon profil", icon: <IconUser /> },
];

const ARTISAN_NAV: NavItem[] = [
  { href: "/pro/dashboard", label: "Tableau de bord", icon: <IconHome /> },
  { href: "/pro/jobs", label: "Missions", icon: <IconWrench /> },
  { href: "/pro/wallet", label: "Wallet", icon: <IconWallet /> },
  { href: "/pro/earnings", label: "Revenus", icon: <IconTrendingUp /> },
  { href: "/pro/profile", label: "Mon profil", icon: <IconUser /> },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Vue d'ensemble", icon: <IconBarChart /> },
  { href: "/admin/clients", label: "Clients", icon: <IconUsers /> },
  { href: "/admin/artisans", label: "Artisans", icon: <IconWrench /> },
  { href: "/admin/jobs", label: "Missions", icon: <IconClipboard /> },
  { href: "/admin/payments", label: "Paiements", icon: <IconCreditCard /> },
  { href: "/admin/payouts", label: "Retraits", icon: <IconBank /> },
  { href: "/admin/categories", label: "Catégories", icon: <IconTag /> },
  { href: "/admin/audit", label: "Journal d'audit", icon: <IconSearch /> },
  { href: "/admin/security", label: "Sécurité", icon: <IconLock /> },
  { href: "/admin/settings", label: "Paramètres", icon: <IconSettings /> },
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
              avatarUrl: j.data.avatarUrl ?? null,
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
                <span className="shrink-0 flex">{item.icon}</span>
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
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 text-left transition-colors disabled:opacity-50"
          >
            <IconLogout />
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
                    <span className="shrink-0 flex">{item.icon}</span>
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
                <IconLogout />
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
              <span className="shrink-0 flex">{item.icon}</span>
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
