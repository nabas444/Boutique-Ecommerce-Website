import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Package, X, Check } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const EMPTY_PRODUCT = {
  name: '', description: '', price: '', comparePrice: '', categoryId: '',
  tags: '', material: '', careInfo: '', isPublished: false, isFeatured: false,
  variants: [{ size: '', color: '', colorHex: '#000000', sku: '', stock: 0, priceModifier: 0 }],
};

function ProductModal({ product, categories, onClose, onSaved }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState(isEdit ? {
    ...product,
    price: String(product.price),
    comparePrice: product.comparePrice ? String(product.comparePrice) : '',
    tags: product.tags?.join(', ') || '',
  } : EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));
  const setVariant = (i, field, val) => setForm(p => ({
    ...p,
    variants: p.variants.map((v, idx) => idx === i ? { ...v, [field]: val } : v),
  }));
  const addVariant = () => setForm(p => ({ ...p, variants: [...p.variants, { size: '', color: '', colorHex: '#000000', sku: '', stock: 0, priceModifier: 0 }] }));
  const removeVariant = (i) => setForm(p => ({ ...p, variants: p.variants.filter((_, idx) => idx !== i) }));

  async function handleSave() {
    if (!form.name || !form.price || !form.categoryId) { toast.error('Name, price and category are required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        variants: form.variants.map(v => ({ ...v, stock: parseInt(v.stock), priceModifier: parseFloat(v.priceModifier || 0) })),
      };
      if (isEdit) {
        await api.put(`/products/${product.id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl my-8 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">{isEdit ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 block">Product Name *</label>
              <input value={form.name} onChange={set('name')} placeholder="Classic White Sneakers"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 block">Price ($) *</label>
              <input type="number" value={form.price} onChange={set('price')} placeholder="89.99" step="0.01"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 block">Compare Price ($)</label>
              <input type="number" value={form.comparePrice} onChange={set('comparePrice')} placeholder="120.00" step="0.01"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 block">Category *</label>
              <select value={form.categoryId} onChange={set('categoryId')}
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 block">Description *</label>
              <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Describe the product..."
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 block">Material</label>
              <input value={form.material} onChange={set('material')} placeholder="100% Cotton"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 block">Tags (comma-separated)</label>
              <input value={form.tags} onChange={set('tags')} placeholder="casual, summer, cotton"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            {[
              { field: 'isPublished', label: 'Published' },
              { field: 'isFeatured', label: 'Featured' },
            ].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2.5 cursor-pointer select-none">
                <div onClick={() => setForm(p => ({ ...p, [field]: !p[field] }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${form[field] ? 'bg-stone-900' : 'bg-stone-200'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[field] ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-medium text-stone-700">{label}</span>
              </label>
            ))}
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Variants</label>
              <button onClick={addVariant} className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-50 transition-colors">
                <Plus size={13} /> Add variant
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {form.variants.map((v, i) => (
                <div key={i} className="grid grid-cols-6 gap-2 p-3 bg-stone-50 rounded-xl items-center">
                  <input value={v.size} onChange={e => setVariant(i, 'size', e.target.value)} placeholder="Size"
                    className="col-span-1 border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white" />
                  <input value={v.color} onChange={e => setVariant(i, 'color', e.target.value)} placeholder="Color"
                    className="col-span-1 border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white" />
                  <input value={v.sku} onChange={e => setVariant(i, 'sku', e.target.value)} placeholder="SKU *"
                    className="col-span-2 border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white" />
                  <input type="number" value={v.stock} onChange={e => setVariant(i, 'stock', e.target.value)} placeholder="Stock"
                    className="col-span-1 border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white" />
                  <button onClick={() => removeVariant(i)} disabled={form.variants.length === 1}
                    className="col-span-1 flex justify-center text-stone-300 hover:text-red-500 transition-colors disabled:opacity-30">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-5 border-t border-stone-100">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button onClick={onClose} className="border border-stone-200 text-stone-600 px-6 py-2.5 rounded-xl text-sm hover:bg-stone-50 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalProduct, setModalProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: () => api.get('/products', { params: { q: search || undefined, limit: 50 } }).then(r => r.data.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
  });

  const products = data?.products || [];
  const categories = categoriesData || [];

  async function togglePublish(product) {
    try {
      await api.put(`/products/${product.id}`, { isPublished: !product.isPublished });
      qc.invalidateQueries(['admin-products']);
      toast.success(product.isPublished ? 'Product unpublished' : 'Product published');
    } catch { toast.error('Failed to update'); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}`);
      qc.invalidateQueries(['admin-products']);
      toast.success('Product deleted');
    } catch { toast.error('Delete failed'); }
  }

  function openCreate() { setModalProduct(null); setShowModal(true); }
  function openEdit(p) { setModalProduct(p); setShowModal(true); }
  function closeModal() { setShowModal(false); setModalProduct(null); }
  function onSaved() { closeModal(); qc.invalidateQueries(['admin-products']); }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-900">Products</h1>
          <p className="text-stone-400 text-sm mt-1">{products.length} products total</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors">
          <Plus size={18} /> New Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">Product</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden md:table-cell">Category</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">Price</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden sm:table-cell">Stock</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-stone-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-stone-400">
                  <Package size={40} className="mx-auto mb-3 text-stone-200" />
                  <p className="text-sm">No products found</p>
                </td>
              </tr>
            ) : products.map(product => {
              const totalStock = product.variants?.reduce((s, v) => s + v.stock, 0) || 0;
              const primaryImage = product.images?.find(i => i.isPrimary) || product.images?.[0];
              return (
                <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                        {primaryImage
                          ? <img src={primaryImage.url} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Package size={14} className="text-stone-300" /></div>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-900 truncate max-w-40">{product.name}</p>
                        <p className="text-xs text-stone-400">{product.variants?.length || 0} variants</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-stone-600">{product.category?.name || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">${Number(product.price).toFixed(2)}</p>
                      {product.comparePrice && (
                        <p className="text-xs text-stone-400 line-through">${Number(product.comparePrice).toFixed(2)}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className={`text-sm font-medium ${totalStock === 0 ? 'text-red-500' : totalStock < 10 ? 'text-amber-600' : 'text-stone-700'}`}>
                      {totalStock}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => togglePublish(product)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${product.isPublished ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
                      {product.isPublished ? <><Eye size={11} /> Live</> : <><EyeOff size={11} /> Draft</>}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(product)}
                        className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(product.id)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ProductModal
          product={modalProduct}
          categories={categories}
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
