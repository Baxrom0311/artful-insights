import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { evaluationsApi, artworksApi } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';
import ScoreCircle from '@/components/evaluations/ScoreCircle';
import CategoryChart from '@/components/evaluations/CategoryChart';
import FeedbackCard from '@/components/evaluations/FeedbackCard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowLeft, Loader2, Calendar, Clock } from 'lucide-react';
import type { EvaluationDetail } from '@/types';

const EvaluationResults = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState<EvaluationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reEvalLoading, setReEvalLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    evaluationsApi.get(id).then((r) => setEvaluation(r.data)).catch(() => navigate('/history')).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleReEval = async () => {
    if (!evaluation) return;
    setReEvalLoading(true);
    try {
      await artworksApi.reEvaluate(String(evaluation.artwork_title)); // artwork_id from artwork
      navigate('/history');
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

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
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
                {new Date(evaluation.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {parseFloat(evaluation.processing_time).toFixed(1)}s
              </span>
            </div>
            <ScoreCircle score={score} grade={evaluation.grade} />
            <Button variant="outline" onClick={handleReEval} disabled={reEvalLoading}>
              {reEvalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Re-evaluate (1 credit)
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
            <h2 className="mb-2 text-lg font-semibold text-accent-foreground">AI Summary</h2>
            <p className="leading-relaxed text-muted-foreground">{evaluation.summary}</p>
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
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Category Breakdown</h2>
            <CategoryChart scores={evaluation.category_scores} />
          </motion.div>
        )}

        {/* Feedback cards */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Detailed Feedback</h2>
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
