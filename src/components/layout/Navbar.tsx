import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Palette, Upload, BarChart3, User, LogOut, Menu, X, Coins } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { AppLanguage } from '@/types';

const LANGUAGE_OPTIONS: Array<{ value: AppLanguage; label: string }> = [
  { value: 'uz', label: "UZ" },
  { value: 'en', label: 'EN' },
  { value: 'ru', label: 'RU' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLanguageChange = (value: AppLanguage) => setLanguage(value);

  const links = [
    { to: '/dashboard', label: t('nav:dashboard'), icon: BarChart3 },
    { to: '/upload', label: t('nav:upload'), icon: Upload },
    { to: '/profile', label: t('nav:profile'), icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:h-[4.5rem] sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Palette className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">ArtEval<span className="text-primary">.AI</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden justify-self-center md:flex">
          <div className="flex items-center gap-1 rounded-full border border-border/70 bg-card/90 p-1 shadow-card">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center justify-self-end gap-2.5 md:flex">
          {user && (
            <div className="flex items-center gap-2 rounded-full border border-border/70 bg-accent/80 px-4 py-2 text-sm font-semibold text-accent-foreground">
              <Coins className="h-4 w-4" />
              {t('nav:credits', { count: user.credits })}
            </div>
          )}
          <div className="rounded-full border border-border/70 bg-card/90 px-1.5 py-1 shadow-card">
            <label className="sr-only" htmlFor="desktop-language">{t('nav:language')}</label>
            <select
              id="desktop-language"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as AppLanguage)}
              className="h-8 rounded-full border-0 bg-transparent px-2 text-xs font-semibold text-foreground outline-none"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="rounded-full px-4 text-muted-foreground hover:bg-muted/70"
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            {t('nav:logout')}
          </Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-3 md:hidden">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(to) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <div className="mt-3 rounded-lg border border-border p-3">
            <label htmlFor="mobile-language" className="mb-1 block text-xs font-medium uppercase text-muted-foreground">
              {t('nav:language')}
            </label>
            <select
              id="mobile-language"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as AppLanguage)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Coins className="h-4 w-4" /> {t('nav:credits', { count: user?.credits ?? 0 })}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-1.5 h-4 w-4" /> {t('nav:logout')}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
