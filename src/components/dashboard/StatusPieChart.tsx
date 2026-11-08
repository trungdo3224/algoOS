import React from 'react';
import Card from '../ui/Card';
import type { ProblemStatus } from '../../types';

interface StatusData {
  status: ProblemStatus;
  count: number;
}

interface StatusPieChartProps {
  data: StatusData[];
}

const STATUS_COLORS: Record<ProblemStatus, { hex: string; bgClass: string }> = {
  'Đã tự giải': { hex: '#10b981', bgClass: 'bg-emerald-500' },
  'Giải với hint': { hex: '#f59e0b', bgClass: 'bg-amber-500' },
  'Giải từ solution': { hex: '#6366f1', bgClass: 'bg-indigo-500' },
  'Cần ôn tập sớm': { hex: '#f43f5e', bgClass: 'bg-rose-500' },
  'Đã ôn tập': { hex: '#0284c7', bgClass: 'bg-sky-600' }
};

const DEFAULT_COLOR = { hex: '#71717a', bgClass: 'bg-zinc-500' };

const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Generate conic gradient for the donut chart
  const buildConicGradient = () => {
    if (total === 0 || data.length === 0) {
      return 'conic-gradient(#f4f4f5 0deg 360deg)';
    }

    let currentAngle = 0;
    const parts = data.map((item) => {
      const color = STATUS_COLORS[item.status]?.hex || DEFAULT_COLOR.hex;
      const angle = (item.count / total) * 360;
      const start = currentAngle;
      const end = currentAngle + angle;
      currentAngle = end;
      return `${color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
    });

    return `conic-gradient(${parts.join(', ')})`;
  };

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-sm font-semibold tracking-tight text-zinc-900">Status Distribution</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Classification of problem completion history</p>
      </div>
      
      {total === 0 ? (
        <div className="py-12 text-center text-zinc-400 text-xs">
          No problem status records available yet.
        </div>
      ) : (
        <>
          <div className="relative w-44 h-44 mx-auto my-4 flex items-center justify-center">
            {/* Donut ring */}
            <div 
              className="w-44 h-44 rounded-full border border-zinc-200/80 transition-all duration-300"
              style={{ background: buildConicGradient() }}
            />
            {/* Donut hole with total count */}
            <div className="absolute w-28 h-28 rounded-full bg-white border border-zinc-100 flex flex-col items-center justify-center pointer-events-none shadow-sm">
              <span className="text-2xl font-bold text-zinc-950 tabular-nums">{total}</span>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Problems</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-zinc-100">
            {data.map((item) => {
              const colorInfo = STATUS_COLORS[item.status] || DEFAULT_COLOR;
              const percentage = total > 0 ? ((item.count / total) * 100).toFixed(0) : '0';
              return (
                <div key={item.status} className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-zinc-50 transition-colors">
                  <div className={`w-2.5 h-2.5 rounded-full ${colorInfo.bgClass} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-800 truncate">{item.status}</p>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      {item.count} ({percentage}%)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
};

export default StatusPieChart;
