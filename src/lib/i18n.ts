import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, normalizeLanguage, SUPPORTED_LANGUAGES } from '@/lib/language';

export const NAMESPACES = [
  'nav',
  'dashboard',
  'history',
  'upload',
  'scheme',
  'profile',
  'evaluation',
  'feedback',
  'score',
  'auth',
  'notfound',
] as const;

const localeModules = import.meta.glob('../locales/*/*.json');

const dynamicBackend = {
  type: 'backend' as const,
  read: (language: string, namespace: string, callback: (error: Error | null, data?: unknown) => void) => {
    const lang = normalizeLanguage(language);
    const tryLoad = (targetLanguage: string) => {
      const key = `../locales/${targetLanguage}/${namespace}.json`;
      const loader = localeModules[key];
      if (!loader) return null;
      return loader()
        .then((mod) => callback(null, (mod as { default?: unknown }).default ?? mod))
        .catch((err: unknown) => callback(err instanceof Error ? err : new Error(String(err))));
    };

    const loaded = tryLoad(lang);
    if (loaded) return;

    if (lang !== DEFAULT_LANGUAGE) {
      const fallbackLoaded = tryLoad(DEFAULT_LANGUAGE);
      if (fallbackLoaded) return;
    }

    callback(null, {});
  },
};

const syncDocumentLanguage = (language: string) => {
  document.documentElement.lang = normalizeLanguage(language);
};

void i18n
  .use(LanguageDetector)
  .use(dynamicBackend)
  .use(initReactI18next)
  .init({
    supportedLngs: SUPPORTED_LANGUAGES,
    fallbackLng: DEFAULT_LANGUAGE,
    ns: [...NAMESPACES],
    defaultNS: 'nav',
    interpolation: { escapeValue: false },
    returnNull: false,
    react: { useSuspense: false },
    partialBundledLanguages: true,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

syncDocumentLanguage(i18n.resolvedLanguage || i18n.language);
i18n.on('languageChanged', syncDocumentLanguage);

export default i18n;
