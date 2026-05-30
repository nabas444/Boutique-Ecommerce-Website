import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from 'lucide-react';
import api from '../api/client';

const STATUS_STEPS = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED'];
const STATUS_STYLES = {
  PENDING: { text: 'text-amber-700', label: 'Pending' },
  CONFIRMED: { text: 'text-blue-700', label: 'Confirmed' },
  PROCESSING: { text: 'text-purple-700', label: 'Processing' },
  SHIPPED: { text: 'text-indigo-700', label: 'Shipped' },
  DELIVERED: { text: 'text-emerald-700', label: 'Delivered' },
  CANCELLED: { text: 'text-red-700', label: 'Cancelled' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data.data),
  });

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-4">
      <div className="h-8 bg-stone-200 rounded w-40" />
      <div className="h-48 bg-stone-200 rounded-2xl" />
      <div className="h-48 bg-stone-200 rounded-2xl" />
    </div>
  );

  if (!data) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-stone-500">Order not found.</p>
    </div>
  );

  const order = data;
  const s = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
  const stepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/orders" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-8 text-sm transition-colors">
        <ArrowLeft size={16} /> Back to orders
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-900">Order Details</h1>
          <p className="text-stone-400 text-sm mt-1">#{order.id.slice(0,8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <span className={`text-sm font-semibold ${s.text}`}>{s.label}</span>
      </div>

      {/* Progress tracker */}
      {!['CANCELLED','REFUNDED'].includes(order.status) && (
        <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-stone-100 mx-8" />
            <div className="absolute top-4 left-0 h-0.5 bg-stone-900 mx-8 transition-all"
              style={{ width: `${stepIdx > 0 ? (stepIdx / (STATUS_STEPS.length - 1)) * 100 : 0}%` }} />
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="relative flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors z-10 ${i <= stepIdx ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'}`}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i <= stepIdx ? 'text-stone-700' : 'text-stone-400'}`}>
                  {step.charAt(0) + step.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
          {order.trackingNumber && (
            <p className="text-sm text-stone-600 mt-4 text-center">
              Tracking: <span className="font-mono font-semibold text-stone-900">{order.trackingNumber}</span>
            </p>
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-4">
        <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2"><Package size={18} className="text-stone-400" /> Items</h2>
        <div className="space-y-4">
          {order.items?.map(item => (
            <div key={item.id} className="flex gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                {item.product?.images?.[0]?.url
                  ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-stone-300" /></div>}
              </div>
              <div className="flex-1">
                <Link to={`/products/${item.product?.slug}`} className="font-medium text-stone-900 text-sm hover:underline">
                  {item.product?.name}
                </Link>
                <p className="text-xs text-stone-400 mt-0.5">
                  {[item.variant?.color, item.variant?.size].filter(Boolean).join(' · ')} · Qty {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-stone-900 text-sm">${(Number(item.unitPrice) * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Address */}
        {order.address && (
          <div className="bg-white rounded-2xl border border-stone-100 p-5">
            <h3 className="font-semibold text-stone-900 text-sm flex items-center gap-2 mb-3"><MapPin size={15} className="text-stone-400" /> Delivery Address</h3>
            <p className="text-sm text-stone-600">{order.address.label}</p>
            <p className="text-sm text-stone-600">{order.address.line1}</p>
            <p className="text-sm text-stone-600">{order.address.city}{order.address.postalCode && `, ${order.address.postalCode}`}</p>
          </div>
        )}

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <h3 className="font-semibold text-stone-900 text-sm flex items-center gap-2 mb-3"><CreditCard size={15} className="text-stone-400" /> Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-${Number(order.discountAmount).toFixed(2)}</span></div>
            )}
            <div className="flex justify-between text-stone-600"><span>Shipping</span><span>{Number(order.shippingCost) === 0 ? 'Free' : `$${Number(order.shippingCost).toFixed(2)}`}</span></div>
            <div className="flex justify-between font-bold text-stone-900 border-t border-stone-100 pt-2"><span>Total</span><span>${Number(order.total).toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
