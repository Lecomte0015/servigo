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
        // NE PAS appeler set({ user: null }) ici.
        // Si le logout échoue (cookie non effacé), l'utilisateur reste sur
        // le dashboard avec son état Zustand intact → bouton logout visible.
        // Le DashboardShell utilise logoutAction() (Server Action) directement.
        window.location.href = "/auth/logout";
      },
    }),
    {
      name: "goservi-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
