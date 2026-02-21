import React, { useCallback, useMemo } from 'react';
import type { AppLanguage } from '@/types';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n, { NAMESPACES } from '@/lib/i18n';
import { DEFAULT_LANGUAGE, normalizeLanguage } from '@/lib/language';
import type { I18nKey, I18nParams } from '@/types/i18n';

interface UseLanguageResult {
  t: (key: I18nKey, params?: I18nParams) => string;
  language: AppLanguage;
  locale: string;
  setLanguage: (nextLanguage: AppLanguage) => void;
}

const LOCALES: Record<AppLanguage, string> = {
  uz: 'uz-UZ',
  en: 'en-US',
  ru: 'ru-RU',
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};

export const useLanguage = (): UseLanguageResult => {
  const { t, i18n: i18nInstance } = useTranslation([...NAMESPACES]);
  const language = useMemo<AppLanguage>(
    () => normalizeLanguage(i18nInstance.resolvedLanguage || i18nInstance.language || DEFAULT_LANGUAGE),
    [i18nInstance.language, i18nInstance.resolvedLanguage]
  );
  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    void i18nInstance.changeLanguage(nextLanguage);
  }, [i18nInstance]);

  return {
    t: (key: I18nKey, params?: I18nParams) => t(key, params),
    language,
    locale: LOCALES[language],
    setLanguage,
  };
};
