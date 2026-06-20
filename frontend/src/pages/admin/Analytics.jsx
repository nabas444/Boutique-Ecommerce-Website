import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Package, ShoppingCart } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../../api/client';

const PERIOD_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

const PIE_COLORS = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PROCESSING: '#8b5cf6',
  SHIPPED: '#6366f1', DELIVERED: '#10b981', CANCELLED: '#ef4444', REFUNDED: '#6b7280',
};

export default function AdminAnalytics() {
  const [period, setPeriod] = useState(30);

  const { data: overview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.get('/analytics/overview').then(r => r.data.data),
  });

  const { data: revenueData, isLoading: loadingRevenue } = useQuery({
    queryKey: ['analytics-revenue', period],
    queryFn: () => api.get(`/analytics/revenue?period=${period}`).then(r => r.data.data),
  });

  const { data: topProducts } = useQuery({
    queryKey: ['analytics-top-products'],
    queryFn: () => api.get('/analytics/top-products').then(r => r.data.data),
  });

  const { data: statusData } = useQuery({
    queryKey: ['analytics-orders-status'],
    queryFn: () => api.get('/analytics/orders-by-status').then(r => r.data.data),
  });

  const pieData = (statusData || []).map(s => ({
    name: s.status,
    value: s._count.status,
    color: PIE_COLORS[s.status] || '#ccc',
  }));

  const topProductsChart = (topProducts || []).slice(0, 8).map(p => ({
    name: p.product?.name ? p.product.name.slice(0, 16) + (p.product.name.length > 16 ? '...' : '') : 'Unknown',
    sold: p._sum?.quantity || 0,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-stone-900">Analytics</h1>
        <p className="text-stone-400 text-sm mt-1">Store performance overview</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${Number(overview?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Total Orders', value: (overview?.totalOrders || 0).toLocaleString(), icon: ShoppingCart, color: 'text-blue-600' },
          { label: 'Last 30d Revenue', value: `$${Number(overview?.last30Days?.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-purple-600' },
          { label: 'Last 30d Orders', value: (overview?.last30Days?.orders || 0).toLocaleString(), icon: Package, color: 'text-amber-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-stone-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={16} className={color} />
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-2xl font-bold text-stone-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-stone-900">Revenue Over Time</h2>
            <p className="text-xs text-stone-400 mt-0.5">Daily revenue trend</p>
          </div>
          <div className="flex bg-stone-100 rounded-xl p-1 gap-1">
            {PERIOD_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === opt.value ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          {loadingRevenue ? (
            <div className="h-full bg-stone-50 rounded-xl animate-pulse" />
          ) : (revenueData || []).length === 0 ? (
            <div className="h-full flex items-center justify-center text-stone-300 text-sm">No revenue data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a8a29e' }}
                  tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => [`$${Number(v).toFixed(2)}`, 'Revenue']}
                  labelFormatter={d => new Date(d).toLocaleDateString()}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="#1c1917" strokeWidth={2.5}
                  dot={false} activeDot={{ r: 5, fill: '#1c1917' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top products bar chart */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <h2 className="font-semibold text-stone-900 mb-5">Top Products by Units Sold</h2>
          <div className="h-56">
            {topProductsChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-stone-300 text-sm">No sales data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsChart} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#a8a29e' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#57534e' }} width={100} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: 12 }} />
                  <Bar dataKey="sold" fill="#1c1917" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Orders by status pie chart */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <h2 className="font-semibold text-stone-900 mb-5">Orders by Status</h2>
          <div className="h-56">
            {pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-stone-300 text-sm">No order data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: 12 }} />
                  <Legend formatter={(v) => <span style={{ fontSize: 11, color: '#78716c' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top products table */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <h2 className="font-semibold text-stone-900 mb-5">Top 10 Products — Detailed</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                {['Rank', 'Product', 'Units Sold', 'Revenue'].map(h => (
                  <th key={h} className="text-left pb-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {(topProducts || []).length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-sm text-stone-400">No data available</td></tr>
              ) : (topProducts || []).slice(0, 10).map((item, i) => (
                <tr key={item.productId} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3 pr-4">
                    <span className={`text-sm font-bold ${i < 3 ? 'text-amber-500' : 'text-stone-300'}`}>#{i + 1}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                        {item.product?.images?.[0]?.url
                          ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Package size={13} className="text-stone-300" /></div>}
                      </div>
                      <p className="text-sm font-medium text-stone-900">{item.product?.name || 'Unknown'}</p>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-sm font-semibold text-stone-900">{item._sum?.quantity || 0}</p>
                  </td>
                  <td className="py-3">
                    <p className="text-sm font-semibold text-stone-900">
                      ${Number(item.revenue || 0).toFixed(2)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
