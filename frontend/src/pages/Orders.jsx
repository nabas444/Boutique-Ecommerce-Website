import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import api from '../api/client';

const STATUS_STYLES = {
  PENDING:    { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', label: 'Pending' },
  CONFIRMED:  { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400', label: 'Confirmed' },
  PROCESSING: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400', label: 'Processing' },
  SHIPPED:    { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400', label: 'Shipped' },
  DELIVERED:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', label: 'Delivered' },
  CANCELLED:  { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400', label: 'Cancelled' },
  REFUNDED:   { bg: 'bg-stone-50', text: 'text-stone-600', dot: 'bg-stone-400', label: 'Refunded' },
};

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then(r => r.data.data),
  });

  const orders = data?.orders || [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-stone-900 mb-8">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-stone-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-stone-100">
          <ShoppingBag size={56} className="text-stone-200 mx-auto mb-5" />
          <h2 className="font-display text-xl font-bold text-stone-700 mb-2">No orders yet</h2>
          <p className="text-stone-400 mb-6 text-sm">Your order history will appear here.</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-stone-900 text-white font-semibold px-6 py-3 rounded-xl hover:bg-stone-800 transition-colors text-sm">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const s = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
            const firstItem = order.items?.[0];
            return (
              <Link key={order.id} to={`/orders/${order.id}`}
                className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center gap-4 hover:shadow-md transition-all group">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                  {firstItem?.product?.images?.[0]?.url
                    ? <img src={firstItem.product.images[0].url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-stone-300" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                    {order.trackingNumber && (
                      <span className="text-xs text-stone-400">#{order.trackingNumber}</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-stone-900 truncate">
                    {order.items?.length === 1
                      ? firstItem?.product?.name
                      : `${order.items?.length} items`}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    {' · '}Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-stone-900">${Number(order.total).toFixed(2)}</p>
                  <ChevronRight size={18} className="text-stone-300 mt-1 ml-auto group-hover:text-stone-600 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
