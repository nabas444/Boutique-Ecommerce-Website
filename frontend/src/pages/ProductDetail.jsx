import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  Shield,
  ChevronRight,
  Minus,
  Plus,
  Share2,
} from "lucide-react";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import ProductCard from "../components/product/ProductCard";
import toast from "react-hot-toast";
import useNotificationStore from "../store/notificationStore";

function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={16}
            className={
              i <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-stone-200 fill-stone-200"
            }
          />
        ))}
      </div>
      <span className="text-sm font-semibold text-stone-700">
        {Number(rating).toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-sm text-stone-400">({count} reviews)</span>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const qc = useQueryClient();
  const { incWishlist, decWishlist } = useNotificationStore();

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => api.get(`/products/${slug}`).then((r) => r.data.data),
  });

  if (isLoading)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-16 animate-pulse">
          <div className="space-y-4">
            <div className="aspect-square bg-stone-200 rounded-2xl" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-20 h-20 bg-stone-200 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-stone-200 rounded w-1/3" />
            <div className="h-8 bg-stone-200 rounded w-3/4" />
            <div className="h-6 bg-stone-200 rounded w-1/4" />
            <div className="h-24 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    );

  if (error || !data)
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="font-display text-2xl text-stone-700 mb-4">
          Product not found
        </p>
        <Link
          to="/products"
          className="text-stone-600 hover:text-stone-900 underline"
        >
          Back to shop
        </Link>
      </div>
    );

  const product = data;
  const images = product.images || [];

  // Get unique colors & sizes
  const colors = [
    ...new Map(
      product.variants?.filter((v) => v.color).map((v) => [v.color, v]),
    ).values(),
  ];
  const sizes = selectedColor
    ? product.variants?.filter((v) => v.color === selectedColor && v.isActive)
    : product.variants?.filter((v) => v.isActive);
  const uniqueSizes = [...new Set(sizes?.map((v) => v.size).filter(Boolean))];

  const selectedVariant = product.variants?.find(
    (v) =>
      (!selectedColor || v.color === selectedColor) &&
      (!selectedSize || v.size === selectedSize),
  );

  const inStock = selectedVariant
    ? selectedVariant.stock > 0
    : product.variants?.some((v) => v.stock > 0);
  const stockCount = selectedVariant?.stock || 0;

  async function handleAddToCart() {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: `/products/${slug}` } });
      return;
    }
    if (!selectedVariant) {
      toast.error("Please select size and color");
      return;
    }
    setAdding(true);
    try {
      await addItem(selectedVariant.id, qty);
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error("Could not add to cart");
    } finally {
      setAdding(false);
    }
  }

  async function handleWishlist() {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: `/products/${slug}` } });
      return;
    }
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${product.id}`);
        setWishlisted(false);
        qc.invalidateQueries(["wishlist"]);
        decWishlist();
        toast.success("Removed from wishlist");
      } else {
        await api.post(`/wishlist/${product.id}`);
        setWishlisted(true);
        qc.invalidateQueries(["wishlist"]);
        incWishlist();
        toast.success("Saved to wishlist");
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-stone-400 mb-8">
          <Link to="/" className="hover:text-stone-700">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link to="/products" className="hover:text-stone-700">
            Products
          </Link>
          {product.category && (
            <>
              <ChevronRight size={14} />
              <Link
                to={`/products?category=${product.category.slug}`}
                className="hover:text-stone-700"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={14} />
          <span className="text-stone-600 font-medium truncate max-w-40">
            {product.name}
          </span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">
          {/* ── Images ── */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-stone-100 relative">
              {images[activeImage] ? (
                <img
                  src={images[activeImage].url}
                  alt={images[activeImage].alt || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-200">
                  <ShoppingBag size={80} />
                </div>
              )}
              {discount && (
                <span className="absolute top-4 left-4 bg-red-500 text-white font-bold text-sm px-3 py-1 rounded-xl">
                  -{discount}%
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? "border-stone-900" : "border-transparent hover:border-stone-300"}`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ── */}
          <div>
            <p className="text-sm text-stone-400 mb-1">
              {product.category?.name}
            </p>
            <h1 className="font-display text-4xl font-bold text-stone-900 mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            {product.avgRating && (
              <div className="mb-4">
                <StarRating
                  rating={product.avgRating}
                  count={product.reviewCount}
                />
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-stone-900">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.comparePrice && (
                <span className="text-xl text-stone-400 line-through">
                  ${Number(product.comparePrice).toFixed(2)}
                </span>
              )}
              {discount && (
                <span className="text-red-500 font-semibold text-sm">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Color selector */}
            {colors.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-stone-700 mb-2.5">
                  Color{" "}
                  {selectedColor && (
                    <span className="font-normal text-stone-500">
                      — {selectedColor}
                    </span>
                  )}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((v) => (
                    <button
                      key={v.color}
                      onClick={() => {
                        setSelectedColor(
                          v.color === selectedColor ? null : v.color,
                        );
                        setSelectedSize(null);
                      }}
                      title={v.color}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === v.color ? "border-stone-900 scale-110" : "border-stone-200"}`}
                      style={{ backgroundColor: v.colorHex || "#ccc" }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {uniqueSizes.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-stone-700 mb-2.5">
                  Size{" "}
                  {selectedSize && (
                    <span className="font-normal text-stone-500">
                      — {selectedSize}
                    </span>
                  )}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {uniqueSizes.map((size) => {
                    const v = product.variants?.find(
                      (v) =>
                        v.size === size &&
                        (!selectedColor || v.color === selectedColor),
                    );
                    const available = v?.stock > 0;
                    return (
                      <button
                        key={size}
                        onClick={() =>
                          available &&
                          setSelectedSize(size === selectedSize ? null : size)
                        }
                        disabled={!available}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                          selectedSize === size
                            ? "border-stone-900 bg-stone-900 text-white"
                            : available
                              ? "border-stone-200 text-stone-700 hover:border-stone-400"
                              : "border-stone-100 text-stone-300 cursor-not-allowed line-through"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {selectedVariant && stockCount <= 5 && stockCount > 0 && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">
                    Only {stockCount} left in stock!
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <p className="text-sm font-semibold text-stone-700">Quantity</p>
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-2.5 hover:bg-stone-50 transition-colors text-stone-600"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2.5 font-semibold text-stone-900 min-w-12 text-center">
                  {qty}
                </span>
                <button
                  onClick={() =>
                    setQty((q) => Math.min(stockCount || 99, q + 1))
                  }
                  className="px-4 py-2.5 hover:bg-stone-50 transition-colors text-stone-600"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={adding || !inStock}
                className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : !inStock ? (
                  "Out of Stock"
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleWishlist}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${wishlisted ? "border-red-400 bg-red-50" : "border-stone-200 hover:border-stone-400"}`}
              >
                <Heart
                  size={20}
                  className={
                    wishlisted ? "fill-red-500 text-red-500" : "text-stone-400"
                  }
                />
              </button>
              <button className="w-14 h-14 rounded-2xl border-2 border-stone-200 hover:border-stone-400 flex items-center justify-center flex-shrink-0 transition-colors">
                <Share2 size={20} className="text-stone-400" />
              </button>
            </div>

            {/* Perks */}
            <div className="bg-stone-50 rounded-2xl p-5 space-y-3 mb-8">
              {[
                { icon: Truck, text: "Free shipping on orders over $100" },
                { icon: RotateCcw, text: "Free returns within 30 days" },
                { icon: Shield, text: "Secure checkout with Stripe" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-sm text-stone-600"
                >
                  <Icon size={16} className="text-stone-400 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/products?q=${tag}`}
                    className="text-xs text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-1 rounded-full transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs: Description / Reviews ── */}
        <div className="mt-20 border-b border-stone-100">
          <div className="flex gap-8">
            {["description", "reviews", "care"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-semibold capitalize border-b-2 transition-colors -mb-px ${activeTab === tab ? "border-stone-900 text-stone-900" : "border-transparent text-stone-400 hover:text-stone-700"}`}
              >
                {tab}{" "}
                {tab === "reviews" &&
                  product.reviewCount > 0 &&
                  `(${product.reviewCount})`}
              </button>
            ))}
          </div>
        </div>

        <div className="py-10 max-w-3xl">
          {activeTab === "description" && (
            <div className="prose prose-stone">
              <p className="text-stone-600 leading-relaxed text-base">
                {product.description}
              </p>
              {product.material && (
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div className="bg-stone-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                      Material
                    </p>
                    <p className="text-sm text-stone-700">{product.material}</p>
                  </div>
                  {product.careInfo && (
                    <div className="bg-stone-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                        Care
                      </p>
                      <p className="text-sm text-stone-700">
                        {product.careInfo}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <ReviewsTab
              productId={product.id}
              avgRating={product.avgRating}
              reviewCount={product.reviewCount}
            />
          )}

          {activeTab === "care" && (
            <div className="text-stone-600 text-sm leading-relaxed space-y-2">
              <p>
                {product.careInfo ||
                  "Please refer to garment label for care instructions."}
              </p>
            </div>
          )}
        </div>

        {/* ── Related products ── */}
        {product.related?.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-3xl font-bold text-stone-900 mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {product.related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewsTab({ productId, avgRating, reviewCount }) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ rating: 5, title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () =>
      api.get(`/reviews/product/${productId}`).then((r) => r.data.data),
  });

  async function submitReview(e) {
    e.preventDefault();
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (form.body.length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/reviews/product/${productId}`, form);
      toast.success("Review submitted!");
      refetch();
      setForm({ rating: 5, title: "", body: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {avgRating && (
        <div className="flex items-center gap-6 p-6 bg-stone-50 rounded-2xl">
          <div className="text-center">
            <p className="text-5xl font-bold text-stone-900">
              {Number(avgRating).toFixed(1)}
            </p>
            <StarRating rating={avgRating} />
            <p className="text-sm text-stone-400 mt-1">{reviewCount} reviews</p>
          </div>
        </div>
      )}

      {/* Review form */}
      <div className="border border-stone-100 rounded-2xl p-6">
        <h3 className="font-semibold text-stone-900 mb-4">Write a Review</h3>
        {!isAuthenticated() ? (
          <p className="text-sm text-stone-500">
            <button
              onClick={() => navigate("/login")}
              className="text-stone-900 font-medium underline"
            >
              Sign in
            </button>{" "}
            to leave a review.
          </p>
        ) : (
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <p className="text-sm font-medium text-stone-700 mb-2">
                Your Rating
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, rating: i }))}
                  >
                    <Star
                      size={24}
                      className={
                        i <= form.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-stone-200 fill-stone-200"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Review title (optional)"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            <textarea
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              placeholder="Share your experience with this product..."
              rows={4}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-stone-900 text-white font-medium px-6 py-2.5 rounded-xl text-sm hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
      </div>

      {/* Reviews list */}
      <div className="space-y-5">
        {(data?.reviews || []).map((review) => (
          <div
            key={review.id}
            className="border border-stone-100 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-sm font-bold text-stone-600">
                  {review.user.firstName[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">
                    {review.user.firstName} {review.user.lastName}
                  </p>
                  {review.verifiedPurchase && (
                    <span className="text-xs text-emerald-600 font-medium">
                      ✓ Verified Purchase
                    </span>
                  )}
                </div>
              </div>
              <StarRating rating={review.rating} />
            </div>
            {review.title && (
              <p className="font-semibold text-stone-800 mb-1">
                {review.title}
              </p>
            )}
            <p className="text-stone-600 text-sm leading-relaxed">
              {review.body}
            </p>
            <p className="text-xs text-stone-300 mt-3">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
