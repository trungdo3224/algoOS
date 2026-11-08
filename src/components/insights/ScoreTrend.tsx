import React from 'react';
import Card from '../ui/Card';

interface ScoreTrendProps {
  data: {
    date: string;
    score: number;
    problemCount: number;
  }[];
  period: 'week' | 'month' | 'year';
  onPeriodChange: (period: 'week' | 'month' | 'year') => void;
}

const ScoreTrend: React.FC<ScoreTrendProps> = ({ data, period, onPeriodChange }) => {
  const periods: Array<'week' | 'month' | 'year'> = ['week', 'month', 'year'];

  if (!data || data.length === 0) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-zinc-900">Score Trajectory</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Chronological average score trends</p>
          </div>
          <div className="inline-flex p-0.5 bg-zinc-100 rounded-lg">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  period === p
                    ? 'bg-white text-zinc-950 shadow-sm font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="h-44 flex items-center justify-center text-zinc-400 text-xs">
          No trend records available for this interval.
        </div>
      </Card>
    );
  }

  const maxScore = 10;
  const getHeight = (score: number) => {
    return Math.min(130, Math.max(8, (score / maxScore) * 130));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getDateLabelIndices = () => {
    if (data.length <= 1) return [0];
    if (data.length === 2) return [0, 1];
    return [0, Math.floor(data.length / 2), data.length - 1];
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900">Score Trajectory</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Chronological score trend & volume</p>
        </div>
        <div className="inline-flex p-0.5 bg-zinc-100 rounded-lg">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                period === p
                  ? 'bg-white text-zinc-950 shadow-sm font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-44 pl-7 pr-2 pt-3">
        {/* Y-axis guidelines */}
        <div className="absolute left-0 inset-y-0 w-6 flex flex-col justify-between text-[10px] font-mono text-zinc-400 text-right pr-1 select-none">
          <span>10</span>
          <span>7.5</span>
          <span>5.0</span>
          <span>2.5</span>
          <span>0</span>
        </div>

        {/* Horizontal grid lines */}
        <div className="absolute left-7 right-0 inset-y-0 flex flex-col justify-between pointer-events-none">
          <div className="border-b border-zinc-100 w-full" />
          <div className="border-b border-zinc-100 w-full" />
          <div className="border-b border-zinc-100 w-full" />
          <div className="border-b border-zinc-100 w-full" />
          <div className="border-b border-zinc-200 w-full" />
        </div>

        {/* Data points */}
        <div className="relative h-full flex items-end gap-2 z-10">
          {data.map((point, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
              title={`${formatDate(point.date)}: Score ${point.score.toFixed(1)}/10 (${point.problemCount} problems)`}
            >
              <div
                className="w-full max-w-[14px] bg-blue-600 rounded-t-sm transition-all duration-200 group-hover:bg-blue-700"
                style={{ height: `${getHeight(point.score)}px` }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-zinc-100 flex justify-between text-[11px] font-mono text-zinc-400 pl-7">
        {getDateLabelIndices().map((index) => (
          data[index] ? <span key={index}>{formatDate(data[index].date)}</span> : null
        ))}
      </div>
    </Card>
  );
};

export default ScoreTrend;