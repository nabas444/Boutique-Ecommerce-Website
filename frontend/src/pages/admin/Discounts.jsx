import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Tag, Trash2, X, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

function DiscountModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    code: '', description: '', type: 'PERCENT', value: '',
    minOrder: '', usesLimit: '', isActive: true, expiresAt: '',
  });
  const [saving, setSaving] = useState(false);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  async function handleSave() {
    if (!form.code || !form.value) { toast.error('Code and value are required'); return; }
    setSaving(true);
    try {
      await api.post('/discounts', {
        ...form,
        value: parseFloat(form.value),
        minOrder: form.minOrder ? parseFloat(form.minOrder) : undefined,
        usesLimit: form.usesLimit ? parseInt(form.usesLimit) : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      });
      toast.success('Discount code created');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create discount');
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <h2 className="font-semibold text-stone-900">New Discount Code</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">Code *</label>
            <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
              placeholder="WELCOME10" maxLength={20}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-stone-900 uppercase" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">Description</label>
            <input value={form.description} onChange={set('description')} placeholder="10% off for new customers"
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">Type *</label>
              <select value={form.type} onChange={set('type')}
                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900">
                <option value="PERCENT">Percent (%)</option>
                <option value="FIXED">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">
                Value {form.type === 'PERCENT' ? '(%)' : '($)'} *
              </label>
              <input type="number" value={form.value} onChange={set('value')} placeholder={form.type === 'PERCENT' ? '10' : '20'} step="0.01"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">Min Order ($)</label>
              <input type="number" value={form.minOrder} onChange={set('minOrder')} placeholder="100"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">Max Uses</label>
              <input type="number" value={form.usesLimit} onChange={set('usesLimit')} placeholder="Unlimited"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">Expires At</label>
            <input type="datetime-local" value={form.expiresAt} onChange={set('expiresAt')}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.isActive ? 'bg-stone-900' : 'bg-stone-200'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm font-medium text-stone-700">Active immediately</span>
          </label>
        </div>
        <div className="flex gap-3 px-6 py-5 border-t border-stone-100">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
            {saving ? 'Creating...' : 'Create Code'}
          </button>
          <button onClick={onClose} className="border border-stone-200 text-stone-600 px-6 py-2.5 rounded-xl text-sm hover:bg-stone-50 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDiscounts() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-discounts'],
    queryFn: () => api.get('/discounts').then(r => r.data.data),
  });

  const discounts = data || [];

  async function toggleActive(id, current) {
    try {
      await api.patch(`/discounts/${id}`, { isActive: !current });
      qc.invalidateQueries(['admin-discounts']);
      toast.success(current ? 'Discount deactivated' : 'Discount activated');
    } catch { toast.error('Failed to update'); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this discount code?')) return;
    try {
      await api.delete(`/discounts/${id}`);
      qc.invalidateQueries(['admin-discounts']);
      toast.success('Discount deleted');
    } catch { toast.error('Delete failed'); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-900">Discount Codes</h1>
          <p className="text-stone-400 text-sm mt-1">{discounts.length} codes total</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors">
          <Plus size={18} /> New Code
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Codes', value: discounts.length },
          { label: 'Active', value: discounts.filter(d => d.isActive).length },
          { label: 'Total Uses', value: discounts.reduce((s, d) => s + d.usesCount, 0) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-stone-100 p-5 text-center">
            <p className="text-2xl font-bold text-stone-900">{value}</p>
            <p className="text-xs text-stone-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-stone-100">
              {['Code', 'Type / Value', 'Min Order', 'Uses', 'Expires', 'Status', ''].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-stone-100 rounded animate-pulse" /></td>)}</tr>
              ))
            ) : discounts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <Tag size={40} className="text-stone-200 mx-auto mb-3" />
                  <p className="text-sm text-stone-400">No discount codes yet</p>
                </td>
              </tr>
            ) : discounts.map(d => {
              const expired = d.expiresAt && new Date(d.expiresAt) < new Date();
              const limitReached = d.usesLimit && d.usesCount >= d.usesLimit;
              return (
                <tr key={d.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-mono font-bold text-stone-900 text-sm">{d.code}</p>
                    {d.description && <p className="text-xs text-stone-400 mt-0.5">{d.description}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-semibold ${d.type === 'PERCENT' ? 'text-purple-700' : 'text-blue-700'}`}>
                      {d.type === 'PERCENT' ? `${d.value}% off` : `$${d.value} off`}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-stone-600">
                    {d.minOrder ? `$${d.minOrder}` : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-stone-700">{d.usesCount}{d.usesLimit ? `/${d.usesLimit}` : ''}</p>
                    {limitReached && <p className="text-xs text-red-500">Limit reached</p>}
                  </td>
                  <td className="px-5 py-4 text-sm text-stone-600">
                    {d.expiresAt ? (
                      <span className={expired ? 'text-red-500' : 'text-stone-600'}>
                        {new Date(d.expiresAt).toLocaleDateString()}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleActive(d.id, d.isActive)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${d.isActive && !expired && !limitReached ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                      {d.isActive && !expired && !limitReached ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      {d.isActive && !expired && !limitReached ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleDelete(d.id)}
                      className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <DiscountModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); qc.invalidateQueries(['admin-discounts']); }}
        />
      )}
    </div>
  );
}
