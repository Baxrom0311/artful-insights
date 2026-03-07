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
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const getCurrentLanguage = (): AppLanguage =>
  normalizeLanguage(i18n.resolvedLanguage || i18n.language || DEFAULT_LANGUAGE);

type RefreshResponse = {
  access: string;
  refresh?: string;
};

let refreshRequest: Promise<string> | null = null;

const clearStoredTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const redirectToLogin = () => {
  clearStoredTokens();
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
};

const refreshAccessToken = async (): Promise<string> => {
  if (!refreshRequest) {
    refreshRequest = axios
      .post<RefreshResponse>(`${API_BASE_URL}/api/v1/auth/refresh/`, {
        refresh: localStorage.getItem(REFRESH_TOKEN_KEY),
      })
      .then(({ data }) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
        if (data.refresh) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
        }
        return data.access;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
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
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const isRefreshRequest = typeof original?.url === 'string' && original.url.includes('/api/v1/auth/refresh/');

    if (error.response?.status === 401 && original && !original._retry && !isRefreshRequest) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        redirectToLogin();
        return Promise.reject(error);
      }

      original._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        redirectToLogin();
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401 && isRefreshRequest) {
      redirectToLogin();
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
