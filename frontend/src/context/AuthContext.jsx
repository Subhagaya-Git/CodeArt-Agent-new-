import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios.js';
import { setAuthToken, clearAuthToken } from '../api/tokenStore.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const { data } = await api.post('/auth/refresh');
        if (data?.accessToken && data?.user) {
          setAuthToken(data.accessToken);
          setToken(data.accessToken);
          setUser(data.user);
        }
      } catch {
        // No active session — user must log in.
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    function handleAuthExpired() {
      clearAuthToken();
      setToken(null);
      setUser(null);
    }

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    setAuthToken(data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password });
    setAuthToken(data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Best effort — clear local state regardless.
    }
    clearAuthToken();
    setToken(null);
    setUser(null);
  }

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
