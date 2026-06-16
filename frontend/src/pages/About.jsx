import { Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import {
  Heart,
  Sparkles,
  Leaf,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const VALUES = [
  {
    icon: Heart,
    title: "Customer First",
    desc: "Every decision we make starts with a simple question: does this make the customer's experience better?",
  },
  {
    icon: Sparkles,
    title: "Curated Quality",
    desc: "We hand-pick every piece in our catalog. If we wouldn't wear it ourselves, we won't sell it.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    desc: "We partner with brands that prioritize ethical manufacturing and sustainable materials.",
  },
  {
    icon: Users,
    title: "Inclusive Sizing",
    desc: "Fashion is for everyone. We offer a wide range of sizes and styles that celebrate every body type.",
  },
];

const TEAM = [
  {
    name: "Natnael Abebe",
    role: "Founder & CEO",
    img: "https://images.unsplash.com/photo-1627401632925-a4c565d08a80?q=80&w=436&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bio: "Passionate about making premium fashion accessible to everyone.",
  },
  {
    name: "Nolawi Sintayehu",
    role: "Head of Fashion",
    img: "https://images.unsplash.com/photo-1614023342667-6f060e9d1e04?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bio: "Leads product selection and curates our seasonal collections.",
  },
  {
    name: "Robel Abell",
    role: "Lead Developer",
    img: "https://images.unsplash.com/photo-1654110455429-cf322b40a906?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bio: "Full-stack engineer responsible for building and maintaining the platform.",
  },
  {
    name: "Tebibu Solomon",
    role: "Product Manager",
    img: "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bio: "Drives product strategy, roadmaps, and feature prioritization.",
  },
  {
    name: "Yohannes Abegaz",
    role: "Operations Manager",
    img: "https://plus.unsplash.com/premium_photo-1689977968861-9c91dbb16049?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bio: "Oversees logistics, supply chain, and day-to-day operations.",
  },
  {
    name: "Emilia Gezahegn",
    role: "Marketing Lead",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=388&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bio: "Leads brand, growth, and customer acquisition efforts.",
  },
  {
    name: "Ruhama Getahun",
    role: "Senior Designer",
    img: "https://images.unsplash.com/photo-1662104935883-e9dd0619eaba?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bio: "Designs product imagery, campaigns, and visual identity.",
  },
];

const MILESTONES = [
  {
    year: "2023",
    title: "The Idea",
    desc: "Boutique was born from frustration with cluttered, overwhelming fashion sites.",
  },
  {
    year: "2024",
    title: "First Launch",
    desc: "We launched with 50 curated products and 200 customers in the first week.",
  },
  {
    year: "2025",
    title: "Growing Fast",
    desc: "Crossed 10,000 orders and expanded our catalog to 500+ products.",
  },
  {
    year: "2026",
    title: "Today",
    desc: "Serving thousands of fashion-forward customers with new arrivals weekly.",
  },
];

export default function About() {
  const teamRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = teamRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    updateScrollState();
    const el = teamRef.current;
    if (!el) return;
    const handler = () => updateScrollState();
    el.addEventListener("scroll", handler);
    window.addEventListener("resize", handler);
    return () => {
      el.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-stone-900 py-28 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&q=85"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">
            Our Story
          </p>
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Fashion that
            <br />
            <span className="text-amber-400">means something.</span>
          </h1>
          <p className="text-stone-300 text-lg leading-relaxed max-w-xl mx-auto">
            Boutique was built for people who care about what they wear — and
            want a simpler, more honest way to shop for it.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold text-amber-600 tracking-widest uppercase mb-3">
              Our Mission
            </p>
            <h2 className="text-4xl font-bold text-stone-900 mb-5">
              Curated fashion,
              <br />
              zero compromise.
            </h2>
            <p className="text-stone-600 leading-relaxed mb-4">
              We started Boutique because we were tired of fashion sites that
              overwhelm you with thousands of mediocre options. We believe in
              doing less, better.
            </p>
            <p className="text-stone-600 leading-relaxed">
              Every product in our catalog is hand-selected by our fashion team.
              We only carry items we believe in — pieces that combine great
              design, quality materials, and fair pricing.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img
              src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80"
              alt="Fashion"
              className="rounded-3xl object-cover aspect-square"
            />
            <img
              src="https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=400&q=80"
              alt="Fashion"
              className="rounded-3xl object-cover aspect-square mt-6"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-stone-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-stone-400 tracking-widest uppercase mb-2 text-center">
            What We Stand For
          </p>
          <h2 className="text-4xl font-bold text-stone-900 mb-10 text-center">
            Our Values
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-3xl p-6 flex gap-4"
              >
                <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <v.icon size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 mb-2">{v.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <p className="text-xs font-semibold text-stone-400 tracking-widest uppercase mb-2 text-center">
          How We Got Here
        </p>
        <h2 className="text-4xl font-bold text-stone-900 mb-10 text-center">
          Our Journey
        </h2>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-stone-200" />
          <div className="space-y-8">
            {MILESTONES.map((m) => (
              <div key={m.year} className="flex gap-8 items-start pl-4">
                <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center flex-shrink-0 relative z-10">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                </div>
                <div className="pb-4">
                  <span className="text-xs font-bold text-amber-600 tracking-widest">
                    {m.year}
                  </span>
                  <h3 className="font-bold text-stone-900 mt-1 mb-1">
                    {m.title}
                  </h3>
                  <p className="text-stone-600 text-sm">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-stone-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-stone-400 tracking-widest uppercase mb-2 text-center">
            The People
          </p>
          <h2 className="text-4xl font-bold text-stone-900 mb-10 text-center">
            Meet the Team
          </h2>
          <div className="relative">
            <button
              aria-label="Scroll left"
              id="team-left"
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-white rounded-full shadow-lg hover:scale-105 transition-transform ${"opacity-90"}`}
              style={{ display: canScrollLeft ? "block" : "none" }}
              onClick={() => {
                const el = teamRef.current;
                if (!el) return;
                const amt = Math.round(el.clientWidth * 0.6);
                el.scrollBy({ left: -amt, behavior: "smooth" });
              }}
            >
              <ChevronLeft size={20} />
            </button>

            <div
              ref={teamRef}
              className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth py-3 px-4"
              style={{ scrollSnapType: "x mandatory" }}
              onScroll={() => updateScrollState()}
            >
              {TEAM.map((t) => (
                <div
                  key={t.name}
                  className="bg-white rounded-3xl p-6 text-center min-w-[220px] flex-shrink-0 scroll-mx-4"
                  style={{ scrollSnapAlign: "center" }}
                >
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                  />
                  <h3 className="font-bold text-stone-900">{t.name}</h3>
                  <p className="text-amber-600 text-xs font-semibold tracking-wide uppercase mb-3">
                    {t.role}
                  </p>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    {t.bio}
                  </p>
                </div>
              ))}
            </div>

            <button
              aria-label="Scroll right"
              id="team-right"
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-white rounded-full shadow-lg hover:scale-105 transition-transform ${"opacity-90"}`}
              style={{ display: canScrollRight ? "block" : "none" }}
              onClick={() => {
                const el = teamRef.current;
                if (!el) return;
                const amt = Math.round(el.clientWidth * 0.6);
                el.scrollBy({ left: amt, behavior: "smooth" });
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-900 py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to shop?</h2>
          <p className="text-stone-400 mb-8">
            Discover our latest collection — no account needed to browse.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-10 py-4 rounded-2xl transition-colors"
            >
              Shop Now
            </Link>
            <Link
              to="/contact"
              className="border border-stone-600 text-stone-300 hover:text-white font-medium px-10 py-4 rounded-2xl transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
