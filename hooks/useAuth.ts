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
        // Vider le store Zustand + localStorage AVANT la redirection.
        // Le cookie est effacé côté serveur par /auth/logout.
        // Si le serveur échoue à effacer le cookie, l'appel à /api/auth/me
        // lors du prochain chargement re-hydratera l'état correctement.
        set({ user: null });
        window.location.href = "/auth/logout";
      },
    }),
    {
      name: "goservi-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
