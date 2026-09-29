import axios from 'axios';
import { getAuthToken, clearAuthToken } from './tokenStore.js';

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

api.interceptors.response.use(
  (res) => {
    if (res.data == null) res.data = {};
    return res;
  },
  (err) => {
    if (!err.response) {
      err.response = { status: 0, data: { message: 'Network error — server unreachable' } };
    }
    if (err.response.data == null) {
      err.response.data = { message: `Server error (${err.response.status})` };
    }
    if (err.response.status === 401 && !err.config?.url?.includes('/auth/')) {
      clearAuthToken();
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }
    return Promise.reject(err);
  },
);

export default api;
