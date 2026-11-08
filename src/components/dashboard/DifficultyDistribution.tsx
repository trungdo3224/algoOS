import React from 'react';
import Card from '../ui/Card';

interface DifficultyStats {
  easy: number;
  medium: number;
  hard: number;
}

interface DifficultyDistributionProps {
  stats: DifficultyStats;
}

const DifficultyDistribution: React.FC<DifficultyDistributionProps> = ({ stats }) => {
  const total = stats.easy + stats.medium + stats.hard;
  const getPercentage = (value: number) => ((value / (total || 1)) * 100).toFixed(1);

  const tiers = [
    { label: 'Easy', count: stats.easy, color: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-700' },
    { label: 'Medium', count: stats.medium, color: 'bg-amber-500', dot: 'bg-amber-500', text: 'text-amber-700' },
    { label: 'Hard', count: stats.hard, color: 'bg-rose-500', dot: 'bg-rose-500', text: 'text-rose-700' },
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900">Difficulty Breakdown</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Problem complexity balance</p>
        </div>
        <div className="text-xs font-mono font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
          {total} total
        </div>
      </div>

      <div className="space-y-4">
        {tiers.map((tier) => {
          const pct = getPercentage(tier.count);
          return (
            <div key={tier.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${tier.dot}`} />
                  <span className="font-medium text-zinc-800">{tier.label}</span>
                </div>
                <div className="flex items-baseline gap-1.5 tabular-nums">
                  <span className="font-semibold text-zinc-900">{tier.count}</span>
                  <span className="text-[11px] text-zinc-400">({pct}%)</span>
                </div>
              </div>
              <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${tier.color} rounded-full transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-3 border-t border-zinc-100 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-zinc-50 rounded-lg p-2">
          <div className="text-[10px] text-zinc-400 uppercase font-semibold">Easy Target</div>
          <div className="text-xs font-semibold text-zinc-700">30% - 40%</div>
        </div>
        <div className="bg-zinc-50 rounded-lg p-2">
          <div className="text-[10px] text-zinc-400 uppercase font-semibold">Med Target</div>
          <div className="text-xs font-semibold text-zinc-700">40% - 50%</div>
        </div>
        <div className="bg-zinc-50 rounded-lg p-2">
          <div className="text-[10px] text-zinc-400 uppercase font-semibold">Hard Target</div>
          <div className="text-xs font-semibold text-zinc-700">10% - 20%</div>
        </div>
      </div>
    </Card>
  );
};

export default DifficultyDistribution;