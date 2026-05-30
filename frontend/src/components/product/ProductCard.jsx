import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product, compact = false }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore(s => s.addItem);
  const navigate = useNavigate();

  const primaryImage = product.images?.find(i => i.isPrimary) || product.images?.[0];
  const secondaryImage = product.images?.[1];
  const lowestVariant = product.variants?.reduce((a, b) => a.stock > 0 ? a : b, product.variants?.[0]);
  const inStock = product.variants?.some(v => v.stock > 0);
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  async function handleWishlist(e) {
    e.preventDefault();
    if (!isAuthenticated()) { navigate('/login', { state: { from: '/wishlist' } }); return; }
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${product.id}`);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post(`/wishlist/${product.id}`);
        setWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch { toast.error('Something went wrong'); }
  }

  async function handleQuickAdd(e) {
    e.preventDefault();
    if (!isAuthenticated()) { navigate('/login', { state: { from: '/cart' } }); return; }
    if (!lowestVariant) return;
    setAdding(true);
    try {
      await addItem(lowestVariant.id, 1);
      toast.success('Added to cart');
    } catch { toast.error('Could not add to cart'); }
    finally { setAdding(false); }
  }

  if (compact) return (
    <Link to={`/products/${product.slug}`} className="group block bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square overflow-hidden bg-stone-100">
        {primaryImage ? (
          <img src={primaryImage.url} alt={primaryImage.alt || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <ShoppingBag size={32} />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-stone-400 truncate">{product.category?.name}</p>
        <p className="text-sm font-medium text-stone-900 truncate">{product.name}</p>
        <p className="text-sm font-bold text-stone-900 mt-0.5">${Number(product.price).toFixed(2)}</p>
      </div>
    </Link>
  );

  return (
    <Link to={`/products/${product.slug}`} className="group block bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image area */}
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
        {primaryImage ? (
          <>
            <img src={primaryImage.url} alt={primaryImage.alt || product.name}
              className={`w-full h-full object-cover transition-all duration-700 ${secondaryImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`} />
            {secondaryImage && (
              <img src={secondaryImage.url} alt={product.name}
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-200">
            <ShoppingBag size={48} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">-{discount}%</span>
          )}
          {product.isFeatured && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">Featured</span>
          )}
          {!inStock && (
            <span className="bg-stone-700 text-white text-xs font-bold px-2 py-0.5 rounded-lg">Sold Out</span>
          )}
        </div>

        {/* Wishlist button */}
        <button onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110">
          <Heart size={15} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-stone-400'} />
        </button>

        {/* Quick add */}
        {inStock && (
          <button onClick={handleQuickAdd} disabled={adding}
            className="absolute bottom-0 left-0 right-0 bg-stone-900/95 text-white text-xs font-semibold py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2">
            {adding
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><ShoppingBag size={14} /> Quick Add</>}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-stone-400 mb-1">{product.category?.name}</p>
        <p className="text-sm font-semibold text-stone-900 leading-tight mb-2 line-clamp-1">{product.name}</p>

        {/* Rating */}
        {product.avgRating && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="text-xs text-stone-500">{Number(product.avgRating).toFixed(1)}</span>
            <span className="text-xs text-stone-300">({product._count?.reviews || 0})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-stone-900">${Number(product.price).toFixed(2)}</span>
          {product.comparePrice && (
            <span className="text-sm text-stone-400 line-through">${Number(product.comparePrice).toFixed(2)}</span>
          )}
        </div>

        {/* Color swatches */}
        {product.variants?.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {[...new Map(product.variants.filter(v => v.colorHex).map(v => [v.color, v])).values()]
              .slice(0, 5)
              .map(v => (
                <span key={v.color} title={v.color}
                  className="w-4 h-4 rounded-full border border-stone-200 flex-shrink-0"
                  style={{ backgroundColor: v.colorHex }} />
              ))}
          </div>
        )}
      </div>
    </Link>
  );
}
