import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { evaluationsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, Star, ImagePlus, ChevronLeft, ChevronRight } from 'lucide-react';
import type { EvaluationListItem } from '@/types';
import { motion } from 'framer-motion';

const getGradeColor = (grade: string) => {
  if (grade === 'A') return 'bg-score-excellent text-primary-foreground';
  if (grade === 'B') return 'bg-score-good text-primary-foreground';
  if (grade === 'C') return 'bg-score-average text-primary-foreground';
  if (grade === 'D') return 'bg-score-poor text-primary-foreground';
  return 'bg-score-bad text-primary-foreground';
};

const History = () => {
  const [evaluations, setEvaluations] = useState<EvaluationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    setLoading(true);
    evaluationsApi
      .list(page, 20)
      .then((r) => {
        setEvaluations(r.data.results);
        setTotal(r.data.count);
        setHasNext(!!r.data.next);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Evaluation History</h1>
            <p className="mt-1 text-muted-foreground">{total} total evaluations</p>
          </div>
          <Link to="/upload">
            <Button className="gradient-primary border-0 text-primary-foreground">
              <ImagePlus className="mr-2 h-4 w-4" /> Upload New
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : evaluations.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
            <Star className="h-14 w-14" />
            <p className="text-lg">No evaluations yet</p>
            <Link to="/upload">
              <Button>Upload Your First Artwork</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
              <div className="hidden grid-cols-[1fr_100px_60px_120px] gap-4 border-b border-border px-5 py-3 text-sm font-medium text-muted-foreground md:grid">
                <span>Artwork</span>
                <span className="text-right">Score</span>
                <span className="text-center">Grade</span>
                <span className="text-right">Date</span>
              </div>
              <div className="divide-y divide-border">
                {evaluations.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      to={`/evaluations/${ev.id}`}
                      className="grid grid-cols-1 gap-2 px-5 py-4 transition-colors hover:bg-muted/50 md:grid-cols-[1fr_100px_60px_120px] md:items-center md:gap-4"
                    >
                      <span className="font-medium text-card-foreground">{ev.artwork_title}</span>
                      <span className="font-mono text-right text-lg font-semibold text-card-foreground">
                        {parseFloat(ev.total_score).toFixed(1)}
                      </span>
                      <div className="flex justify-start md:justify-center">
                        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${getGradeColor(ev.grade)}`}>
                          {ev.grade}
                        </span>
                      </div>
                      <span className="text-right text-sm text-muted-foreground">
                        {new Date(ev.created_at).toLocaleDateString()}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default History;
