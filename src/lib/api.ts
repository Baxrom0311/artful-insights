import axios from 'axios';
import type {
  AppLanguage,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  User,
  UserStats,
  ArtworkListItem,
  ArtworkDetail,
  EvaluationListItem,
  EvaluationDetail,
  PaginatedResponse,
  Category,
} from '@/types';
import i18n from '@/lib/i18n';
import { DEFAULT_LANGUAGE, normalizeLanguage } from '@/lib/language';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const getCurrentLanguage = (): AppLanguage =>
  normalizeLanguage(i18n.resolvedLanguage || i18n.language || DEFAULT_LANGUAGE);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const language = getCurrentLanguage();
  config.headers['Accept-Language'] = language;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh/`, { refresh });
        localStorage.setItem('access_token', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (creds: LoginCredentials) =>
    api.post<AuthTokens>('/api/v1/auth/login/', creds),
  register: (data: RegisterData) =>
    api.post('/api/v1/auth/register/', data),
  logout: (refresh: string) =>
    api.post('/api/v1/auth/logout/', { refresh }),
  getProfile: () =>
    api.get<User>('/api/v1/auth/profile/'),
  updateProfile: (data: Partial<User>) =>
    api.patch<User>('/api/v1/auth/profile/', data),
  getStats: () =>
    api.get<UserStats>('/api/v1/auth/profile/stats/'),
  changePassword: (old_password: string, new_password: string) =>
    api.put('/api/v1/auth/change-password/', { old_password, new_password }),
};

// Artworks
export const artworksApi = {
  list: (page = 1, pageSize = 20) =>
    api.get<PaginatedResponse<ArtworkListItem>>('/api/v1/artworks/', { params: { page, page_size: pageSize } }),
  get: (id: string) =>
    api.get<ArtworkDetail>(`/api/v1/artworks/${id}/`),
  create: (formData: FormData, language?: AppLanguage) => {
    const selectedLanguage = language || getCurrentLanguage();
    formData.set('language', selectedLanguage);
    return api.post<ArtworkDetail>('/api/v1/artworks/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept-Language': selectedLanguage,
      },
    });
  },
  update: (id: string, data: Partial<ArtworkDetail>) =>
    api.patch<ArtworkDetail>(`/api/v1/artworks/${id}/`, data),
  delete: (id: string) =>
    api.delete(`/api/v1/artworks/${id}/`),
  reEvaluate: (id: string, language?: AppLanguage) => {
    const selectedLanguage = language || getCurrentLanguage();
    return api.post(
      `/api/v1/artworks/${id}/re-evaluate/`,
      { language: selectedLanguage },
      { headers: { 'Accept-Language': selectedLanguage } }
    );
  },
};

// Evaluations
export const evaluationsApi = {
  list: (page = 1, pageSize = 20) =>
    api.get<PaginatedResponse<EvaluationListItem>>('/api/v1/evaluations/', { params: { page, page_size: pageSize } }),
  get: (id: string) =>
    api.get<EvaluationDetail>(`/api/v1/evaluations/${id}/`),
};

// Categories
export const categoriesApi = {
  list: () => api.get<Category[]>('/api/v1/categories/'),
};
