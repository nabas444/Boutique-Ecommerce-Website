import { Link } from 'react-router-dom';
import { FileText, ShoppingBag, CreditCard, Lock, AlertCircle, Scale, Mail } from 'lucide-react';

const SECTIONS = [
  {
    id: 'acceptance',
    icon: FileText,
    title: 'Acceptance of Terms',
    paragraphs: [
      'By accessing or using the Boutique website and services (collectively, the "Platform"), you confirm that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). If you do not agree, please do not use the Platform.',
      'These Terms apply to all visitors, registered users, and customers. We may update these Terms at any time. Continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms. We will notify registered users of material changes via email.',
      'You must be at least 18 years old to create an account or make a purchase. By using our services, you represent that you meet this requirement.',
    ],
  },
  {
    id: 'use-of-platform',
    icon: ShoppingBag,
    title: 'Use of the Platform',
    paragraphs: [
      'You agree to use the Platform only for lawful purposes and in accordance with these Terms. You may not use the Platform to engage in any activity that is fraudulent, harmful, or violates any applicable law or regulation.',
      'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access to your account. Boutique is not liable for any loss resulting from unauthorized use of your account before notification.',
      'We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or use the Platform in a manner that could harm other users or our services. You may not scrape, crawl, or automate interactions with the Platform without our express written permission.',
    ],
  },
  {
    id: 'products-pricing',
    icon: ShoppingBag,
    title: 'Product Descriptions & Pricing',
    paragraphs: [
      'We make every effort to display accurate product descriptions, images, and pricing. However, we do not warrant that all information is complete, accurate, or error-free. In the event of a pricing error, we reserve the right to cancel or refuse orders placed at an incorrect price.',
      'Colors displayed on-screen may vary slightly from the actual product due to differences in monitor calibration and display settings. This variation does not constitute grounds for a return unless the product is materially different from its description.',
      'Prices are displayed in the local currency and are subject to change without notice. Any applicable taxes or shipping fees will be clearly displayed at checkout before you complete your purchase. Promotional prices apply only during the specified promotional period.',
    ],
  },
  {
    id: 'payment-terms',
    icon: CreditCard,
    title: 'Payment Terms',
    paragraphs: [
      'All payments are processed securely through Stripe. By placing an order, you authorize us to charge your selected payment method for the total amount displayed at checkout, including any applicable taxes and shipping fees.',
      'Your order is confirmed only upon successful payment authorization. We reserve the right to refuse or cancel any order at our discretion, including in cases of suspected fraud, unavailability of items, or errors in pricing.',
      'For returns and refunds, please refer to our Return Policy. Refunds are issued to the original payment method within 5–7 business days of receiving and inspecting the returned item. Shipping fees are non-refundable unless the return is due to our error.',
    ],
  },
  {
    id: 'intellectual-property',
    icon: Lock,
    title: 'Intellectual Property',
    paragraphs: [
      'All content on the Boutique Platform — including text, images, logos, product photography, graphics, software, and the overall design — is owned by or licensed to Boutique and is protected by applicable intellectual property laws.',
      'You may not reproduce, distribute, modify, create derivative works of, or commercially exploit any content from the Platform without our express prior written consent. Limited personal, non-commercial use is permitted.',
      'User-submitted content (such as reviews or feedback) remains your property, but by submitting it you grant Boutique a non-exclusive, royalty-free, worldwide licence to use, reproduce, and display that content in connection with our services.',
    ],
  },
  {
    id: 'limitation-of-liability',
    icon: AlertCircle,
    title: 'Limitation of Liability',
    paragraphs: [
      'The Platform is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the reliability, accuracy, or availability of the Platform. We do not warrant that the Platform will be uninterrupted, error-free, or free of viruses.',
      'To the maximum extent permitted by applicable law, Boutique and its directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Platform.',
      'Our total liability for any claim arising out of or relating to these Terms or your use of the Platform shall not exceed the amount you paid for the specific order giving rise to the claim.',
    ],
  },
  {
    id: 'governing-law',
    icon: Scale,
    title: 'Governing Law',
    paragraphs: [
      'These Terms shall be governed by and construed in accordance with the laws of Ethiopia, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts located in Addis Ababa, Ethiopia.',
      'If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect. Our failure to enforce any right or provision under these Terms does not constitute a waiver of that right.',
      'These Terms, together with our Privacy Policy, Return Policy, and any other policies referenced herein, constitute the entire agreement between you and Boutique with respect to your use of the Platform.',
    ],
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-stone-900 py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">Legal</p>
          <h1 className="text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-stone-400 text-lg">Please read these terms carefully before using our platform.</p>
          <p className="text-stone-500 text-sm mt-6">Last updated: June 1, 2026</p>
        </div>
      </section>

      {/* Quick Nav */}
      <section className="border-b border-stone-200 sticky top-0 bg-white z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          {SECTIONS.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex-shrink-0 text-xs font-semibold text-stone-500 hover:text-stone-900 px-3 py-2 rounded-full hover:bg-stone-100 transition-colors whitespace-nowrap"
            >
              {s.title}
            </a>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        {/* Intro Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 mb-14">
          <p className="text-stone-700 leading-relaxed">
            These Terms of Service govern your use of the <strong>Boutique</strong> platform. By shopping with us, you agree to these terms. If you have questions, <Link to="/contact" className="text-amber-700 font-semibold hover:underline">contact us</Link> — we're happy to explain anything.
          </p>
        </div>

        <div className="space-y-16">
          {SECTIONS.map((section, idx) => (
            <div key={section.id} id={section.id} className="scroll-mt-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <section.icon size={20} className="text-amber-400" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-stone-400 tracking-widest uppercase">Section {idx + 1}</span>
                  <h2 className="text-2xl font-bold text-stone-900">{section.title}</h2>
                </div>
              </div>
              <div className="space-y-4 pl-16">
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="text-stone-600 leading-relaxed">{p}</p>
                ))}
              </div>
              {idx < SECTIONS.length - 1 && <div className="border-b border-stone-100 mt-12" />}
            </div>
          ))}
        </div>

        {/* Changes to Terms */}
        <div className="mt-14 bg-stone-50 rounded-3xl p-6">
          <h2 className="text-xl font-bold text-stone-900 mb-3">Changes to These Terms</h2>
          <p className="text-stone-600 leading-relaxed">
            We may revise these Terms from time to time. When we make significant changes, we will update the "Last updated" date at the top of this page and, where appropriate, notify you by email. Your continued use of the Platform after changes take effect constitutes your agreement to the new Terms.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="bg-stone-900 rounded-3xl p-8 text-center mt-10">
          <Mail size={28} className="text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Questions About These Terms?</h3>
          <p className="text-stone-400 mb-6">Our team is happy to clarify anything in plain language.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-8 py-3 rounded-2xl transition-colors"
            >
              Contact Us
            </Link>
            <a
              href="mailto:legal@boutique.com"
              className="inline-flex items-center justify-center gap-2 border border-stone-600 text-stone-300 hover:text-white font-medium px-8 py-3 rounded-2xl transition-colors"
            >
              legal@boutique.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
