"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
  id: string;
  email: string;
  role: "CLIENT" | "ARTISAN" | "ADMIN";
  firstName: string;
  lastName: string;
  isApproved?: boolean | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: async () => {
        // 1. Vider Zustand
        set({ user: null });
        // 2. Forcer la suppression du localStorage (évite toute race condition avec persist)
        try { localStorage.removeItem("goservi-auth"); } catch {}
        // 3. Redirection serveur qui efface le cookie JWT
        window.location.href = "/auth/logout";
      },
    }),
    {
      name: "goservi-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
