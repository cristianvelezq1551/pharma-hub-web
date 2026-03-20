'use client';

/**
 * Store de autenticación — Zustand con persist en localStorage.
 * Equivalente a un Provider/InheritedWidget global en Flutter.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/lib/types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  updateUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken });
      },

      clearAuth: () => {
        set({ user: null, accessToken: null, refreshToken: null });
      },

      updateUser: (user) => set({ user }),
    }),
    { name: 'pharma-web-auth' },
  ),
);
