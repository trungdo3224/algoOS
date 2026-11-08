import React from 'react';
import { Clock, Calendar, Trophy } from 'lucide-react';
import Card from '../ui/Card';

interface StudySessionCardProps {
  date: Date;
  duration: number; // in minutes
  problemsSolved: number;
  averageScore: number;
}

const StudySessionCard: React.FC<StudySessionCardProps> = ({
  date,
  duration,
  problemsSolved,
  averageScore,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-700 bg-emerald-50 border-emerald-200/80';
    if (score >= 6) return 'text-amber-700 bg-amber-50 border-amber-200/80';
    return 'text-rose-700 bg-rose-50 border-rose-200/80';
  };

  return (
    <Card hoverable className="flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            <span className="font-medium text-zinc-700">{formatDate(date)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-100/70 px-2 py-0.5 rounded text-zinc-600 font-mono text-[11px]">
            <Clock className="h-3 w-3 text-zinc-400" />
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-left">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-0.5">Problems</p>
            <p className="text-2xl font-bold text-zinc-900 tabular-nums">{problemsSolved}</p>
          </div>
          <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-left">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-0.5">Score</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-zinc-900 tabular-nums">{averageScore.toFixed(1)}</span>
              <span className="text-xs text-zinc-400">/10</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between text-xs">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${getScoreColor(averageScore)}`}>
          <Trophy className="h-3 w-3" />
          {averageScore >= 8 ? 'Mastery' : averageScore >= 6 ? 'Competent' : 'Developing'}
        </span>
        <span className="text-zinc-400 text-[11px] group-hover:text-zinc-700 transition-colors">
          View details →
        </span>
      </div>
    </Card>
  );
};

export default StudySessionCard;