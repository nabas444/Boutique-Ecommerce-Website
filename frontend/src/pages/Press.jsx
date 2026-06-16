import { Link } from 'react-router-dom';
import { Download, ArrowRight, Mail, ExternalLink } from 'lucide-react';

const PRESS_MENTIONS = [
  {
    outlet: 'TechCrunch',
    date: 'March 2025',
    headline: 'How Boutique Is Redefining Minimal Fashion E-Commerce',
    excerpt: 'In a market saturated with overwhelming catalogs, Boutique took a counterintuitive approach: stock less, curate harder. The result is a shopping experience that feels more like a trusted stylist than a warehouse.',
    logo: 'TC',
    color: 'bg-green-600',
    url: '#',
  },
  {
    outlet: 'Forbes',
    date: 'January 2025',
    headline: 'The Ethiopian Startup Making Waves in Online Fashion',
    excerpt: 'Founded in Addis Ababa, Boutique has quietly grown to tens of thousands of customers with no outside funding. Their secret? Obsessive quality control and a brand voice that resonates with a new generation of conscious shoppers.',
    logo: 'F',
    color: 'bg-blue-700',
    url: '#',
  },
  {
    outlet: 'Vogue Business',
    date: 'November 2024',
    headline: 'Emerging Platforms That Are Changing How Africa Shops',
    excerpt: 'Boutique earns its spot on this list not through hype but execution. The platform\'s hand-curated catalog and clean UX are setting a new standard for fashion retail in the region.',
    logo: 'VB',
    color: 'bg-stone-900',
    url: '#',
  },
];

const ASSETS = [
  { name: 'Logo Pack (SVG + PNG)', size: '2.4 MB', type: 'ZIP' },
  { name: 'Brand Guidelines', size: '4.1 MB', type: 'PDF' },
  { name: 'Product Photography', size: '18 MB', type: 'ZIP' },
  { name: 'Founder Headshots', size: '6.2 MB', type: 'ZIP' },
];

const FACTS = [
  { value: '10,000+', label: 'Happy Customers' },
  { value: '500+', label: 'Curated Products' },
  { value: '2023', label: 'Founded' },
  { value: '4.9★', label: 'Average Rating' },
];

export default function Press() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-stone-900 py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">Newsroom</p>
          <h1 className="text-6xl font-bold text-white mb-6">
            Boutique<br />
            <span className="text-amber-400">in the Press</span>
          </h1>
          <p className="text-stone-400 text-lg max-w-xl mx-auto">
            Coverage, resources, and everything journalists and partners need to tell our story.
          </p>
        </div>
      </section>

      {/* Fast Facts */}
      <section className="bg-amber-500 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {FACTS.map(f => (
            <div key={f.label}>
              <p className="text-3xl font-bold text-stone-900">{f.value}</p>
              <p className="text-stone-800 text-sm font-medium mt-1">{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Press Mentions */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <p className="text-xs font-semibold text-stone-400 tracking-widest uppercase mb-2">Coverage</p>
        <h2 className="text-4xl font-bold text-stone-900 mb-10">Recent Mentions</h2>
        <div className="space-y-5">
          {PRESS_MENTIONS.map(item => (
            <div key={item.outlet} className="border border-stone-200 rounded-3xl p-6 hover:border-stone-400 transition-colors">
              <div className="flex items-start gap-5">
                <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-xs font-bold">{item.logo}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-stone-900">{item.outlet}</span>
                    <span className="text-stone-400 text-xs">·</span>
                    <span className="text-stone-400 text-xs">{item.date}</span>
                  </div>
                  <h3 className="font-semibold text-stone-900 mb-2 leading-snug">{item.headline}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed mb-4">{item.excerpt}</p>
                  <a href={item.url} className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                    Read Article <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Press Kit & Brand Assets */}
      <section className="bg-stone-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-stone-400 tracking-widest uppercase mb-2">Resources</p>
          <h2 className="text-4xl font-bold text-stone-900 mb-4">Press Kit & Brand Assets</h2>
          <p className="text-stone-500 mb-10 leading-relaxed">
            Everything you need to cover Boutique accurately. Please review our brand guidelines before publishing logos or imagery.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {ASSETS.map(asset => (
              <div key={asset.name} className="bg-white border border-stone-200 rounded-3xl p-5 flex items-center justify-between hover:border-stone-400 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-stone-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 text-xs font-bold">{asset.type}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 text-sm">{asset.name}</p>
                    <p className="text-stone-400 text-xs">{asset.size}</p>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-stone-900 flex items-center justify-center transition-colors">
                  <Download size={14} className="text-stone-500 group-hover:text-amber-400 transition-colors" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Contact */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-stone-900 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">Press Enquiries</p>
            <h2 className="text-3xl font-bold text-white mb-3">Get in Touch</h2>
            <p className="text-stone-400 leading-relaxed max-w-md">
              For interview requests, fact-checking, or any press-related questions, reach out directly. We aim to respond within one business day.
            </p>
          </div>
          <div className="flex-shrink-0 text-center md:text-right">
            <p className="text-stone-400 text-sm mb-3">Media contact</p>
            <a
              href="mailto:press@boutique.com"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-8 py-4 rounded-2xl transition-colors"
            >
              <Mail size={18} />
              press@boutique.com
            </a>
          </div>
        </div>
      </section>

      {/* About Boutique blurb for press */}
      <section className="bg-stone-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-amber-600 tracking-widest uppercase mb-3">Boilerplate</p>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">About Boutique</h2>
          <p className="text-stone-600 leading-relaxed mb-4">
            Boutique is a premium online fashion retailer founded in 2023 and headquartered in Addis Ababa, Ethiopia. The company curates a hand-selected catalog of clothing and accessories, offering a streamlined alternative to traditional multi-brand fashion platforms.
          </p>
          <p className="text-stone-600 leading-relaxed mb-6">
            With a focus on quality, sustainability, and inclusive sizing, Boutique serves thousands of customers with new arrivals added weekly. The company operates a fully integrated e-commerce platform powered by secure Stripe payments and real-time order tracking.
          </p>
          <Link to="/about" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900 hover:text-amber-600 transition-colors">
            Read Our Full Story <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
