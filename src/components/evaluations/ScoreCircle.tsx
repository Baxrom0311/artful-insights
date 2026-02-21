import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface ScoreCircleProps {
  score: number;
  grade: string;
  size?: number;
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-score-excellent';
  if (score >= 80) return 'text-score-good';
  if (score >= 70) return 'text-score-average';
  if (score >= 60) return 'text-score-poor';
  return 'text-score-bad';
};

const getStrokeColor = (score: number) => {
  if (score >= 90) return 'hsl(160, 84%, 39%)';
  if (score >= 80) return 'hsl(217, 91%, 60%)';
  if (score >= 70) return 'hsl(38, 92%, 50%)';
  if (score >= 60) return 'hsl(25, 95%, 53%)';
  return 'hsl(0, 84%, 60%)';
};

const ScoreCircle = ({ score, grade, size = 180 }: ScoreCircleProps) => {
  const { t } = useLanguage();
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={getStrokeColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`font-mono text-4xl font-bold ${getScoreColor(score)}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-sm font-medium text-muted-foreground">{t('score:grade', { grade })}</span>
      </div>
    </div>
  );
};

export default ScoreCircle;
