import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { evaluationsApi, artworksApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import AppLayout from '@/components/layout/AppLayout';
import ScoreCircle from '@/components/evaluations/ScoreCircle';
import CategoryChart from '@/components/evaluations/CategoryChart';
import FeedbackCard from '@/components/evaluations/FeedbackCard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowLeft, Loader2, Calendar, Clock } from 'lucide-react';
import type {
  EvaluationDetail,
  EvaluationScheme,
  OfficialRubric,
  OfficialRubricCriterion,
  OfficialRubricSection,
  RubricLevel,
} from '@/types';

const VALID_SCHEMES: EvaluationScheme[] = [
  'art_history',
  'painting',
  'design_cg_photo',
  'design_ad_graphics',
  'design_interior_industrial',
  'design_fashion_textile',
  'applied_art',
  'sculpture',
  'graphics',
];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const isEvaluationScheme = (value: unknown): value is EvaluationScheme =>
  typeof value === 'string' && VALID_SCHEMES.includes(value as EvaluationScheme);

const normalizeLevel = (value: unknown): RubricLevel => {
  if (value === 'full' || value === 'partial' || value === 'none') return value;
  return 'none';
};

const parseCriterion = (value: unknown): OfficialRubricCriterion | null => {
  if (!isObject(value)) return null;
  const criterionKey = typeof value.criterion_key === 'string' ? value.criterion_key : '';
  const awardedScore = toNumber(value.awarded_score);
  const maxScore = toNumber(value.max_score);
  const feedback = typeof value.feedback === 'string' ? value.feedback : '';
  if (!criterionKey || awardedScore === null || maxScore === null) return null;

  return {
    criterion_key: criterionKey,
    level: normalizeLevel(value.level),
    awarded_score: awardedScore,
    max_score: maxScore,
    feedback,
  };
};

const parseSection = (value: unknown): OfficialRubricSection | null => {
  if (!isObject(value)) return null;
  const sectionKey = typeof value.section_key === 'string' ? value.section_key : '';
  const sectionScore = toNumber(value.section_score);
  const sectionMaxScore = toNumber(value.section_max_score);
  const criteriaSource = Array.isArray(value.criteria) ? value.criteria : [];
  const criteria = criteriaSource
    .map(parseCriterion)
    .filter((item): item is OfficialRubricCriterion => item !== null);

  if (!sectionKey || sectionScore === null || sectionMaxScore === null) return null;
  return {
    section_key: sectionKey,
    section_score: sectionScore,
    section_max_score: sectionMaxScore,
    criteria,
  };
};

const parseOfficialRubric = (rawResponse: unknown): OfficialRubric | null => {
  if (!isObject(rawResponse) || !isObject(rawResponse.official_rubric)) return null;
  const source = rawResponse.official_rubric;
  const scheme = source.scheme;
  const maxScore = toNumber(source.max_score);
  const totalScore = toNumber(source.total_score);
  const sectionsSource = Array.isArray(source.sections) ? source.sections : [];
  const sections = sectionsSource
    .map(parseSection)
    .filter((item): item is OfficialRubricSection => item !== null);

  if (!isEvaluationScheme(scheme) || maxScore === null || totalScore === null || sections.length === 0) {
    return null;
  }

  return {
    scheme,
    max_score: maxScore,
    total_score: totalScore,
    sections,
  };
};

const formatKey = (value: string) =>
  value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const levelBadgeClass = (level: RubricLevel) => {
  if (level === 'full') return 'bg-success/15 text-success';
  if (level === 'partial') return 'bg-warning/15 text-warning';
  return 'bg-destructive/15 text-destructive';
};

const EvaluationResults = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, locale, t } = useLanguage();
  const [evaluation, setEvaluation] = useState<EvaluationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reEvalLoading, setReEvalLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    evaluationsApi.get(id).then((r) => setEvaluation(r.data)).catch(() => navigate('/dashboard')).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleReEval = async () => {
    if (!evaluation) return;
    setReEvalLoading(true);
    try {
      await artworksApi.reEvaluate(String(evaluation.artwork_id), language);
      navigate('/dashboard');
    } catch {
      setReEvalLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!evaluation) return null;

  const score = parseFloat(evaluation.total_score);
  const officialRubric = parseOfficialRubric(evaluation.raw_response);
  const rubricPercent =
    officialRubric && officialRubric.max_score > 0
      ? (officialRubric.total_score / officialRubric.max_score) * 100
      : 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('evaluation:back')}
        </Button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
          {/* Artwork image */}
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-border shadow-card">
            <img src={evaluation.artwork_image} alt={evaluation.artwork_title} className="w-full object-cover" />
          </div>

          {/* Score section */}
          <div className="flex flex-1 flex-col items-center gap-4 lg:items-start">
            <h1 className="text-3xl font-bold text-foreground">{evaluation.artwork_title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(evaluation.created_at).toLocaleDateString(locale)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {parseFloat(evaluation.processing_time).toFixed(1)}s
              </span>
            </div>
            <ScoreCircle score={score} grade={evaluation.grade} />
            <Button variant="outline" onClick={handleReEval} disabled={reEvalLoading}>
              {reEvalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              {t('evaluation:re_evaluate')}
            </Button>
          </div>
        </motion.div>

        {/* Summary */}
        {evaluation.summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-primary/20 bg-accent p-6"
          >
            <h2 className="mb-2 text-lg font-semibold text-accent-foreground">{t('evaluation:ai_summary')}</h2>
            <p className="leading-relaxed text-muted-foreground">{evaluation.summary}</p>
          </motion.div>
        )}

        {/* Official rubric breakdown */}
        {officialRubric && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">{t('evaluation:official')}</h2>
                <p className="text-sm text-muted-foreground">{t('evaluation:scheme')}: {t(`scheme:${officialRubric.scheme}`)}</p>
              </div>
              <div className="rounded-lg bg-accent px-4 py-2">
                <p className="text-xs text-muted-foreground">{t('evaluation:official_score')}</p>
                <p className="font-mono text-xl font-bold text-card-foreground">
                  {officialRubric.total_score.toFixed(1)} / {officialRubric.max_score.toFixed(1)}
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, rubricPercent))}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs text-muted-foreground">{rubricPercent.toFixed(1)}%</p>

            <div className="mt-5 space-y-3">
              {officialRubric.sections.map((section) => (
                <div key={section.section_key} className="overflow-hidden rounded-lg border border-border">
                  <div className="flex items-center justify-between bg-muted/40 px-4 py-3">
                    <h3 className="text-sm font-semibold text-card-foreground">{formatKey(section.section_key)}</h3>
                    <span className="font-mono text-sm font-semibold text-card-foreground">
                      {section.section_score.toFixed(1)} / {section.section_max_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="px-4 py-2 font-medium">{t('evaluation:criterion')}</th>
                          <th className="px-4 py-2 font-medium">{t('evaluation:level')}</th>
                          <th className="px-4 py-2 font-medium text-right">{t('evaluation:score')}</th>
                          <th className="px-4 py-2 font-medium">{t('evaluation:feedback')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.criteria.map((criterion) => (
                          <tr key={`${section.section_key}-${criterion.criterion_key}`} className="border-b border-border last:border-0">
                            <td className="px-4 py-2 text-card-foreground">{formatKey(criterion.criterion_key)}</td>
                            <td className="px-4 py-2">
                              <span className={`rounded px-2 py-1 text-xs font-semibold ${levelBadgeClass(criterion.level)}`}>
                                {criterion.level}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-card-foreground">
                              {criterion.awarded_score.toFixed(1)} / {criterion.max_score.toFixed(1)}
                            </td>
                            <td className="px-4 py-2 text-muted-foreground">
                              {criterion.feedback || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Radar chart */}
        {evaluation.category_scores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">{t('evaluation:category_breakdown')}</h2>
            <CategoryChart scores={evaluation.category_scores} />
          </motion.div>
        )}

        {/* Feedback cards */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{t('evaluation:detailed_feedback')}</h2>
          {evaluation.category_scores.map((cs, i) => (
            <motion.div
              key={cs.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <FeedbackCard data={cs} />
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default EvaluationResults;
