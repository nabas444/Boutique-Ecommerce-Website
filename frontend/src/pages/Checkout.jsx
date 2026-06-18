import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Shield, ArrowLeft, MapPin, Plus } from 'lucide-react';
import api from '../api/client';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function AddressForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ label: 'Home', line1: '', city: '', postalCode: '', country: 'ET' });
  const [saving, setSaving] = useState(false);
  const set = field => e => setForm(p => ({...p, [field]: e.target.value}));
  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/users/me/addresses', { ...form, isDefault: true });
      onSave(data.data);
      toast.success('Address saved');
    } catch { toast.error('Failed to save address'); }
    finally { setSaving(false); }
  }
  return (
    <form onSubmit={handleSave} className="space-y-3 p-4 bg-stone-50 rounded-xl">
      <div className="grid grid-cols-2 gap-3">
        <input value={form.label} onChange={set('label')} placeholder="Label (Home, Work...)"
          className="col-span-2 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
        <input value={form.line1} onChange={set('line1')} placeholder="Street address" required
          className="col-span-2 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
        <input value={form.city} onChange={set('city')} placeholder="City" required
          className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
        <input value={form.postalCode} onChange={set('postalCode')} placeholder="Postal code" required
          className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className="bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Address'}
        </button>
        <button type="button" onClick={onCancel}
          className="border border-stone-200 px-5 py-2.5 rounded-xl text-sm text-stone-600 hover:bg-stone-50 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

function PaymentForm({ orderId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  async function handlePay(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}`,
        },
      });
      if (error) {
        toast.error(error.message || 'Payment could not be completed');
        return;
      }
      if (paymentIntent?.status === 'succeeded') {
        await api.post('/payments/confirm', {
          orderId,
          paymentIntentId: paymentIntent.id,
        });
        onSuccess();
        return;
      }
      toast.error(
        paymentIntent?.status
          ? `Payment is ${paymentIntent.status}. Please follow Stripe's instructions or try again.`
          : 'Payment could not be completed',
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Payment failed',
      );
    }
    finally { setPaying(false); }
  }

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement />
      <button type="submit" disabled={paying || !stripe || !elements}
        className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4">
        {paying
          ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><Shield size={18} /> Pay Now</>}
      </button>
    </form>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const discount = location.state?.discount;
  const { items, clearCart } = useCartStore();
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [step, setStep] = useState('address'); // address | payment
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  const { data: addressData, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/users/me/addresses').then(r => r.data.data),
  });
  const addresses = addressData || [];

  // Auto-select default
  useEffect(() => {
    const def = addresses.find(a => a.isDefault) || addresses[0];
    if (def && !selectedAddressId) setSelectedAddressId(def.id);
  }, [addresses]);

  async function handlePlaceOrder() {
    if (!selectedAddressId) { toast.error('Please select a delivery address'); return; }
    setPlacingOrder(true);
    try {
      // 1. Create order
      const orderRes = await api.post('/orders', {
        addressId: selectedAddressId,
        discountCode: discount?.discount?.code,
      });
      const newOrderId = orderRes.data.data.id;
      setOrderId(newOrderId);

      // 2. Create payment intent
      const payRes = await api.post('/payments/create-intent', { orderId: newOrderId });
      setClientSecret(payRes.data.data.clientSecret);
      setStep('payment');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setPlacingOrder(false); }
  }

  function handlePaymentSuccess() {
    clearCart();
    toast.success('Order placed successfully!');
    navigate(`/orders/${orderId}`, { replace: true });
  }

  if (items.length === 0 && step === 'address') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-stone-500 mb-4">Your cart is empty.</p>
        <Link to="/products" className="text-stone-900 font-medium underline">Go shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => step === 'payment' ? setStep('address') : navigate('/cart')}
          className="p-2 text-stone-500 hover:bg-stone-100 rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-900">Checkout</h1>
          <div className="flex items-center gap-3 mt-1">
            {['address', 'payment'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="w-8 h-px bg-stone-300" />}
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${step === s ? 'text-stone-900' : step === 'payment' && s === 'address' ? 'text-emerald-600' : 'text-stone-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === s ? 'bg-stone-900 text-white' : step === 'payment' && s === 'address' ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'}`}>
                    {step === 'payment' && s === 'address' ? '✓' : i + 1}
                  </div>
                  {s === 'address' ? 'Delivery' : 'Payment'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left — steps */}
        <div className="lg:col-span-3">
          {step === 'address' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-stone-900 flex items-center gap-2"><MapPin size={18} /> Delivery Address</h2>
                <button onClick={() => setShowAddressForm(p => !p)}
                  className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900">
                  <Plus size={16} /> New address
                </button>
              </div>

              {showAddressForm && (
                <AddressForm
                  onSave={addr => { refetchAddresses(); setSelectedAddressId(addr.id); setShowAddressForm(false); }}
                  onCancel={() => setShowAddressForm(false)} />
              )}

              {addresses.length === 0 && !showAddressForm && (
                <div className="text-center py-10 bg-stone-50 rounded-2xl">
                  <MapPin size={32} className="text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500 text-sm mb-3">No saved addresses yet</p>
                  <button onClick={() => setShowAddressForm(true)}
                    className="text-sm font-medium text-stone-900 underline">Add your first address</button>
                </div>
              )}

              <div className="space-y-3">
                {addresses.map(addr => (
                  <label key={addr.id}
                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-stone-900 bg-stone-50' : 'border-stone-100 hover:border-stone-300'}`}>
                    <input type="radio" name="address" value={addr.id} checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)} className="mt-1" />
                    <div className="text-sm">
                      <p className="font-semibold text-stone-900">{addr.label}</p>
                      <p className="text-stone-500">{addr.line1}{addr.line2 && `, ${addr.line2}`}</p>
                      <p className="text-stone-500">{addr.city}{addr.postalCode && `, ${addr.postalCode}`}</p>
                    </div>
                  </label>
                ))}
              </div>

              {addresses.length > 0 && (
                <button onClick={handlePlaceOrder} disabled={placingOrder || !selectedAddressId}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4">
                  {placingOrder
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <>Continue to Payment →</>}
                </button>
              )}
            </div>
          )}

          {step === 'payment' && clientSecret && (
            <div>
              <h2 className="font-semibold text-stone-900 mb-5 flex items-center gap-2"><Shield size={18} /> Secure Payment</h2>
              {!stripePromise ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                  Stripe is missing a publishable key. Set VITE_STRIPE_PUBLIC_KEY and restart the frontend server.
                </div>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                  <PaymentForm orderId={orderId} onSuccess={handlePaymentSuccess} />
                </Elements>
              )}
              <p className="flex items-center justify-center gap-2 text-xs text-stone-400 mt-4">
                <Shield size={12} /> Powered by Stripe · Your payment info is secure and encrypted
              </p>
            </div>
          )}
        </div>

        {/* Right — summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-stone-100 p-6 sticky top-24">
            <h3 className="font-semibold text-stone-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm text-stone-600 border-b border-stone-100 pb-4 mb-4 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.variantId} className="flex justify-between">
                  <span className="truncate mr-2">{item.productName || 'Item'} ×{item.quantity}</span>
                  <span className="font-medium text-stone-900 flex-shrink-0">${((item.unitPrice || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            {discount && (
              <div className="flex justify-between text-sm text-emerald-600 mb-2">
                <span>Discount ({discount.discount.code})</span>
                <span>-${discount.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-stone-600 mb-2">
              <span>Shipping</span>
              <span className={items.length > 0 ? 'text-emerald-600 font-medium' : ''}>Free</span>
            </div>
            <div className="flex justify-between font-bold text-stone-900 text-base mt-2 pt-2 border-t border-stone-100">
              <span>Total</span>
              <span>${(items.reduce((s, i) => s + (i.unitPrice || 0) * i.quantity, 0) - (discount?.discountAmount || 0)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
