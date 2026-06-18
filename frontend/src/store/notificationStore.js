import { create } from "zustand";
import api from "../api/client";

export const useNotificationStore = create((set, get) => ({
  wishlistCount: 0,
  ordersCount: 0,
  connected: false,

  setWishlistCount: (n) => set({ wishlistCount: n }),
  incWishlist: () => set((s) => ({ wishlistCount: s.wishlistCount + 1 })),
  decWishlist: () =>
    set((s) => ({ wishlistCount: Math.max(0, s.wishlistCount - 1) })),

  setOrdersCount: (n) => set({ ordersCount: n }),

  // Initialize counts (chat/unread removed)
  init: async (accessToken) => {
    try {
      const [wl, orders] = await Promise.all([
        api
          .get("/wishlist")
          .then((r) => (Array.isArray(r.data.data) ? r.data.data.length : 0))
          .catch(() => 0),
        api
          .get("/orders?page=1&limit=1")
          .then((r) => r.data.data?.pagination?.total || 0)
          .catch(() => 0),
      ]);
      set({ wishlistCount: wl, ordersCount: orders });
    } catch (e) {
      // ignore
    }
  },

  // Refresh counts
  refreshCounts: async () => {
    try {
      const [wl, orders] = await Promise.all([
        api
          .get("/wishlist")
          .then((r) => (Array.isArray(r.data.data) ? r.data.data.length : 0))
          .catch(() => 0),
        api
          .get("/orders?page=1&limit=1")
          .then((r) => r.data.data?.pagination?.total || 0)
          .catch(() => 0),
      ]);
      set({ wishlistCount: wl, ordersCount: orders });
    } catch (e) {}
  },

  teardown: () => {
    // no-op: chat/socket removed
  },
}));

export default useNotificationStore;
