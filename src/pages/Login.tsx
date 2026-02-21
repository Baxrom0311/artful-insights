import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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

const Login = () => {
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
        setError(detail || t('auth:invalid_credentials'));
      } else {
        setError(t('auth:invalid_credentials'));
      }
    } finally {
      setLoading(false);
    }
  };

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
      {/* Left side - image */}
      <div className="relative hidden w-1/2 lg:block">
        <img src={authBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 gradient-hero opacity-60" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <h2 className="text-4xl font-bold text-primary-foreground">{t('auth:login.hero_title')}</h2>
          <p className="mt-3 max-w-md text-lg text-primary-foreground/70">
            {t('auth:login.hero_subtitle')}
          </p>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Palette className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ArtEval<span className="text-primary">.AI</span></span>
          </div>

          <h1 className="text-2xl font-bold">{t('auth:brand.login_title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('auth:brand.login_subtitle')}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">{t('auth:username')}</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('auth:username')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth:password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth:password')}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('auth:sign_in')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth:no_account')}{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              {t('auth:create_one')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
