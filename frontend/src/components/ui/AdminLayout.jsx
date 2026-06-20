import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Tag,
  MessageCircle, BarChart3, LogOut, ExternalLink, Menu, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/client';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/discounts', label: 'Discounts', icon: Tag },
  { to: '/admin/chat', label: 'Chat', icon: MessageCircle },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    toast.success('Logged out');
    navigate('/');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-100 flex flex-col transition-all`}> 
        <div className="p-4 border-b border-gray-100 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-900 rounded flex items-center justify-center text-white font-bold">B</div>
            <div className={`${collapsed ? 'hidden' : ''}`}>
              <p className="font-display text-xl font-bold text-brand-700">Boutique</p>
              <p className="text-xs text-gray-500 mt-0.5">Admin Dashboard</p>
            </div>
          </div>
          <button onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand menu' : 'Collapse menu'}
            className="p-2 rounded hover:bg-gray-50 text-gray-500">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              } title={label}>
              <Icon size={18} />
              <span className={`${collapsed ? 'hidden' : ''}`}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1">
          <a href="/" target="_blank" rel="noopener"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <ExternalLink size={18} /> View Store
          </a>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="p-4 border-t border-gray-100">
          <p className={`text-xs font-medium text-gray-900 ${collapsed ? 'hidden' : ''}`}>{user?.firstName} {user?.lastName}</p>
          <p className={`text-xs text-gray-500 ${collapsed ? 'hidden' : ''}`}>{user?.email}</p>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {collapsed && (
          <button onClick={() => setCollapsed(false)} title="Open menu"
            className="absolute z-50 top-4 left-4 bg-white p-2 rounded shadow-md hidden md:block">
            <Menu size={18} />
          </button>
        )}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
