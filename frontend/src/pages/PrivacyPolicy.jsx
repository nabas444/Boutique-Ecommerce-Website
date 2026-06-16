import { Link } from 'react-router-dom';
import { Shield, Eye, Cookie, Link2, UserCheck, Mail } from 'lucide-react';

const SECTIONS = [
  {
    id: 'data-we-collect',
    icon: Eye,
    title: 'Data We Collect',
    content: [
      {
        subtitle: 'Information You Provide',
        text: 'When you create an account, place an order, or contact our support team, we collect information such as your name, email address, shipping address, and phone number. We also collect any messages or feedback you send us directly.',
      },
      {
        subtitle: 'Payment Information',
        text: 'We collect payment details only to the extent necessary to complete a transaction. All payment processing is handled by Stripe. We do not store your full card number, CVV, or other sensitive payment data on our servers.',
      },
      {
        subtitle: 'Usage Data',
        text: 'We automatically collect information about how you interact with our site — including pages visited, time spent, click patterns, device type, browser, and IP address. This helps us improve performance and personalize your experience.',
      },
    ],
  },
  {
    id: 'how-we-use-data',
    icon: Shield,
    title: 'How We Use Your Data',
    content: [
      {
        subtitle: 'Fulfilling Orders',
        text: 'Your personal information is primarily used to process your orders, arrange shipping, send tracking updates, and handle any returns or exchanges.',
      },
      {
        subtitle: 'Account Management',
        text: 'We use your email to send order confirmations, account notifications, and responses to your support requests. We will never send you unsolicited marketing emails without your explicit consent.',
      },
      {
        subtitle: 'Improving the Platform',
        text: 'Aggregated, anonymized usage data helps us understand which features work well and where we can improve. We use this to prioritize engineering work and enhance the overall shopping experience.',
      },
      {
        subtitle: 'Legal Obligations',
        text: 'In certain cases, we may be required to retain or disclose information to comply with applicable laws, court orders, or regulatory requirements.',
      },
    ],
  },
  {
    id: 'cookies',
    icon: Cookie,
    title: 'Cookies Policy',
    content: [
      {
        subtitle: 'Essential Cookies',
        text: 'These cookies are required for the website to function. They keep you logged in, maintain your shopping cart, and enable secure checkout. You cannot disable essential cookies without affecting site functionality.',
      },
      {
        subtitle: 'Analytics Cookies',
        text: 'We use analytics tools to understand how visitors navigate our site. This data is aggregated and does not identify individual users. You may opt out of analytics cookies via your browser settings.',
      },
      {
        subtitle: 'Preference Cookies',
        text: 'These cookies remember your settings — such as your preferred currency, language, or saved items — so you don\'t have to re-enter them on every visit.',
      },
      {
        subtitle: 'Managing Cookies',
        text: 'You can control cookie settings through your browser preferences. Note that disabling certain cookies may affect the functionality of some features on our site.',
      },
    ],
  },
  {
    id: 'third-party',
    icon: Link2,
    title: 'Third-Party Services',
    content: [
      {
        subtitle: 'Stripe (Payments)',
        text: 'We use Stripe to securely process all payments. When you enter your card details, that information goes directly to Stripe\'s servers. Stripe is PCI DSS Level 1 certified. You can read Stripe\'s privacy policy at stripe.com/privacy.',
      },
      {
        subtitle: 'Cloudinary (Media Storage)',
        text: 'Product images and media files are hosted via Cloudinary. Cloudinary does not have access to your personal data. Only product-related assets are stored there. See cloudinary.com/privacy for their full policy.',
      },
      {
        subtitle: 'Analytics Providers',
        text: 'We may use third-party analytics services to help us understand usage patterns. These providers receive anonymized, aggregated data only and are contractually prohibited from using it for any other purpose.',
      },
    ],
  },
  {
    id: 'your-rights',
    icon: UserCheck,
    title: 'Your Rights',
    content: [
      {
        subtitle: 'Access & Portability',
        text: 'You have the right to request a copy of the personal data we hold about you at any time. We will provide this in a structured, commonly used format within 30 days.',
      },
      {
        subtitle: 'Correction',
        text: 'If any information we hold is inaccurate or incomplete, you can update it directly through your account settings, or contact us and we will correct it promptly.',
      },
      {
        subtitle: 'Deletion',
        text: 'You may request the deletion of your personal data at any time. We will honour this request unless we are legally required to retain certain records (e.g., transaction records for tax purposes).',
      },
      {
        subtitle: 'Opt Out of Marketing',
        text: 'If you have opted in to marketing emails, you can unsubscribe at any time via the link in any email we send. You can also manage preferences in your account settings.',
      },
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-stone-900 py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">Legal</p>
          <h1 className="text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-stone-400 text-lg">We take your privacy seriously. Here's exactly what we collect, why, and how we protect it.</p>
          <p className="text-stone-500 text-sm mt-6">Last updated: June 1, 2026</p>
        </div>
      </section>

      {/* Quick Nav */}
      <section className="border-b border-stone-200 sticky top-0 bg-white z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
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
        {/* Intro */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 mb-14">
          <p className="text-stone-700 leading-relaxed">
            This Privacy Policy explains how <strong>Boutique</strong> ("we," "us," or "our") collects, uses, stores, and protects your personal information when you visit our website or make a purchase. By using our services, you agree to the practices described below. If you have any questions, <Link to="/contact" className="text-amber-700 font-semibold hover:underline">contact us</Link> at any time.
          </p>
        </div>

        <div className="space-y-16">
          {SECTIONS.map(section => (
            <div key={section.id} id={section.id} className="scroll-mt-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <section.icon size={20} className="text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900">{section.title}</h2>
              </div>
              <div className="space-y-6 pl-16">
                {section.content.map(block => (
                  <div key={block.subtitle}>
                    <h3 className="font-semibold text-stone-900 mb-2">{block.subtitle}</h3>
                    <p className="text-stone-600 leading-relaxed">{block.text}</p>
                  </div>
                ))}
              </div>
              <div className="border-b border-stone-100 mt-12" />
            </div>
          ))}
        </div>

        {/* Data Retention */}
        <div className="mt-14">
          <h2 className="text-2xl font-bold text-stone-900 mb-4">Data Retention</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            We retain your personal data for as long as your account is active, or as long as needed to provide our services. If you close your account, we will delete or anonymize your data within 90 days, except where retention is required by law (e.g., financial transaction records are kept for 7 years).
          </p>
        </div>

        {/* Contact */}
        <div className="bg-stone-900 rounded-3xl p-8 text-center mt-14">
          <Mail size={28} className="text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Privacy Questions?</h3>
          <p className="text-stone-400 mb-6">Our team will respond to any privacy-related requests within 30 days.</p>
          <a
            href="mailto:privacy@boutique.com"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-8 py-3 rounded-2xl transition-colors"
          >
            privacy@boutique.com
          </a>
        </div>
      </section>
    </div>
  );
}
