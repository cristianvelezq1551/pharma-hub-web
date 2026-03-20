/**
 * Cliente HTTP — igual que en pharma-hub-admin pero adaptado al ecommerce.
 * Axios con interceptores para auto-refresh del JWT.
 *
 * En Flutter esto sería Dio con un interceptor de refresh token.
 */
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export const api = axios.create({ baseURL: BASE_URL });

// ── Request interceptor: agrega el Bearer token a cada request ──────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('pharma-web-auth');
    if (raw) {
      const { state } = JSON.parse(raw);
      if (state?.accessToken) {
        config.headers.Authorization = `Bearer ${state.accessToken}`;
      }
    }
  }
  return config;
});

// ── Response interceptor: si recibe 401, intenta refresh automático ─────────
let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const raw = localStorage.getItem('pharma-web-auth');
      const { state } = JSON.parse(raw ?? '{}');
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
        headers: { Authorization: `Bearer ${state?.refreshToken}` },
      });
      const newToken = data.accessToken;

      // Actualizar el store de Zustand en localStorage directamente
      const stored = JSON.parse(raw ?? '{}');
      stored.state.accessToken = newToken;
      localStorage.setItem('pharma-web-auth', JSON.stringify(stored));

      queue.forEach((cb) => cb(newToken));
      queue = [];
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      if (typeof window !== 'undefined') window.location.href = '/login';
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

// Helper para construir URLs de imágenes (elimina el /api del base)
export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${BASE_URL.replace('/api', '')}${path}`;
}
