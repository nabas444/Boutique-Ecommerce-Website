import { useCartStore } from '../store/cartStore';
import { useAuth } from './useAuth';

export function useCart() {
  const store = useCartStore();
  const { requireAuth } = useAuth();

  async function addToCart(variantId, quantity = 1) {
    if (!requireAuth('/cart')) return false;
    await store.addItem(variantId, quantity);
    return true;
  }

  return {
    items: store.items,
    isLoading: store.isLoading,
    itemCount: store.itemCount(),
    fetchCart: store.fetchCart,
    addToCart,
    updateItem: store.updateItem,
    removeItem: store.removeItem,
    clearCart: store.clearCart,
  };
}
