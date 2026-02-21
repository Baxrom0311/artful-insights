import type { AppLanguage } from '@/types';

export const LANGUAGE_STORAGE_KEY = 'app_language';
export const SUPPORTED_LANGUAGES: AppLanguage[] = ['uz', 'en', 'ru'];
export const DEFAULT_LANGUAGE: AppLanguage = 'uz';

export const normalizeLanguage = (value: string | null | undefined): AppLanguage => {
  if (!value) return DEFAULT_LANGUAGE;
  const primary = value.toLowerCase().split(',')[0]?.split(';')[0]?.trim() || '';
  const base = primary.split('-')[0]?.split('_')[0]?.trim() || '';
  if (base === 'uz' || base === 'en' || base === 'ru') return base;
  return DEFAULT_LANGUAGE;
};
