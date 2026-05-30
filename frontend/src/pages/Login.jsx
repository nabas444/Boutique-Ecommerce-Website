import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  function validate() {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setAuth(data.data.user, data.data.accessToken);
      toast.success(`Welcome back, ${data.data.user.firstName}!`);
      navigate(data.data.user.role === 'ADMIN' ? '/admin' : from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      setErrors({ general: msg });
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-stone-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-3xl font-bold text-stone-900">Boutique</Link>
          <h1 className="text-2xl font-semibold text-stone-800 mt-6 mb-2">Welcome back</h1>
          <p className="text-stone-500 text-sm">Sign in to access your account</p>
          {from && from !== '/' && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl mt-4 px-4 py-2">
              You need to sign in to continue
            </p>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
          {errors.general && (
            <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{errors.general}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email address</label>
              <input type="email" value={form.email}
                onChange={e => { setForm(p => ({...p, email: e.target.value})); setErrors(p => ({...p, email: ''})); }}
                className={`w-full border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 transition ${errors.email ? 'border-red-400' : 'border-stone-200'}`}
                placeholder="you@example.com" autoComplete="email" />
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-medium text-stone-700">Password</label>
                <a href="#" className="text-xs text-stone-500 hover:text-stone-800">Forgot password?</a>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => { setForm(p => ({...p, password: e.target.value})); setErrors(p => ({...p, password: ''})); }}
                  className={`w-full border rounded-xl px-4 py-3 pr-11 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 transition ${errors.password ? 'border-red-400' : 'border-stone-200'}`}
                  placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign in</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3 text-center">Demo credentials</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Admin', email: 'admin@boutique.com', pass: 'Admin@1234' },
                { label: 'Customer', email: 'customer@example.com', pass: 'Customer@1234' },
              ].map(cred => (
                <button key={cred.label} type="button"
                  onClick={() => setForm({ email: cred.email, password: cred.pass })}
                  className="text-left p-3 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors">
                  <p className="text-xs font-semibold text-stone-700">{cred.label}</p>
                  <p className="text-xs text-stone-400 mt-0.5 truncate">{cred.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-stone-500">
          Don't have an account?{' '}
          <Link to="/register" state={location.state} className="text-stone-900 font-semibold hover:underline">Create one free</Link>
        </p>
        <p className="mt-3 text-center">
          <Link to="/products" className="text-sm text-stone-400 hover:text-stone-600">← Continue browsing without signing in</Link>
        </p>
      </div>
    </div>
  );
}
