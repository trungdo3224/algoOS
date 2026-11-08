import React from 'react';
import Card from '../ui/Card';

interface ProgressChartProps {
  data: {
    category: string;
    score: number;
    previousScore?: number;
  }[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900">Score Evolution</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Performance tracking across cognitive areas</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-zinc-200 rounded-sm"></span>
            <span>Prior</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></span>
            <span className="font-medium text-zinc-800">Current</span>
          </div>
        </div>
      </div>

      {!data || data.length === 0 ? (
        <div className="py-12 text-center text-zinc-400 text-xs">
          No progress data available yet.
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-fit pt-4 pb-1">
            <div className="flex items-end h-44 mb-3 relative pl-8">
              {/* Y-axis guidelines */}
              <div className="absolute left-0 inset-y-0 w-6 flex flex-col justify-between text-[10px] font-mono text-zinc-400 text-right pr-2 select-none">
                <span>10</span>
                <span>7.5</span>
                <span>5.0</span>
                <span>2.5</span>
                <span>0</span>
              </div>

              {/* Horizontal grid lines */}
              <div className="absolute left-8 right-0 inset-y-0 flex flex-col justify-between pointer-events-none">
                <div className="border-b border-zinc-100 w-full" />
                <div className="border-b border-zinc-100 w-full" />
                <div className="border-b border-zinc-100 w-full" />
                <div className="border-b border-zinc-100 w-full" />
                <div className="border-b border-zinc-200 w-full" />
              </div>

              {/* Chart bars */}
              <div className="flex items-end gap-6 relative z-10 pl-2">
                {data.map((item, index) => {
                  const chartHeight = 150;
                  const height = Math.min(chartHeight, (item.score / 10) * chartHeight);
                  const prevHeight = item.previousScore 
                    ? Math.min(chartHeight, (item.previousScore / 10) * chartHeight) 
                    : 0;
                  
                  const diff = item.previousScore !== undefined ? item.score - item.previousScore : 0;
                  const isPositive = diff >= 0;

                  return (
                    <div 
                      key={index} 
                      className="flex flex-col items-center group relative cursor-pointer"
                      style={{ width: 44 }}
                    >
                      <div className="relative flex items-end justify-center w-full" style={{ height: chartHeight }}>
                        {/* Previous score bar */}
                        {item.previousScore !== undefined && (
                          <div 
                            className="w-3 bg-zinc-200 rounded-t-sm transition-all duration-200 mr-1"
                            style={{ height: `${prevHeight}px` }}
                            title={`Prior: ${item.previousScore.toFixed(1)}/10`}
                          />
                        )}

                        {/* Current score bar */}
                        <div 
                          className="w-4 bg-blue-600 rounded-t-sm transition-all duration-200 group-hover:bg-blue-700"
                          style={{ height: `${height}px` }}
                          title={`Current: ${item.score.toFixed(1)}/10`}
                        />
                      </div>

                      {/* Delta tag */}
                      {item.previousScore !== undefined && diff !== 0 && (
                        <span className={`text-[10px] font-mono font-semibold mt-1.5 ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isPositive ? '+' : ''}{diff.toFixed(1)}
                        </span>
                      )}

                      {/* Category label */}
                      <span 
                        className="mt-1 text-[11px] font-medium text-zinc-600 truncate max-w-[50px] text-center" 
                        title={item.category}
                      >
                        {item.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProgressChart;
