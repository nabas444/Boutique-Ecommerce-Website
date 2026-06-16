import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, MessageCircle, Search } from 'lucide-react';

const FAQS = [
  {
    category: 'Orders & Shipping',
    items: [
      { q: 'How long does shipping take?', a: 'Standard shipping takes 3–5 business days. Express shipping (1–2 business days) is available at checkout for a flat fee of $15. Same-day delivery is available in select cities for $25.' },
      { q: 'How do I track my order?', a: 'Once your order ships, you\'ll receive a confirmation email with a tracking number. You can also log in to your account and visit the Orders section to see real-time status updates.' },
      { q: 'Can I change or cancel my order?', a: 'Orders can be modified or cancelled within 24 hours of placement. After that, your order enters processing and can no longer be changed. Contact us immediately via live chat if you need to make changes.' },
      { q: 'Do you ship internationally?', a: 'We currently ship within the country only. International shipping is on our roadmap and we\'ll announce when it becomes available.' },
    ]
  },
  {
    category: 'Returns & Refunds',
    items: [
      { q: 'What is your return policy?', a: 'We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in their original packaging with all tags attached. Sale items and intimate apparel are final sale.' },
      { q: 'How long do refunds take?', a: 'Once we receive and inspect your return, refunds are processed within 5–7 business days back to your original payment method. You\'ll receive an email confirmation when the refund is issued.' },
      { q: 'Can I exchange for a different size?', a: 'Yes! We offer free exchanges for different sizes or colors within 30 days. Use the live chat or email us with your order number to start an exchange.' },
    ]
  },
  {
    category: 'Payments & Security',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment gateway. All transactions are SSL encrypted.' },
      { q: 'Is my payment information safe?', a: 'Absolutely. We never store your card details on our servers. All payments are processed by Stripe, which is PCI DSS Level 1 certified — the highest level of payment security.' },
      { q: 'Can I use a promo code?', a: 'Yes! Enter your promo code at checkout in the discount field. Codes are case-insensitive and can\'t be combined with other offers unless stated.' },
    ]
  },
  {
    category: 'Products & Sizing',
    items: [
      { q: 'How do I find my size?', a: 'Visit our Size Guide page for detailed measurements for all categories. Each product page also has a size chart specific to that item. When in doubt, size up.' },
      { q: 'Are the product colors accurate?', a: 'We do our best to display colors accurately, but slight variations may occur due to different screen calibrations. Product descriptions note any significant color nuances.' },
      { q: 'How do I care for my items?', a: 'Care instructions are listed on each product page and on the garment label. As a general rule, wash dark colors in cold water and air dry to preserve color and shape.' },
    ]
  },
];

export default function FAQ() {
  const [openItem, setOpenItem] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item => !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-stone-900 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">Help Center</p>
          <h1 className="text-5xl font-bold text-white mb-4">Frequently Asked<br />Questions</h1>
          <p className="text-stone-400 text-lg mb-8">Find quick answers to the most common questions.</p>
          <div className="relative max-w-xl mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-stone-800 text-white placeholder-stone-500 border border-stone-700 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-400 text-lg">No results for "{search}"</p>
            <button onClick={() => setSearch('')} className="mt-4 text-amber-600 font-medium hover:underline">Clear search</button>
          </div>
        ) : (
          filtered.map(cat => (
            <div key={cat.category} className="mb-10">
              <h2 className="text-xs font-semibold text-amber-600 tracking-widest uppercase mb-4">{cat.category}</h2>
              <div className="space-y-2">
                {cat.items.map((item, i) => {
                  const key = `${cat.category}-${i}`;
                  const isOpen = openItem === key;
                  return (
                    <div key={key} className="border border-stone-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setOpenItem(isOpen ? null : key)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-stone-50 transition-colors"
                      >
                        <span className="font-medium text-stone-900 pr-4">{item.q}</span>
                        {isOpen ? <ChevronUp size={18} className="text-stone-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-stone-400 flex-shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 text-stone-600 leading-relaxed border-t border-stone-100 pt-4">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Still need help */}
        <div className="bg-stone-900 rounded-3xl p-8 text-center mt-12">
          <MessageCircle size={32} className="text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
          <p className="text-stone-400 mb-6">Our support team is available 7 days a week.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-8 py-3 rounded-2xl transition-colors">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
