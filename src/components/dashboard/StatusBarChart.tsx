import React from 'react';
import Card from '../ui/Card';
import type { ProblemStatus } from '../../types';

interface StatusData {
  status: ProblemStatus;
  count: number;
}

interface StatusBarChartProps {
  data: StatusData[];
}

const StatusBarChart: React.FC<StatusBarChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const getStatusColor = (status: ProblemStatus) => {
    switch (status) {
      case 'Đã tự giải':
        return 'bg-emerald-500';
      case 'Giải với hint':
        return 'bg-amber-500';
      case 'Giải từ solution':
        return 'bg-indigo-500';
      case 'Cần ôn tập sớm':
        return 'bg-rose-500';
      case 'Đã ôn tập':
        return 'bg-sky-600';
      default:
        return 'bg-zinc-500';
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900">Status Metrics</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Problem volumes categorized by mastery state</p>
        </div>
        <span className="text-xs font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
          {total} logged
        </span>
      </div>

      {total === 0 ? (
        <div className="py-8 text-center text-zinc-400 text-xs">
          No problem status records available yet.
        </div>
      ) : (
        <div className="space-y-3.5">
          {data.map((item) => {
            const pct = total > 0 ? (item.count / total) * 100 : 0;
            return (
              <div key={item.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-800">{item.status}</span>
                  <div className="flex items-baseline gap-1.5 tabular-nums">
                    <span className="font-semibold text-zinc-900">{item.count}</span>
                    <span className="text-[11px] text-zinc-400">({pct.toFixed(0)}%)</span>
                  </div>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusColor(item.status)} rounded-full transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default StatusBarChart;