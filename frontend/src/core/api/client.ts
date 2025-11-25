import axios, { type AxiosInstance } from 'axios';
import { API_BASE_URL } from '../config/constants';

// Função helper para obter o token do Zustand store
function getTokenFromStorage(): string | null {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.token || null;
    }
  } catch (error) {
    console.error('Erro ao ler token do storage:', error);
  }
  return null;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      if (typeof globalThis !== 'undefined' && globalThis.location) {
        globalThis.location.href = '/login';
      }
    }

    if (error.response?.status === 422) {
      const errorData = error.response.data;
      if (errorData?.error) {
        error.message = errorData.error;
      } else if (errorData?.message) {
        error.message = errorData.message;
      } else if (errorData?.detail) {
        const detail = errorData.detail;
        if (typeof detail === 'string') {
          error.message = detail;
        } else if (Array.isArray(detail)) {
          const messages = detail
            .map((d: any) => {
              if (typeof d === 'string') return d;
              if (d.message) return d.message;
              if (d.path) return `${d.path}: ${d.message || 'inválido'}`;
              return JSON.stringify(d);
            })
            .filter(Boolean);
          error.message = messages.length > 0 ? messages.join(', ') : 'Erro de validação';
        }
      }
    }

    return Promise.reject(error);
  },
);

