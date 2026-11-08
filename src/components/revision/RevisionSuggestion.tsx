import React from 'react';
import { AlertTriangle, Clock, Tag, TrendingDown, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface RevisionSuggestionProps {
  problemTitle: string;
  category: string;
  lastAttemptDate: Date;
  score: number;
  attempts: number;
  weakAreas: string[];
  revisionReason: {
    type: 'low_score' | 'pattern_weakness' | 'time_elapsed' | 'multiple_attempts';
    description: string;
  };
  onStart: () => void;
}

const RevisionSuggestion: React.FC<RevisionSuggestionProps> = ({
  problemTitle,
  category,
  lastAttemptDate,
  score,
  attempts,
  weakAreas,
  revisionReason,
  onStart,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getReasonConfig = () => {
    switch (revisionReason.type) {
      case 'low_score':
        return {
          icon: <TrendingDown className="h-4 w-4 text-rose-600" />,
          style: 'bg-rose-50/70 text-rose-900 border-rose-200/70',
          badge: 'Low Score'
        };
      case 'pattern_weakness':
        return {
          icon: <Tag className="h-4 w-4 text-amber-600" />,
          style: 'bg-amber-50/70 text-amber-900 border-amber-200/70',
          badge: 'Pattern Gap'
        };
      case 'time_elapsed':
        return {
          icon: <Clock className="h-4 w-4 text-blue-600" />,
          style: 'bg-blue-50/70 text-blue-900 border-blue-200/70',
          badge: 'Interval Due'
        };
      case 'multiple_attempts':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-purple-600" />,
          style: 'bg-purple-50/70 text-purple-900 border-purple-200/70',
          badge: 'Repeated Attempts'
        };
    }
  };

  const reasonCfg = getReasonConfig();

  const getScoreBadge = () => {
    if (score < 5) {
      return 'bg-rose-50 text-rose-700 border-rose-200/70';
    } else if (score < 7) {
      return 'bg-amber-50 text-amber-700 border-amber-200/70';
    }
    return 'bg-emerald-50 text-emerald-700 border-emerald-200/70';
  };

  return (
    <Card hoverable className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-zinc-900 tracking-tight truncate">
              {problemTitle}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center text-xs font-mono font-medium text-zinc-600 bg-zinc-100 border border-zinc-200/80 rounded px-2 py-0.5">
                {category}
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-xs text-zinc-500 font-mono">
                Last: {formatDate(lastAttemptDate)}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end flex-shrink-0">
            <div className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold border tabular-nums ${getScoreBadge()}`}>
              {score.toFixed(1)}/10
            </div>
            <span className="text-[11px] text-zinc-400 mt-1 font-mono">
              {attempts} {attempts === 1 ? 'attempt' : 'attempts'}
            </span>
          </div>
        </div>

        {/* Diagnostic Reason */}
        <div className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs mb-3.5 ${reasonCfg.style}`}>
          <div className="mt-0.5 flex-shrink-0">{reasonCfg.icon}</div>
          <div>
            <span className="font-semibold">{reasonCfg.badge}: </span>
            <span className="opacity-90">{revisionReason.description}</span>
          </div>
        </div>
        
        {/* Weak Areas */}
        {weakAreas.length > 0 && (
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Focus Areas
            </div>
            <div className="flex flex-wrap gap-1.5">
              {weakAreas.map((area, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs text-zinc-700 bg-zinc-50 border border-zinc-200/70"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-zinc-100 mt-2">
        <Button
          onClick={onStart}
          variant="outline"
          size="sm"
          className="w-full justify-center group"
        >
          <span>Start Revision Session</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};

export default RevisionSuggestion;