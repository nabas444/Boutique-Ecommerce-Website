import { Link } from 'react-router-dom';
import { Truck, Zap, MapPin, Package, Clock, Shield } from 'lucide-react';

const SHIPPING_OPTIONS = [
  {
    icon: Truck,
    name: 'Standard Shipping',
    time: '3–5 Business Days',
    price: 'Free over $100 · $6.99 under',
    description: 'Our most popular option. Reliable delivery to your door with full tracking.',
    color: 'bg-stone-50 border-stone-200',
    iconColor: 'text-stone-700',
    badge: null,
  },
  {
    icon: Zap,
    name: 'Express Shipping',
    time: '1–2 Business Days',
    price: '$15 flat fee',
    description: 'Need it fast? Express gets your order to you in record time.',
    color: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
    badge: 'Popular',
  },
  {
    icon: MapPin,
    name: 'Same-Day Delivery',
    time: 'Today (order by 12pm)',
    price: '$25 flat fee',
    description: 'Available in select cities. Order before noon for delivery the same day.',
    color: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
    badge: 'Select Cities',
  },
];

const STEPS = [
  { icon: Package, title: 'Order Placed', desc: 'You receive an order confirmation email immediately.' },
  { icon: Clock, title: 'Processing', desc: 'We pick, pack, and quality-check your items within 24 hours.' },
  { icon: Truck, title: 'Shipped', desc: 'Your order is handed to the carrier with a tracking number.' },
  { icon: MapPin, title: 'Delivered', desc: 'Your package arrives at your door. Enjoy!' },
];

export default function Shipping() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-stone-900 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">Delivery Info</p>
          <h1 className="text-5xl font-bold text-white mb-4">Shipping &<br />Delivery</h1>
          <p className="text-stone-400 text-lg">Fast, reliable shipping with real-time tracking on every order.</p>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-xs font-semibold text-stone-400 tracking-widest uppercase mb-6">Shipping Options</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {SHIPPING_OPTIONS.map(opt => (
            <div key={opt.name} className={`relative border rounded-3xl p-6 ${opt.color}`}>
              {opt.badge && (
                <span className="absolute top-4 right-4 bg-amber-500 text-stone-900 text-xs font-bold px-2 py-1 rounded-full">{opt.badge}</span>
              )}
              <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm`}>
                <opt.icon size={22} className={opt.iconColor} />
              </div>
              <h3 className="font-bold text-stone-900 text-lg mb-1">{opt.name}</h3>
              <p className="text-amber-600 font-semibold text-sm mb-2">{opt.time}</p>
              <p className="text-stone-500 text-sm mb-3">{opt.price}</p>
              <p className="text-stone-600 text-sm leading-relaxed">{opt.description}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <h2 className="text-xs font-semibold text-stone-400 tracking-widest uppercase mb-6">How It Works</h2>
        <div className="relative mb-16">
          <div className="hidden md:block absolute top-8 left-8 right-8 h-px bg-stone-200 z-0" />
          <div className="grid md:grid-cols-4 gap-6 relative z-10">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-stone-900 flex items-center justify-center mb-4 shadow-lg">
                  <step.icon size={22} className="text-amber-400" />
                </div>
                <p className="text-xs font-semibold text-stone-400 mb-1">Step {i + 1}</p>
                <h3 className="font-bold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-16">
          <div className="bg-stone-50 rounded-3xl p-6">
            <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><Shield size={18} className="text-amber-500" /> Order Tracking</h3>
            <p className="text-stone-600 text-sm leading-relaxed">Every order comes with a unique tracking number sent to your email. Log in to your account under "My Orders" to see live tracking updates at any time.</p>
          </div>
          <div className="bg-stone-50 rounded-3xl p-6">
            <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><Package size={18} className="text-amber-500" /> Packaging</h3>
            <p className="text-stone-600 text-sm leading-relaxed">All orders are packed in eco-friendly materials. Fragile items are double-wrapped. If your package arrives damaged, contact us within 48 hours for a full replacement.</p>
          </div>
          <div className="bg-stone-50 rounded-3xl p-6">
            <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><MapPin size={18} className="text-amber-500" /> Delivery Address</h3>
            <p className="text-stone-600 text-sm leading-relaxed">Make sure your delivery address is correct before placing your order. Address changes can only be made within 1 hour of purchase. We cannot redirect packages already in transit.</p>
          </div>
          <div className="bg-stone-50 rounded-3xl p-6">
            <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><Clock size={18} className="text-amber-500" /> Delays</h3>
            <p className="text-stone-600 text-sm leading-relaxed">During peak seasons (holidays, sales events) delivery times may be extended by 1–2 days. We'll always notify you by email if your delivery is delayed.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-stone-900 rounded-3xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Questions about your delivery?</h3>
          <p className="text-stone-400 mb-6">Our support team responds within 2 hours on business days.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact" className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-8 py-3 rounded-2xl transition-colors">Contact Support</Link>
            <Link to="/orders" className="border border-stone-600 text-stone-300 hover:text-white font-medium px-8 py-3 rounded-2xl transition-colors">Track My Order</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
