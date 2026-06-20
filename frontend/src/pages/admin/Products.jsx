import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Star,
  X,
  Check,
} from "lucide-react";
import api from "../../api/client";
import toast from "react-hot-toast";

const EMPTY_PRODUCT = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  categoryId: "",
  tags: "",
  material: "",
  isPublished: false,
  isFeatured: false,
  variants: [{ size: "", color: "", sku: "", stock: 0, priceModifier: 0 }],
};

function generateSku(name) {
  return (
    String(name || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .substring(0, 20) +
    "-" +
    Date.now().toString().slice(-4)
  );
}

function ProductModal({ product, categories, onClose, onSaved }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState(
    isEdit
      ? {
          ...product,
          price: String(product.price ?? ""),
          comparePrice: product.comparePrice
            ? String(product.comparePrice)
            : "",
          tags: (product.tags || []).join(", "),
        }
      : EMPTY_PRODUCT,
  );
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [images, setImages] = useState(product?.images || []);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const setVariant = (i, field, val) =>
    setForm((p) => ({
      ...p,
      variants: p.variants.map((v, idx) =>
        idx === i ? { ...v, [field]: val } : v,
      ),
    }));

  const addVariant = () =>
    setForm((p) => ({
      ...p,
      variants: [
        ...p.variants,
        { size: "", color: "", sku: "", stock: 0, priceModifier: 0 },
      ],
    }));
  const removeVariant = (i) =>
    setForm((p) => ({
      ...p,
      variants: p.variants.filter((_, idx) => idx !== i),
    }));

  async function saveProduct() {
    if (!form.name || !form.price || !form.categoryId) {
      toast.error("Name, price and category are required");
      return null;
    }
    setSaving(true);
    try {
      // build payload with validated/defaulted fields per backend schema
      const payload = {
        name: form.name,
        description:
          form.description && String(form.description).trim() !== ""
            ? form.description
            : "No description",
        price: parseFloat(form.price),
        comparePrice:
          parseFloat(form.comparePrice) || parseFloat(form.price) * 1.3,
        categoryId: form.categoryId,
        isFeatured: form.isFeatured || false,
        isPublished: form.isPublished ?? true,
        tags: form.tags
          ? String(form.tags)
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        variants: (form.variants || []).map((v) => {
          const sku =
            v.sku && String(v.sku).trim() !== ""
              ? String(v.sku).trim()
              : String(form.name || "")
                  .toUpperCase()
                  .replace(/[^A-Z0-9]+/g, "-")
                  .substring(0, 20) +
                "-" +
                Date.now().toString().slice(-4);
          return {
            size: v.size || undefined,
            color: v.color || undefined,
            sku,
            stock: parseInt(v.stock) || 0,
            priceModifier: parseFloat(v.priceModifier) || 0,
            isActive: true,
          };
        }),
      };

      const res = isEdit
        ? await api.put(`/products/${product.id}`, payload)
        : await api.post(`/products`, payload);
      toast.success(isEdit ? "Product updated" : "Product created");
      const saved = res.data?.data || res.data;
      return saved;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndMaybeUpload() {
    const saved = await saveProduct();
    if (!saved) return;
    // upload images if any
    if (imageFiles && imageFiles.length > 0) {
      try {
        const fm = new FormData();
        imageFiles.forEach((f) => fm.append("images", f));
        const token = localStorage.getItem("token");
        await api.post(`/products/${saved.id}/images`, fm, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Images uploaded");
        // refresh images
        const refreshed = await api.get(`/products/${saved.id}`);
        setImages(refreshed.data?.data?.images || []);
      } catch (err) {
        toast.error("Image upload failed");
      }
    }
    onSaved(saved);
  }

  async function markPrimary(img) {
    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `/products/${product.id}/images/${img.id}`,
        { isPrimary: true },
        { headers: { Authorization: token ? `Bearer ${token}` : undefined } },
      );
      const refreshed = await api.get(`/products/${product.id}`);
      setImages(refreshed.data?.data?.images || []);
    } catch {
      toast.error("Failed to mark primary");
    }
  }

  async function deleteImage(img) {
    if (!confirm("Delete this image?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/products/${product.id}/images/${img.id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      setImages((s) => s.filter((i) => i.id !== img.id));
    } catch {
      toast.error("Failed to delete image");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">
            {isEdit ? "Edit Product" : "New Product"}
          </h3>
          <button onClick={onClose} className="p-2">
            <X />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-medium">Name *</label>
              <input
                value={form.name}
                onChange={set("name")}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Price *</label>
              <input
                type="number"
                value={form.price}
                onChange={set("price")}
                step="0.01"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Compare Price</label>
              <input
                type="number"
                value={form.comparePrice}
                onChange={set("comparePrice")}
                step="0.01"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-medium">Category *</label>
              <select
                value={form.categoryId}
                onChange={set("categoryId")}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={set("description")}
                rows={3}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Material</label>
              <input
                value={form.material}
                onChange={set("material")}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">Tags</label>
              <input
                value={form.tags}
                onChange={set("tags")}
                placeholder="a, b"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                  <div>
                    <p className="font-semibold text-stone-800">
                      Featured Product
                    </p>
                    <p className="text-sm text-stone-500">
                      Show this product on the home page featured section
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isFeatured || false}
                    onChange={(e) =>
                      setForm({ ...form, isFeatured: e.target.checked })
                    }
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                  <div>
                    <p className="font-semibold text-stone-800">Published</p>
                    <p className="text-sm text-stone-500">
                      Make this product visible to customers
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isPublished ?? true}
                    onChange={(e) =>
                      setForm({ ...form, isPublished: e.target.checked })
                    }
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Variants</h4>
              <button
                onClick={addVariant}
                className="text-sm px-2 py-1 border rounded inline-flex items-center"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-2 mt-2">
              {(form.variants || []).map((v, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center"
                >
                  <input
                    value={v.size}
                    onChange={(e) => setVariant(i, "size", e.target.value)}
                    placeholder="Size"
                    className="col-span-1 sm:col-span-1 border rounded px-2 py-1"
                  />
                  <input
                    value={v.color}
                    onChange={(e) => setVariant(i, "color", e.target.value)}
                    placeholder="Color"
                    className="col-span-1 sm:col-span-1 border rounded px-2 py-1"
                  />
                  <input
                    value={v.sku}
                    onChange={(e) => setVariant(i, "sku", e.target.value)}
                    placeholder="SKU"
                    className="col-span-1 sm:col-span-2 border rounded px-2 py-1"
                  />
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => setVariant(i, "stock", e.target.value)}
                    placeholder="Stock"
                    className="col-span-1 sm:col-span-1 border rounded px-2 py-1"
                  />
                  <button
                    onClick={() => removeVariant(i)}
                    className="col-span-1 sm:col-span-1 text-red-500"
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium">
              Images (upload after save)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
              className="mt-2"
            />
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-6 gap-2">
              {images?.map((img) => (
                <div key={img.id} className="border rounded p-1 relative">
                  <img
                    src={img.url}
                    alt=""
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="absolute top-1 right-1 flex gap-1">
                    <button
                      title="Primary"
                      onClick={() => markPrimary(img)}
                      className="bg-white p-1 rounded shadow"
                    >
                      <Star
                        className={
                          img.isPrimary ? "text-yellow-400" : "text-gray-400"
                        }
                      />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => deleteImage(img)}
                      className="bg-white p-1 rounded shadow text-red-500"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSaveAndMaybeUpload}
            disabled={saving}
            className="px-4 py-2 bg-slate-900 text-white rounded"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", search],
    queryFn: () =>
      api
        .get(
          `/products?limit=100&isPublished=${encodeURIComponent(search ? "" : "")}`,
        )
        .then((r) => r.data.data),
  });

  const categories =
    useQuery({
      queryKey: ["admin-cats"],
      queryFn: () => api.get("/categories").then((r) => r.data.data),
    }).data || [];

  const products = useMemo(() => data?.products || [], [data]);

  function openCreate() {
    setEditing(null);
    setShowModal(true);
  }
  function openEdit(p) {
    setEditing(p);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditing(null);
  }

  async function onSaved(saved) {
    closeModal();
    qc.invalidateQueries(["admin-products"]);
    if (saved?.id) {
      try {
        await api.get(`/products/${saved.id}`);
      } catch {}
    }
  }

  async function togglePublish(p) {
    try {
      await api.put(`/products/${p.id}`, { isPublished: !p.isPublished });
      qc.invalidateQueries(["admin-products"]);
      toast.success("Updated");
    } catch {
      toast.error("Failed");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      qc.invalidateQueries(["admin-products"]);
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-500">{products.length} products</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openCreate}
            className="px-3 py-2 bg-slate-900 text-white rounded inline-flex items-center gap-2"
          >
            <Plus /> New
          </button>
        </div>
      </div>

      <div className="max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-10 pr-3 py-2 border rounded w-full"
          />
        </div>
      </div>

      <div className="bg-white border rounded overflow-x-auto">
        <table className="w-full table-auto min-w-[720px]">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 hidden md:table-cell">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 hidden sm:table-cell">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  No products
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const stock = (p.variants || []).reduce(
                  (s, v) => s + (v.stock || 0),
                  0,
                );
                const primary =
                  (p.images || []).find((i) => i.isPrimary) || p.images?.[0];
                return (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                        {primary ? (
                          <img
                            src={primary.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">
                          {p.variants?.length || 0} variants
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {p.category?.name || "—"}
                    </td>
                    <td className="px-4 py-3">${Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{stock}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublish(p)}
                        className="px-2 py-1 rounded bg-gray-100 text-xs"
                      >
                        {p.isPublished ? (
                          <>
                            <Eye /> Live
                          </>
                        ) : (
                          <>
                            <EyeOff /> Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-2 py-1 mr-2"
                      >
                        <Edit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-2 py-1 text-red-500"
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ProductModal
          product={editing}
          categories={categories}
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
