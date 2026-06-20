import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, ArrowRight, ArrowUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/client';

const STATUS_STYLES = {
  PENDING:    { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  CONFIRMED:  { bg: 'bg-blue-50',  text: 'text-blue-700',  dot: 'bg-blue-400' },
  PROCESSING: { bg: 'bg-purple-50',text: 'text-purple-700',dot: 'bg-purple-400' },
  SHIPPED:    { bg: 'bg-indigo-50',text: 'text-indigo-700',dot: 'bg-indigo-400' },
  DELIVERED:  { bg: 'bg-emerald-50',text: 'text-emerald-700',dot: 'bg-emerald-400' },
  CANCELLED:  { bg: 'bg-red-50',   text: 'text-red-700',   dot: 'bg-red-400' },
};

export default function AdminDashboard() {
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.get('/analytics/overview').then(r => r.data.data),
  });

  const { data: revenueChart } = useQuery({
    queryKey: ['analytics-revenue-30'],
    queryFn: () => api.get('/analytics/revenue?period=30').then(r => r.data.data),
  });

  const { data: topProducts } = useQuery({
    queryKey: ['analytics-top-products'],
    queryFn: () => api.get('/analytics/top-products').then(r => r.data.data),
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['orders-recent'],
    queryFn: () => api.get('/orders?limit=5').then(r => r.data.data.orders),
  });

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${Number(overview?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      sub: `$${Number(overview?.last30Days?.revenue || 0).toLocaleString()} last 30d`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Total Orders',
      value: overview?.totalOrders?.toLocaleString() || '0',
      sub: `${overview?.last30Days?.orders || 0} last 30d`,
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Customers',
      value: overview?.totalUsers?.toLocaleString() || '0',
      sub: 'registered accounts',
      icon: Users,
      color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Live Products',
      value: overview?.totalProducts?.toLocaleString() || '0',
      sub: 'published products',
      icon: Package,
      color: 'bg-amber-50 text-amber-700',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-400 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-stone-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-stone-500">{label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
            </div>
            {loadingOverview ? (
              <div className="h-7 bg-stone-200 rounded animate-pulse w-24 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-stone-900">{value}</p>
            )}
            <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
              <ArrowUp size={10} className="text-emerald-500" /> {sub}
            </p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-stone-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-stone-900">Revenue — Last 30 Days</h2>
            <p className="text-sm text-stone-400 mt-0.5">Daily revenue trend</p>
          </div>
          <TrendingUp size={20} className="text-stone-300" />
        </div>
        <div className="h-56">
          {revenueChart?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChart} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1efe9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a8a29e' }}
                  tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Revenue']}
                  labelFormatter={d => new Date(d).toLocaleDateString()}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="#1c1917" strokeWidth={2}
                  dot={false} activeDot={{ r: 5, fill: '#1c1917' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-stone-300">
              <p className="text-sm">No revenue data yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-stone-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {(recentOrders || []).length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-6">No orders yet</p>
            ) : (recentOrders || []).map(order => {
              const s = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
              return (
                <Link key={order.id} to="/admin/orders"
                  className="flex items-center justify-between py-2.5 hover:bg-stone-50 rounded-xl px-2 -mx-2 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-stone-900">#{order.id.slice(0,8).toUpperCase()}</p>
                    <p className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${s.bg} ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {order.status}
                    </span>
                    <span className="font-semibold text-stone-900 text-sm">${Number(order.total).toFixed(2)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-stone-900">Top Products</h2>
            <Link to="/admin/products" className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {(topProducts || []).length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-6">No sales data yet</p>
            ) : (topProducts || []).slice(0, 5).map((item, i) => (
              <div key={item.productId} className="flex items-center gap-3">
                <span className="text-xs font-bold text-stone-300 w-5">{i + 1}</span>
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                  {item.product?.images?.[0]?.url
                    ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package size={14} className="text-stone-300" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{item.product?.name || 'Unknown'}</p>
                  <p className="text-xs text-stone-400">{item._sum?.quantity || 0} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
