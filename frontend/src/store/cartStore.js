import { create } from 'zustand';
import api from '../api/client';

export const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,

  // Load cart from server
  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get('/orders/cart/me');
      set({ items: data.data.items || [] });
    } catch {
      set({ items: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  // Add item (optimistic)
  addItem: async (variantId, quantity = 1) => {
    const current = get().items;
    const existing = current.find((i) => i.variantId === variantId);

    if (existing) {
      set({ items: current.map((i) => i.variantId === variantId ? { ...i, quantity: i.quantity + quantity } : i) });
    } else {
      set({ items: [...current, { variantId, quantity }] });
    }

    try {
      await api.post('/orders/cart/items', { variantId, quantity });
    } catch {
      set({ items: current }); // rollback
    }
  },

  updateItem: async (variantId, quantity) => {
    const current = get().items;
    set({ items: current.map((i) => i.variantId === variantId ? { ...i, quantity } : i) });
    try {
      await api.put(`/orders/cart/items/${variantId}`, { quantity });
    } catch {
      set({ items: current });
    }
  },

  removeItem: async (variantId) => {
    const current = get().items;
    set({ items: current.filter((i) => i.variantId !== variantId) });
    try {
      await api.delete(`/orders/cart/items/${variantId}`);
    } catch {
      set({ items: current });
    }
  },

  clearCart: () => set({ items: [] }),

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
