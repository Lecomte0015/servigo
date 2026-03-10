"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = [
  { label: "Tous les services", href: "/services" },
  { label: "Comment ça marche", href: "/comment-ca-marche" },
  { label: "Devenir artisan", href: "/devenir-artisan" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardHref =
    user?.role === "ARTISAN"
      ? "/pro/dashboard"
      : user?.role === "ADMIN"
      ? "/admin"
      : "/dashboard";

  return (
    <header className="bg-white border-b border-[#D1E5E5] sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 h-20 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center" aria-label="GoServi — Accueil">
          <Image
            src="/logo.png"
            alt="GoServi"
            width={260}
            height={80}
            className="h-16 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm font-medium text-[#1F2937] hover:text-[#1CA7A6] hover:bg-[#F4F7F7] rounded-[8px] transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <Link
                href={dashboardHref}
                className="px-4 py-2 text-sm font-medium text-[#1F2937] border border-[#D1E5E5] rounded-[8px] hover:border-[#1CA7A6] hover:text-[#1CA7A6] transition-all"
              >
                Mon espace
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-[#1F2937] rounded-[8px] transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-[#1F2937] hover:text-[#1CA7A6] rounded-[8px] transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-[#1CA7A6] hover:bg-[#178F8E] active:bg-[#159895] rounded-[8px] transition-colors shadow-sm"
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>

        {/* Mobile: CTA + hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          {user ? (
            <Link
              href={dashboardHref}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1CA7A6] hover:bg-[#178F8E] rounded-[8px] transition-colors"
            >
              Mon espace
            </Link>
          ) : (
            <Link
              href="/auth/register"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1CA7A6] hover:bg-[#178F8E] rounded-[8px] transition-colors"
            >
              S&apos;inscrire
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="w-9 h-9 flex items-center justify-center rounded-[8px] hover:bg-[#F4F7F7] transition-colors text-gray-600"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#D1E5E5] bg-white shadow-md">
          <div className="px-4 py-2 flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-sm font-medium text-[#1F2937] hover:text-[#1CA7A6] border-b border-[#F4F7F7] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className="py-3 text-sm font-medium text-red-500 hover:text-red-600 text-left transition-colors"
              >
                Se déconnecter
              </button>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-sm font-medium text-[#1CA7A6] hover:text-[#178F8E] transition-colors"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
