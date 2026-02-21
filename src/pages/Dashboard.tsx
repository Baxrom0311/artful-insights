import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { authApi, evaluationsApi } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { ImagePlus, TrendingUp, Star, Coins, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserStats, EvaluationListItem } from '@/types';

const statCards = [
  { key: 'total_artworks', icon: ImagePlus, color: 'text-primary' },
  { key: 'average_score', icon: TrendingUp, color: 'text-score-good' },
  { key: 'highest_score', icon: Star, color: 'text-warning' },
  { key: 'credits_remaining', icon: Coins, color: 'text-success' },
] as const;

const Dashboard = () => {
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recent, setRecent] = useState<EvaluationListItem[]>([]);

  useEffect(() => {
    authApi.getStats().then((r) => setStats(r.data)).catch(() => {});
    evaluationsApi.list(1, 5).then((r) => setRecent(r.data.results)).catch(() => {});
  }, []);

  const getStatValue = (key: string) => {
    if (!stats) return '—';
    const val = stats[key as keyof UserStats];
    if (val === null || val === undefined) return '—';
    if (typeof val === 'number') return val.toString();
    return parseFloat(val).toFixed(1);
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A') return 'bg-score-excellent text-primary-foreground';
    if (grade === 'B') return 'bg-score-good text-primary-foreground';
    if (grade === 'C') return 'bg-score-average text-primary-foreground';
    if (grade === 'D') return 'bg-score-poor text-primary-foreground';
    return 'bg-score-bad text-primary-foreground';
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {t('dashboard:welcome')},{' '}
              <span className="text-primary">{user?.username}</span>
            </h1>
            <p className="mt-1 text-muted-foreground">{t('dashboard:overview')}</p>
          </div>
          <Link to="/upload">
            <Button className="gradient-primary border-0 text-primary-foreground">
              <ImagePlus className="mr-2 h-4 w-4" />
              {t('dashboard:upload')}
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map(({ key, icon: Icon, color }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t(`dashboard:stats.${key}`)}</p>
                  <p className="font-mono text-2xl font-bold text-card-foreground">{getStatValue(key)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent evaluations */}
        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-lg font-semibold text-card-foreground">{t('dashboard:recent')}</h2>
            <Link to="/history" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              {t('dashboard:view_all')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <Star className="h-10 w-10" />
              <p>{t('dashboard:empty')}</p>
              <Link to="/upload">
                <Button variant="outline" size="sm">{t('dashboard:first_upload')}</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((ev) => (
                <Link
                  key={ev.id}
                  to={`/evaluations/${ev.id}`}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-card-foreground">{ev.artwork_title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ev.created_at).toLocaleDateString(locale)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-semibold text-card-foreground">
                      {parseFloat(ev.total_score).toFixed(1)}
                    </span>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${getGradeColor(ev.grade)}`}>
                      {ev.grade}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
