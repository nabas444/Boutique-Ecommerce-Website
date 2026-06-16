import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Search,
  Sparkles,
} from "lucide-react";
import api from "../api/client";
import ProductCard from "../components/product/ProductCard";

const SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone-100 pb-5 mb-5">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <span className="text-sm font-semibold text-stone-800">{title}</span>
        <ChevronDown
          size={16}
          className={`text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && children}
    </div>
  );
}

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [aiSearch, setAiSearch] = useState("");
  const [aiMode, setAiMode] = useState(false);

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sortBy = searchParams.get("sortBy") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sizes = searchParams.get("sizes") || "";
  const page = Number(searchParams.get("page")) || 1;

  // Sync search input
  useEffect(() => {
    if (q) setAiSearch(q);
  }, [q]);

  // Scroll to top when page changes
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {}
  }, [page]);

  const params = { page, limit: 16, sortBy };
  if (q) params.q = q;
  if (category) params.category = category;
  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;
  if (sizes) params.sizes = sizes;

  const aiFlag = searchParams.get("ai");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["products", params, aiFlag],
    queryFn: () => {
      if (aiFlag) {
        console.debug("AI search triggered", { q, aiFlag });
        return api
          .get("/products/search", { params: { q } })
          .then((r) => {
            console.debug("AI search response", r.data);
            // backend returns array for AI search; normalize to { products, pagination }
            return { products: r.data.data || [], pagination: null };
          })
          .catch((err) => {
            console.error("AI search error", err);
            return { products: [], pagination: null };
          });
      }

      return api
        .get("/products", { params })
        .then((r) => r.data.data)
        .catch((err) => {
          console.error("Products fetch error", err);
          return { products: [], pagination: null };
        });
    },
    keepPreviousData: true,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data.data),
  });

  const products = data?.products || [];
  const pagination = data?.pagination;
  const categories = categoriesData || [];

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== "")
      next.set(key, String(value));
    else next.delete(key);
    // reset pagination when changing filters (but keep page when explicitly setting it)
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  }

  function toggleSize(size) {
    const current = sizes ? sizes.split(",") : [];
    const next = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    setParam("sizes", next.join(","));
  }

  function clearFilters() {
    setSearchParams({});
    setAiSearch("");
    setAiMode(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    setParam("q", aiSearch.trim());
    if (aiSearch.trim()) setAiMode(true);
  }

  const activeFilterCount = [category, minPrice, maxPrice, sizes, q].filter(
    Boolean,
  ).length;

  const FilterPanel = () => (
    <div className="space-y-0">
      {/* Search */}
      <FilterSection title="Search">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={aiSearch}
            onChange={(e) => setAiSearch(e.target.value)}
            placeholder="Search with AI..."
            className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
          <button
            type="submit"
            className="bg-stone-900 text-white px-3 py-2 rounded-xl"
          >
            <Search size={16} />
          </button>
        </form>
        {aiMode && q && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg">
            <Sparkles size={12} /> AI search active
          </div>
        )}
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category">
        <div className="space-y-1">
          <button
            onClick={() => setParam("category", "")}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${!category ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-50"}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setParam("category", cat.slug)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${category === cat.slug ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-50"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setParam("minPrice", e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
          <span className="text-stone-300">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setParam("maxPrice", e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
          />
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => {
            const active = sizes.split(",").includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${active ? "bg-stone-900 text-white border-stone-900" : "border-stone-200 text-stone-600 hover:border-stone-400"}`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl border border-red-100 transition-colors"
        >
          <X size={14} /> Clear all filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-900">
            {category
              ? categories.find((c) => c.slug === category)?.name || "Products"
              : q
                ? `Results for "${q}"`
                : "All Products"}
          </h1>
          {pagination && (
            <p className="text-stone-400 text-sm mt-1">
              {pagination.total} products
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setParam("sortBy", e.target.value)}
            className="border border-stone-200 rounded-xl px-4 py-2 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 hidden sm:block"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 border border-stone-200 rounded-xl px-4 py-2 text-sm text-stone-700 bg-white"
          >
            <SlidersHorizontal size={16} />
            Filters{" "}
            {activeFilterCount > 0 && (
              <span className="bg-stone-900 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar filters */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <FilterPanel />
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden animate-pulse"
                >
                  <div className="aspect-[3/4] bg-stone-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-stone-200 rounded w-2/3" />
                    <div className="h-4 bg-stone-200 rounded w-full" />
                    <div className="h-4 bg-stone-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-display text-2xl font-bold text-stone-700 mb-2">
                No products found
              </h3>
              <p className="text-stone-400 mb-6">
                Try adjusting your filters or search query.
              </p>
              <button
                onClick={clearFilters}
                className="bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div
                className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 transition-opacity ${isFetching ? "opacity-60" : ""}`}
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    disabled={page <= 1}
                    onClick={() => setParam("page", page - 1)}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setParam("page", i + 1)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${page === i + 1 ? "bg-stone-900 text-white" : "border border-stone-200 text-stone-600 hover:bg-stone-50"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setParam("page", page + 1)}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <h3 className="font-semibold text-stone-900">Filters</h3>
              <button onClick={() => setFiltersOpen(false)}>
                <X size={20} className="text-stone-400" />
              </button>
            </div>
            <div className="p-5">
              <FilterPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
