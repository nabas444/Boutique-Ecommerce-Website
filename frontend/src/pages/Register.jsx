import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const PERKS = ['Free shipping on first order', 'Early access to new drops', 'Exclusive member deals', 'Easy order tracking'];

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-green-400'];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-2">
        {[0,1,2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score - 1] : 'bg-stone-200'}`} />
        ))}
      </div>
      <div className="flex gap-3 flex-wrap">
        {checks.map(c => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? 'text-green-600' : 'text-stone-400'}`}>
            <Check size={10} className={c.ok ? 'opacity-100' : 'opacity-0'} />{c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'At least 8 characters';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Needs an uppercase letter';
    else if (!/[0-9]/.test(form.password)) e.password = 'Needs a number';
    return e;
  }

  function set(field) { return e => { setForm(p => ({...p, [field]: e.target.value})); setErrors(p => ({...p, [field]: ''})); }; }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setAuth(data.data.user, data.data.accessToken);
      toast.success(`Welcome to Boutique, ${data.data.user.firstName}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      setErrors({ general: msg });
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-stone-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-3xl font-bold text-stone-900">Boutique</Link>
          <h1 className="text-2xl font-semibold text-stone-800 mt-6 mb-2">Create your account</h1>
          <p className="text-stone-500 text-sm">Join thousands of fashion lovers</p>
        </div>

        {/* Perks */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3">Member benefits</p>
          <div className="grid grid-cols-2 gap-2">
            {PERKS.map(p => (
              <div key={p} className="flex items-center gap-2 text-xs text-amber-800">
                <Check size={12} className="text-amber-600 flex-shrink-0" /> {p}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
          {errors.general && (
            <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{errors.general}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">First name</label>
                <input value={form.firstName} onChange={set('firstName')}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition ${errors.firstName ? 'border-red-400' : 'border-stone-200'}`}
                  placeholder="Jane" autoComplete="given-name" />
                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Last name</label>
                <input value={form.lastName} onChange={set('lastName')}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition ${errors.lastName ? 'border-red-400' : 'border-stone-200'}`}
                  placeholder="Doe" autoComplete="family-name" />
                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email address</label>
              <input type="email" value={form.email} onChange={set('email')}
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition ${errors.email ? 'border-red-400' : 'border-stone-200'}`}
                placeholder="you@example.com" autoComplete="email" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  className={`w-full border rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 transition ${errors.password ? 'border-red-400' : 'border-stone-200'}`}
                  placeholder="Create a strong password" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password && <PasswordStrength password={form.password} />}
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2">
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Create account</span><ArrowRight size={18} /></>}
            </button>

            <p className="text-xs text-stone-400 text-center mt-2">
              By creating an account you agree to our{' '}
              <a href="#" className="underline hover:text-stone-600">Terms</a> and{' '}
              <a href="#" className="underline hover:text-stone-600">Privacy Policy</a>.
            </p>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="text-stone-900 font-semibold hover:underline">Sign in</Link>
        </p>
        <p className="mt-3 text-center">
          <Link to="/products" className="text-sm text-stone-400 hover:text-stone-600">← Keep browsing without signing up</Link>
        </p>
      </div>
    </div>
  );
}
