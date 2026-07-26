"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@/types";
import { clearTokens, setTokens } from "@/lib/auth/token";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (user: User, access: string, refresh: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      setSession: (user, access, refresh) => {
        setTokens(access, refresh);
        set({ user, isAuthenticated: true });
      },
      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
      logout: () => {
        clearTokens();
        set({ user: null, isAuthenticated: false });
      },
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: "dft-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

interface UiState {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: "light",
      sidebarOpen: false,
      setTheme: (theme) => {
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        get().setTheme(next);
      },
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: "dft-ui",
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.classList.toggle("dark", state.theme === "dark");
        }
      },
    },
  ),
);
