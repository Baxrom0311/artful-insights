import { ChevronDown, CheckCircle2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CategoryScore } from '@/types';

const getScoreBg = (score: number) => {
  if (score >= 90) return 'bg-score-excellent text-primary-foreground';
  if (score >= 80) return 'bg-score-good text-primary-foreground';
  if (score >= 70) return 'bg-score-average text-primary-foreground';
  if (score >= 60) return 'bg-score-poor text-primary-foreground';
  return 'bg-score-bad text-primary-foreground';
};

const FeedbackCard = ({ data }: { data: CategoryScore }) => {
  const [open, setOpen] = useState(false);
  const score = parseFloat(data.score || '0');

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <span className={`rounded-lg px-2.5 py-1 font-mono text-sm font-semibold ${getScoreBg(score)}`}>
            {score}
          </span>
          <span className="font-semibold text-card-foreground">{data.category.name}</span>
        </div>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
              <p className="text-sm leading-relaxed text-muted-foreground">{data.feedback}</p>

              {data.strengths?.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-success">Strengths</h4>
                  <ul className="space-y-1.5">
                    {data.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-card-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.improvements?.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-secondary">Improvements</h4>
                  <ul className="space-y-1.5">
                    {data.improvements.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-card-foreground">
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackCard;
