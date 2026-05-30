import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, MessageCircle, User, LogOut, Menu, X, Search, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import api from '../../api/client';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { label: 'Shop All', to: '/products' },
  { label: 'Women', to: '/products?category=women' },
  { label: 'Men', to: '/products?category=men' },
  { label: 'Shoes', to: '/products?category=shoes' },
  { label: 'Accessories', to: '/products?category=accessories' },
];

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const itemCount = useCartStore(s => s.itemCount());

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Close user menu on outside click
  useEffect(() => {
    function handle(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  async function handleLogout() {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    setUserMenuOpen(false);
    toast.success('Logged out successfully');
    navigate('/');
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!searchQ.trim()) return;
    navigate(`/products?q=${encodeURIComponent(searchQ.trim())}`);
    setSearchOpen(false);
    setSearchQ('');
  }

  // When guest clicks a protected action, send to login with return path
  function requireAuth(to) {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: to } });
    } else {
      navigate(to);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">

      {/* Announcement bar */}
      <div className="bg-stone-900 text-stone-200 text-xs text-center py-2 px-4 tracking-wide">
        Free shipping on orders over $100 · Use code <span className="text-amber-400 font-semibold">WELCOME10</span> for 10% off
      </div>

      {/* ── Main Navbar ── */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="font-display text-2xl font-bold text-stone-900 tracking-tight flex-shrink-0">
              Boutique
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <Link key={link.label} to={link.to}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname + location.search === link.to
                      ? 'text-stone-900 bg-stone-100'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1">

              {/* Search */}
              <div className="relative" ref={searchRef}>
                <button onClick={() => setSearchOpen(p => !p)}
                  className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors">
                  <Search size={20} />
                </button>
                {searchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl p-3 z-50">
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <input
                        autoFocus
                        value={searchQ}
                        onChange={e => setSearchQ(e.target.value)}
                        placeholder="Search products..."
                        className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                      />
                      <button type="submit" className="bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors">
                        Go
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Wishlist — guest can click, will redirect to login */}
              <button onClick={() => requireAuth('/wishlist')}
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors hidden sm:flex">
                <Heart size={20} />
              </button>

              {/* Chat — same */}
              <button onClick={() => requireAuth('/chat')}
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors hidden sm:flex">
                <MessageCircle size={20} />
              </button>

              {/* Cart — guests can browse but checkout requires login */}
              <button onClick={() => requireAuth('/cart')}
                className="relative p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors">
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Auth: user menu OR login/signup buttons */}
              {isAuthenticated() ? (
                <div className="relative ml-1" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(p => !p)}
                    className="flex items-center gap-2 pl-3 pr-2 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-xl transition-colors border border-stone-200">
                    <div className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <span className="hidden sm:block max-w-24 truncate">{user?.firstName}</span>
                    <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-stone-100 rounded-2xl shadow-xl py-2 z-50">
                      <div className="px-4 py-2.5 border-b border-stone-100 mb-1">
                        <p className="text-sm font-semibold text-stone-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-stone-400 truncate">{user?.email}</p>
                      </div>
                      {[
                        { label: 'My Profile', to: '/profile', icon: User },
                        { label: 'My Orders', to: '/orders', icon: ShoppingBag },
                        { label: 'Wishlist', to: '/wishlist', icon: Heart },
                        { label: 'Support Chat', to: '/chat', icon: MessageCircle },
                      ].map(({ label, to, icon: Icon }) => (
                        <Link key={to} to={to}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors">
                          <Icon size={15} className="text-stone-400" /> {label}
                        </Link>
                      ))}
                      {isAdmin() && (
                        <Link to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 font-medium border-t border-stone-100 mt-1 transition-colors">
                          Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-stone-100 mt-1 transition-colors">
                        <LogOut size={15} /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 ml-2">
                  <Link to="/login"
                    className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-xl border border-stone-200 transition-colors">
                    Sign in
                  </Link>
                  <Link to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors">
                    Join
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button className="md:hidden p-2 text-stone-500 hover:bg-stone-50 rounded-lg ml-1"
                onClick={() => setMobileOpen(p => !p)}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-stone-100 bg-white px-4 py-4 space-y-1">
            {NAV_LINKS.map(link => (
              <Link key={link.label} to={link.to}
                className="block px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-xl transition-colors">
                {link.label}
              </Link>
            ))}
            <div className="border-t border-stone-100 pt-3 mt-3 space-y-1">
              {!isAuthenticated() ? (
                <>
                  <Link to="/login" className="block px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-xl">Sign in</Link>
                  <Link to="/register" className="block px-3 py-2.5 text-sm font-medium text-white bg-stone-900 rounded-xl text-center">Join Boutique</Link>
                </>
              ) : (
                <>
                  <Link to="/orders" className="block px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 rounded-xl">My Orders</Link>
                  <Link to="/wishlist" className="block px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 rounded-xl">Wishlist</Link>
                  <Link to="/chat" className="block px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 rounded-xl">Support Chat</Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl">Sign out</button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            <div className="col-span-2">
              <p className="font-display text-2xl font-bold text-white mb-3">Boutique</p>
              <p className="text-sm text-stone-400 max-w-xs leading-relaxed">
                Premium fashion curated for the modern wardrobe. Quality pieces that stand the test of time.
              </p>
            </div>
            {[
              { title: 'Shop', links: ['All Products', 'Women', 'Men', 'Shoes', 'Accessories'] },
              { title: 'Help', links: ['FAQ', 'Shipping', 'Returns', 'Size Guide', 'Contact Us'] },
              { title: 'Company', links: ['About', 'Careers', 'Press', 'Privacy Policy', 'Terms'] },
            ].map(col => (
              <div key={col.title}>
                <p className="font-semibold text-white mb-4 text-sm">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-sm text-stone-400 hover:text-white transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-stone-500">© {new Date().getFullYear()} Boutique. All rights reserved.</p>
            <p className="text-xs text-stone-500">Free shipping · Secure payments · Easy returns</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
