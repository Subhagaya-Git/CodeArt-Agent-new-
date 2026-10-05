import axios from 'axios';
import { getAuthToken, setAuthToken, clearAuthToken } from './tokenStore.js';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${baseURL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// De-duplicated silent refresh: concurrent 401s share a single refresh call.
let refreshPromise = null;

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh')
      .then(({ data }) => {
        if (data?.accessToken) {
          setAuthToken(data.accessToken);
          return data.accessToken;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => {
    if (res.data == null) res.data = {};
    return res;
  },
  async (err) => {
    if (!err.response) {
      err.response = { status: 0, data: { message: 'Network error — server unreachable' } };
    }
    if (err.response.data == null) {
      err.response.data = { message: `Server error (${err.response.status})` };
    }

    const original = err.config;
    const isAuthUrl = original?.url?.includes('/auth/');

    // Access token expired (15 min TTL): refresh once and replay the request.
    if (err.response.status === 401 && original && !original._retry && !isAuthUrl) {
      original._retry = true;
      const token = await refreshSession();
      if (token) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      clearAuthToken();
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }

    return Promise.reject(err);
  },
);

export default api;
