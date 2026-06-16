import { Link } from 'react-router-dom';

export default function RefundPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-3xl font-bold text-stone-900 mb-6">Refund & Return Policy</h1>

      <section className="mb-6">
        <h2 className="font-semibold text-stone-900 mb-2">Overview</h2>
        <p className="text-stone-600">We want you to be completely satisfied with your purchase. If you are not happy, we are here to help.</p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-stone-900 mb-2">Returns</h2>
        <p className="text-stone-600">Items can be returned within 30 days of delivery. Item must be unused, unworn, and in original packaging with tags attached.</p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-stone-900 mb-2">Refunds</h2>
        <p className="text-stone-600">Once return is received and inspected, refund will be processed within 5-7 business days to original payment method.</p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-stone-900 mb-2">Exchanges</h2>
        <p className="text-stone-600">We offer free exchanges for different sizes or colors within 30 days.</p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-stone-900 mb-2">Non-returnable Items</h2>
        <p className="text-stone-600">Sale items, intimate apparel, and customized products cannot be returned.</p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-stone-900 mb-2">How to Start a Return</h2>
        <p className="text-stone-600">Contact us via the chat feature or email with your order number and reason for return.</p>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold text-stone-900 mb-2">Shipping Costs</h2>
        <p className="text-stone-600">Original shipping costs are non-refundable. Return shipping is free for defective items.</p>
      </section>

      <div className="mt-8">
        <Link to="/contact" className="text-stone-900 font-medium hover:underline">Contact Support</Link>
      </div>
    </div>
  );
}
