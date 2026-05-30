import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';

export function useAuth() {
  const { user, accessToken, isAuthenticated, isAdmin, setAuth, setAccessToken, logout } = useAuthStore();
  const navigate = useNavigate();

  async function signOut() {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    toast.success('Signed out');
    navigate('/');
  }

  // Redirect to login with return path if not authenticated
  function requireAuth(redirectTo = '/') {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: redirectTo } });
      return false;
    }
    return true;
  }

  return {
    user,
    accessToken,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    setAuth,
    setAccessToken,
    logout: signOut,
    requireAuth,
  };
}
