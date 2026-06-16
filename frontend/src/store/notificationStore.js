import { create } from "zustand";
import { io } from "socket.io-client";
import api from "../api/client";

let socket = null;

export const useNotificationStore = create((set, get) => ({
  wishlistCount: 0,
  ordersCount: 0,
  unreadChats: 0,
  connected: false,

  setWishlistCount: (n) => set({ wishlistCount: n }),
  incWishlist: () => set((s) => ({ wishlistCount: s.wishlistCount + 1 })),
  decWishlist: () =>
    set((s) => ({ wishlistCount: Math.max(0, s.wishlistCount - 1) })),

  setOrdersCount: (n) => set({ ordersCount: n }),

  setUnreadChats: (n) => set({ unreadChats: n }),
  incUnreadChats: () => set((s) => ({ unreadChats: s.unreadChats + 1 })),
  clearUnreadChats: () => set({ unreadChats: 0 }),

  // Initialize counts and open socket connection
  init: async (accessToken) => {
    try {
      const [wl, orders, unread] = await Promise.all([
        api
          .get("/wishlist")
          .then((r) => (Array.isArray(r.data.data) ? r.data.data.length : 0))
          .catch(() => 0),
        api
          .get("/orders?page=1&limit=1")
          .then((r) => r.data.data?.pagination?.total || 0)
          .catch(() => 0),
        api
          .get("/chat/unread-count")
          .then((r) => r.data.data?.unread || 0)
          .catch(() => 0),
      ]);
      set({ wishlistCount: wl, ordersCount: orders, unreadChats: unread });
    } catch (e) {
      // ignore
    }

    // Establish a socket for notifications
    try {
      const runtimeBackend = `${location.protocol}//${location.hostname}:4000`;
      const socketUrl = import.meta.env.VITE_API_URL || runtimeBackend || "/";
      socket = io(socketUrl, { auth: { token: accessToken } });
      socket.on("connect", () => set({ connected: true }));
      socket.on("disconnect", () => set({ connected: false }));

      // Admin notifications and user notifications for incoming messages
      socket.on("chat:notification", (payload) => {
        // increment unread counter
        set((s) => ({ unreadChats: s.unreadChats + 1 }));
      });

      // When messages are marked read (server emits chat:read), refresh unread count
      socket.on("chat:read", async () => {
        try {
          const { data } = await api.get("/chat/unread-count");
          set({ unreadChats: data.data?.unread || 0 });
        } catch (e) {}
      });
    } catch (e) {
      // ignore socket errors
    }
  },

  // Refresh unread count from server
  refreshUnread: async () => {
    try {
      const { data } = await api.get("/chat/unread-count");
      set({ unreadChats: data.data?.unread || 0 });
    } catch (e) {}
  },

  // Disconnect socket
  teardown: () => {
    try {
      socket?.disconnect();
    } catch (e) {}
    socket = null;
    set({ connected: false });
  },
}));

export default useNotificationStore;
