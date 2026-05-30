import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Package, Heart, MapPin, Edit2, Check, X } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setAuth, accessToken } = useAuthStore();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/me').then(r => r.data.data),
  });
  const profile = profileData || user;

  async function handleSave() {
    setSaving(true);
    try {
      const { data } = await api.put('/users/me', form);
      setAuth(data.data, accessToken);
      qc.invalidateQueries(['profile']);
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  }

  const stats = [
    { icon: Package, label: 'Orders', value: profile?._count?.orders || 0, to: '/orders' },
    { icon: Heart, label: 'Wishlist', value: profile?._count?.wishlist || 0, to: '/wishlist' },
    { icon: MapPin, label: 'Addresses', value: profile?.addresses?.length || 0 },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-stone-900 mb-8">My Profile</h1>

      {/* Avatar + stats */}
      <div className="bg-white rounded-3xl border border-stone-100 p-8 mb-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-stone-900 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {profile?.firstName?.[0]}{profile?.lastName?.[0]}
          </div>
          <div>
            <p className="text-xl font-bold text-stone-900">{profile?.firstName} {profile?.lastName}</p>
            <p className="text-stone-400 text-sm">{profile?.email}</p>
            <p className="text-xs text-stone-300 mt-1">Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—'}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center bg-stone-50 rounded-2xl py-4">
              <Icon size={18} className="text-stone-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-stone-900">{value}</p>
              <p className="text-xs text-stone-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Edit form */}
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1.5 block">First name</label>
                <input value={form.firstName} onChange={e => setForm(p => ({...p, firstName: e.target.value}))}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1.5 block">Last name</label>
                <input value={form.lastName} onChange={e => setForm(p => ({...p, lastName: e.target.value}))}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Phone</label>
              <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                placeholder="+1 234 567 8900"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-50">
                <Check size={16} /> {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button onClick={() => setEditing(false)}
                className="flex items-center gap-2 border border-stone-200 text-stone-600 px-5 py-2.5 rounded-xl text-sm hover:bg-stone-50 transition-colors">
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: 'Full name', value: `${profile?.firstName} ${profile?.lastName}` },
              { label: 'Email', value: profile?.email },
              { label: 'Phone', value: profile?.phone || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-3 border-b border-stone-50 last:border-0">
                <span className="text-sm text-stone-400">{label}</span>
                <span className="text-sm font-medium text-stone-900">{value}</span>
              </div>
            ))}
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 mt-4 transition-colors">
              <Edit2 size={15} /> Edit profile
            </button>
          </div>
        )}
      </div>

      {/* Saved addresses */}
      <div className="bg-white rounded-3xl border border-stone-100 p-6">
        <h2 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
          <MapPin size={16} className="text-stone-400" /> Saved Addresses
        </h2>
        {profile?.addresses?.length === 0 ? (
          <p className="text-sm text-stone-400">No addresses saved yet. Add one at checkout.</p>
        ) : (
          <div className="space-y-3">
            {profile?.addresses?.map(addr => (
              <div key={addr.id} className="flex items-start justify-between p-4 bg-stone-50 rounded-xl">
                <div className="text-sm">
                  <p className="font-semibold text-stone-800">{addr.label} {addr.isDefault && <span className="text-xs text-emerald-600 font-normal ml-1">(Default)</span>}</p>
                  <p className="text-stone-500">{addr.line1}{addr.line2 && `, ${addr.line2}`}</p>
                  <p className="text-stone-500">{addr.city}{addr.postalCode && `, ${addr.postalCode}`}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
