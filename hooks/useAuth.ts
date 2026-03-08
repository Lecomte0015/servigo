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
        // Vider l'état client immédiatement
        set({ user: null });
        // Déléguer au serveur : GET /auth/logout efface le cookie JWT
        // ET redirige vers /auth/login dans une seule réponse HTTP atomique.
        // Cela évite la race condition entre cookies().delete() et la redirection.
        window.location.href = "/auth/logout";
      },
    }),
    {
      name: "goservi-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
