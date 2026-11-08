import React from 'react';
import Card from '../ui/Card';

interface PatternData {
  name: string;
  score: number;
  problemCount: number;
  trend: number;
}

interface PatternAnalysisProps {
  data: PatternData[];
}

const PatternAnalysis: React.FC<PatternAnalysisProps> = ({ data }) => {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900">Pattern Mastery Index</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Algorithmic approach ratings & velocity</p>
        </div>
        <span className="text-xs font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
          {data.length} tracked
        </span>
      </div>

      {data.length === 0 ? (
        <div className="py-8 text-center text-zinc-400 text-xs">
          No pattern insights available yet.
        </div>
      ) : (
        <div className="space-y-3.5">
          {data.map((pattern) => {
            const isPositive = pattern.trend > 0;
            const pct = Math.min(100, Math.max(0, (pattern.score / 10) * 100));
            return (
              <div key={pattern.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-zinc-800">{pattern.name}</span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      ({pattern.problemCount} solved)
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 tabular-nums">
                    <span className="font-semibold text-zinc-900">
                      {pattern.score.toFixed(1)}<span className="text-zinc-400 text-[10px]">/10</span>
                    </span>
                    <span
                      className={`text-[11px] font-mono font-medium ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? '↑' : '↓'}{Math.abs(Math.round(pattern.trend))}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
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

export default PatternAnalysis;
