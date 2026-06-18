import { useNavigate, Link } from "react-router-dom";
import bkg from "../assets/bkg.png";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import api from "../api/client";
import ProductCard from "../components/product/ProductCard";

const CATEGORIES = [
  {
    label: "Women",
    slug: "women",
    emoji: "👗",
    bg: "bg-rose-50",
    text: "text-rose-700",
    img: "https://images.unsplash.com/photo-1604242247663-d45abecadfd3?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    label: "Men",
    slug: "men",
    emoji: "👔",
    bg: "bg-blue-50",
    text: "text-blue-700",
    img: "https://images.unsplash.com/photo-1630173250799-2813d34ed14b?q=80&w=465&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    label: "Shoes",
    slug: "shoes",
    emoji: "👟",
    bg: "bg-amber-50",
    text: "text-amber-700",
    img: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    label: "Accessories",
    slug: "accessories",
    emoji: "👜",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    img: "https://images.unsplash.com/photo-1506169894395-36397e4aaee4?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const PERKS = [
  { icon: Truck, title: "Free Shipping", desc: "On all orders over $100" },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    desc: "30-day hassle-free returns",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    desc: "Stripe-powered checkout",
  },
  { icon: Star, title: "Premium Quality", desc: "Curated, handpicked pieces" },
];

export default function Home() {
  const navigate = useNavigate();

  const { data: featuredData } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () =>
      api.get("/products?isFeatured=true&limit=8").then((r) => r.data.data),
  });

  const { data: newArrivalsData } = useQuery({
    queryKey: ["products", "new"],
    queryFn: () =>
      api.get("/products?sortBy=newest&limit=4").then((r) => r.data.data),
  });

  const featured = featuredData?.products || [];
  const newArrivals = newArrivalsData?.products || [];

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative h-[92vh] min-h-[600px] overflow-hidden bg-stone-900 flex items-center">
        <div className="absolute inset-0">
          {/* 🔆 Brighter: opacity-75 instead of opacity-50 */}
          <img
            src={bkg}
            alt="Hero"
            className="w-full h-full object-cover opacity-95"
          />
          {/*
            Amazon-style gradient: heavy dark on the left where text lives,
            fades to near-transparent on the right so the image breathes.
            The via stop is pushed darker (stone-900/60) to keep text sharp
            against the now-brighter image.
          */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/75 via-stone-900/35 to-stone-900/0" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={16} className="text-amber-300" />
              <span className="text-amber-300 text-sm font-semibold tracking-widest uppercase drop-shadow-sm">
                New Season 2026
              </span>
            </div>

            {/*
              Heading: drop-shadow gives the letters a crisp dark halo so they
              stay punchy even as the background gets brighter behind them.
            */}
            <h1
              className="font-display text-6xl sm:text-7xl font-bold text-white leading-[1.05] mb-6"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}
            >
              Dress
              <br />
              <span className="text-amber-400">Your</span>
              <br />
              Story.
            </h1>

            {/* Body copy: white instead of stone-300 for better contrast */}
            <p
              className="text-white/90 text-lg mb-10 leading-relaxed"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}
            >
              Premium fashion for every occasion. Discover handpicked pieces
              that define your style — no account needed to explore.
            </p>

            <div className="flex flex-wrap gap-4">
              {/* Primary CTA — solid white, unchanged */}
              <button
                onClick={() => navigate("/products")}
                className="flex items-center gap-2 bg-white text-stone-900 font-semibold px-8 py-4 rounded-2xl hover:bg-amber-50 transition-colors text-sm leading-none shadow-lg"
              >
                <span className="self-center">Shop Collection</span>
                <ArrowRight size={18} className="self-center inline-block" />
              </button>

              {/*
                Secondary CTA: border bumped to white/50 and background to
                white/15 so it reads against the brighter image.
              */}
              <button
                onClick={() => navigate("/products?isFeatured=true")}
                className="flex items-center gap-2 border border-white/50 bg-white/15 text-white font-medium px-8 py-4 rounded-2xl hover:bg-white/25 transition-colors text-sm leading-none backdrop-blur-sm"
              >
                <span className="self-center">Featured Picks</span>
                <ArrowRight size={18} className="self-center inline-block" />
              </button>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <div className="w-px h-10 bg-white/20 animate-pulse" />
        </div>
      </section>

      {/* ── Perks bar ── */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-stone-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">
                    {title}
                  </p>
                  <p className="text-xs text-stone-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-stone-400 tracking-widest uppercase mb-2">
              Browse by
            </p>
            <h2 className="font-display text-4xl font-bold text-stone-900">
              Category
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] block"
            >
              <img
                src={cat.img}
                alt={cat.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="font-display text-2xl font-bold text-white">
                  {cat.label}
                </p>
                <p className="text-white/70 text-sm mt-1 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Shop now <ArrowRight size={13} />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured products ── */}
      <section className="bg-stone-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold text-stone-400 tracking-widest uppercase mb-2">
                Hand-picked
              </p>
              <h2 className="font-display text-4xl font-bold text-stone-900">
                Featured Pieces
              </h2>
            </div>
            <Link
              to="/products?isFeatured=true"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1"
            >
              See all <ArrowRight size={15} />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="aspect-[3/4] bg-stone-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-stone-200 rounded w-2/3" />
                    <div className="h-4 bg-stone-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── New arrivals banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-semibold text-amber-600 tracking-widest uppercase mb-3">
              Just dropped
            </p>
            <h2 className="font-display text-5xl font-bold text-stone-900 leading-tight mb-5">
              New
              <br />
              Arrivals
            </h2>
            <p className="text-stone-500 text-lg mb-8 leading-relaxed">
              Fresh styles added weekly. Be the first to discover the latest
              trends and limited drops.
            </p>
            <Link
              to="/products?sortBy=newest"
              className="inline-flex items-center gap-2 bg-stone-900 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-stone-800 transition-colors text-sm"
            >
              Explore New Arrivals <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(newArrivals.length ? newArrivals : []).map((product, i) =>
              product.id ? (
                <ProductCard key={product.id} product={product} compact />
              ) : (
                <div
                  key={i}
                  className="bg-stone-100 rounded-2xl aspect-square animate-pulse"
                />
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="bg-stone-900 py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Sparkles size={28} className="text-amber-400 mx-auto mb-6" />
          <h2 className="font-display text-5xl font-bold text-white mb-5">
            Get 10% Off Your First Order
          </h2>
          <p className="text-stone-400 text-lg mb-8">
            Join Boutique and unlock exclusive member deals, early access to new
            drops, and free shipping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-10 py-4 rounded-2xl transition-colors text-sm"
            >
              Create Free Account
            </Link>
            <Link
              to="/products"
              className="border border-stone-700 text-stone-300 hover:text-white hover:border-stone-500 font-medium px-10 py-4 rounded-2xl transition-colors text-sm"
            >
              Browse First
            </Link>
          </div>
          <p className="text-stone-500 text-xs mt-5">
            No credit card required · Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}
