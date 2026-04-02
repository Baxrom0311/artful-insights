import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { extractApiErrorMessage } from '@/lib/api-errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Loader2 } from 'lucide-react';
import authBg from '@/assets/auth-bg.jpg';
import type { AppLanguage } from '@/types';

const LANGUAGE_OPTIONS: Array<{ value: AppLanguage; label: string }> = [
  { value: 'uz', label: 'UZ' },
  { value: 'en', label: 'EN' },
  { value: 'ru', label: 'RU' },
];

const Register = () => {
  const { register } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', password_confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirm) {
      setError(t('auth:password_mismatch'));
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(extractApiErrorMessage(err.response?.data, t('auth:registration_failed')));
      } else {
        setError(t('auth:registration_failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="flex min-h-screen">
      <div className="absolute right-4 top-4 z-20">
        <label className="sr-only" htmlFor="auth-language">Language</label>
        <select
          id="auth-language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as AppLanguage)}
          className="h-9 rounded-md border border-input bg-background/90 px-2 text-xs font-semibold text-foreground backdrop-blur"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="relative hidden w-1/2 lg:block">
        <img src={authBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 gradient-hero opacity-60" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <h2 className="text-4xl font-bold text-primary-foreground">{t('auth:register.hero_title')}</h2>
          <p className="mt-3 max-w-md text-lg text-primary-foreground/70">
            {t('auth:register.hero_subtitle')}
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Palette className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ArtEval<span className="text-primary">.AI</span></span>
          </div>

          <h1 className="text-2xl font-bold">{t('auth:brand.register_title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('auth:brand.register_subtitle')}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label>{t('auth:username')}</Label>
              <Input value={form.username} onChange={update('username')} placeholder={t('auth:username')} required />
            </div>
            <div className="space-y-2">
              <Label>{t('auth:email')}</Label>
              <Input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label>{t('auth:password')}</Label>
              <Input type="password" value={form.password} onChange={update('password')} placeholder={t('auth:password')} required />
            </div>
            <div className="space-y-2">
              <Label>{t('auth:confirm_password')}</Label>
              <Input type="password" value={form.password_confirm} onChange={update('password_confirm')} placeholder={t('auth:confirm_password')} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth:sign_up')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth:have_account')}{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              {t('auth:sign_in_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
