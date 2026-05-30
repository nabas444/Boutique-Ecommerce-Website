import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setAuth: (user, accessToken) => set({ user, accessToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ user: null, accessToken: null }),

      isAuthenticated: () => !!get().accessToken,
      isAdmin: () => get().user?.role === 'ADMIN',
    }),
    {
      name: 'boutique-auth',
      partialize: (state) => ({ user: state.user }),
      // Don't persist accessToken — it's short-lived; refresh cookie handles renewal
    }
  )
);
