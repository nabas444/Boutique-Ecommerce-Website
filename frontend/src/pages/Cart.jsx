import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useState } from 'react';
import api from '../api/client';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items, fetchCart, updateItem, removeItem } = useCartStore();
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [applyingCode, setApplyingCode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  // Fetch full product details for cart items
  const { data: cartDetails, isLoading } = useQuery({
    queryKey: ['cart-details', items.map(i => i.variantId).join(',')],
    queryFn: async () => {
      if (!items.length) return [];
      const { data } = await api.post('/orders/cart/details', { variantIds: items.map(i => i.variantId) });
      return data.data;
    },
    enabled: items.length > 0,
  });

  async function handleApplyDiscount(e) {
    e.preventDefault();
    if (!discountCode.trim()) return;
    setApplyingCode(true);
    try {
      const { data } = await api.post('/discounts/apply', {
        code: discountCode.trim(),
        orderTotal: subtotal,
      });
      setDiscount(data.data);
      toast.success(`Code applied! You save $${data.data.discountAmount.toFixed(2)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
      setDiscount(null);
    } finally { setApplyingCode(false); }
  }

  const enrichedItems = items.map(item => {
    const detail = cartDetails?.find(d => d.variantId === item.variantId);
    return { ...item, ...detail };
  });

  const subtotal = enrichedItems.reduce((sum, item) => sum + ((item.unitPrice || 0) * item.quantity), 0);
  const discountAmount = discount?.discountAmount || 0;
  const shipping = subtotal >= 100 ? 0 : 15;
  const total = subtotal - discountAmount + shipping;

  if (isLoading && items.length > 0) return (
    <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse">
      <div className="h-8 bg-stone-200 rounded w-32 mb-8" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-stone-200 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-stone-200 rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-stone-900 mb-8">
        Your Cart{items.length > 0 && <span className="text-stone-400 font-normal ml-2 text-xl">({items.length} {items.length === 1 ? 'item' : 'items'})</span>}
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <ShoppingBag size={64} className="text-stone-200 mx-auto mb-6" />
          <h2 className="font-display text-2xl font-bold text-stone-700 mb-3">Your cart is empty</h2>
          <p className="text-stone-400 mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-stone-900 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-stone-800 transition-colors">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {enrichedItems.map(item => (
              <div key={item.variantId} className="bg-white rounded-2xl border border-stone-100 p-4 flex gap-4">
                <Link to={item.productSlug ? `/products/${item.productSlug}` : '#'}>
                  <div className="w-24 h-28 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-stone-300"><ShoppingBag size={24} /></div>
                    }
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={item.productSlug ? `/products/${item.productSlug}` : '#'}
                        className="font-semibold text-stone-900 text-sm hover:underline line-clamp-1">
                        {item.productName || 'Product'}
                      </Link>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {[item.color, item.size].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <button onClick={() => { removeItem(item.variantId); toast.success('Removed from cart'); }}
                      className="p-1.5 text-stone-300 hover:text-red-500 transition-colors ml-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                      <button onClick={() => item.quantity > 1 ? updateItem(item.variantId, item.quantity - 1) : removeItem(item.variantId)}
                        className="px-3 py-1.5 hover:bg-stone-50 text-stone-600 transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-1.5 font-semibold text-sm text-stone-900 min-w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateItem(item.variantId, item.quantity + 1)}
                        className="px-3 py-1.5 hover:bg-stone-50 text-stone-600 transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-bold text-stone-900">${((item.unitPrice || 0) * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h2 className="font-semibold text-stone-900 mb-5">Order Summary</h2>

              {/* Discount code */}
              <form onSubmit={handleApplyDiscount} className="mb-5">
                <label className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-1.5">
                  <Tag size={14} /> Discount Code
                </label>
                <div className="flex gap-2">
                  <input value={discountCode} onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME10"
                    className="flex-1 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono" />
                  <button type="submit" disabled={applyingCode}
                    className="bg-stone-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-50">
                    {applyingCode ? '...' : 'Apply'}
                  </button>
                </div>
                {discount && (
                  <p className="text-xs text-emerald-600 mt-2 font-medium">
                    ✓ Code applied — saving ${discount.discountAmount.toFixed(2)}
                  </p>
                )}
              </form>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-stone-400">Add ${(100 - subtotal).toFixed(2)} more for free shipping</p>
                )}
                <div className="border-t border-stone-100 pt-3 flex justify-between font-bold text-stone-900 text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={() => navigate('/checkout', { state: { discount } })}
                className="w-full mt-6 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors">
                Proceed to Checkout <ArrowRight size={18} />
              </button>
              <Link to="/products" className="block text-center mt-3 text-sm text-stone-400 hover:text-stone-600">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
