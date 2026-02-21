import nav from '@/locales/uz/nav.json';
import dashboard from '@/locales/uz/dashboard.json';
import history from '@/locales/uz/history.json';
import upload from '@/locales/uz/upload.json';
import scheme from '@/locales/uz/scheme.json';
import profile from '@/locales/uz/profile.json';
import evaluation from '@/locales/uz/evaluation.json';
import feedback from '@/locales/uz/feedback.json';
import score from '@/locales/uz/score.json';
import auth from '@/locales/uz/auth.json';
import notfound from '@/locales/uz/notfound.json';

type Primitive = string | number | boolean | null;

type LeafPaths<T> = {
  [K in keyof T & string]:
    T[K] extends Primitive
      ? K
      : T[K] extends Record<string, unknown>
        ? `${K}.${LeafPaths<T[K]>}`
        : never;
}[keyof T & string];

type NamespaceResources = {
  nav: typeof nav;
  dashboard: typeof dashboard;
  history: typeof history;
  upload: typeof upload;
  scheme: typeof scheme;
  profile: typeof profile;
  evaluation: typeof evaluation;
  feedback: typeof feedback;
  score: typeof score;
  auth: typeof auth;
  notfound: typeof notfound;
};

export type I18nNamespace = keyof NamespaceResources;
export type I18nKey = {
  [N in I18nNamespace]: `${N}:${LeafPaths<NamespaceResources[N]>}`;
}[I18nNamespace];

export type I18nParams = Record<string, string | number>;
