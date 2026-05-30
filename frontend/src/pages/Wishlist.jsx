import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import api from '../api/client';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const qc = useQueryClient();
  const addItem = useCartStore(s => s.addItem);

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/wishlist').then(r => r.data.data),
  });

  async function handleRemove(productId) {
    await api.delete(`/wishlist/${productId}`);
    qc.invalidateQueries(['wishlist']);
    toast.success('Removed from wishlist');
  }

  async function handleMoveToCart(item) {
    const variant = item.variant || item.product?.variants?.[0];
    if (!variant) { toast.error('Please select a variant on the product page'); return; }
    await addItem(variant.id, 1);
    await handleRemove(item.product.id);
    toast.success('Moved to cart!');
  }

  const items = data || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-stone-900 mb-8">
        Wishlist {items.length > 0 && <span className="text-stone-400 font-normal text-xl ml-2">({items.length})</span>}
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[...Array(4)].map((_,i) => <div key={i} className="aspect-[3/4] bg-stone-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-stone-100">
          <Heart size={56} className="text-stone-200 mx-auto mb-5" />
          <h2 className="font-display text-xl font-bold text-stone-700 mb-2">Your wishlist is empty</h2>
          <p className="text-stone-400 mb-6 text-sm">Save your favourite pieces here.</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-stone-900 text-white font-semibold px-6 py-3 rounded-xl hover:bg-stone-800 transition-colors text-sm">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {items.map(item => (
            <div key={item.id} className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-md transition-all">
              <Link to={`/products/${item.product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-stone-100">
                {item.product.images?.[0] ? (
                  <img src={item.product.images[0].url} alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-200">
                    <ShoppingBag size={40} />
                  </div>
                )}
              </Link>
              <div className="p-4">
                <Link to={`/products/${item.product.slug}`} className="font-semibold text-stone-900 text-sm hover:underline line-clamp-1">
                  {item.product.name}
                </Link>
                <p className="text-sm font-bold text-stone-900 mt-1">${Number(item.product.price).toFixed(2)}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleMoveToCart(item)}
                    className="flex-1 bg-stone-900 text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5">
                    <ShoppingBag size={13} /> Add to Cart
                  </button>
                  <button onClick={() => handleRemove(item.product.id)}
                    className="w-9 h-9 border border-stone-200 rounded-xl flex items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-200 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
