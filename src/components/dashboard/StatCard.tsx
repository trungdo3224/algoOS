import React from 'react';
import { DivideIcon as LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  breakdown?: {
    easy?: string;
    medium?: string;
    hard?: string;
  };
  footer?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  className = '',
  breakdown,
  footer,
}) => {
  const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;

  return (
    <div 
      className={`
        bg-white border border-zinc-200/90 rounded-xl p-5 
        shadow-[0_1px_3px_rgba(0,0,0,0.03)] 
        hover:border-zinc-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]
        transition-all duration-200 flex flex-col justify-between group
        ${className}
      `}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {title}
          </span>
          <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-200">
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 tabular-nums">
            {formattedValue}
          </h3>

          {trend && (
            <span 
              className={`
                inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full border
                ${trend.isPositive 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70' 
                  : 'bg-rose-50 text-rose-700 border-rose-200/70'
                }
              `}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="h-3 w-3 stroke-[2.5]" />
              )}
              {Math.abs(trend.value).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {breakdown && (
        <div className="mt-4 pt-3 border-t border-zinc-100 grid grid-cols-3 gap-1.5 text-center">
          {breakdown.easy && (
            <div className="bg-zinc-50 border border-zinc-100 rounded-md py-1.5 px-1">
              <div className="text-[10px] font-semibold uppercase text-emerald-600">Easy</div>
              <div className="text-xs font-semibold text-zinc-800 tabular-nums">{breakdown.easy}</div>
            </div>
          )}
          {breakdown.medium && (
            <div className="bg-zinc-50 border border-zinc-100 rounded-md py-1.5 px-1">
              <div className="text-[10px] font-semibold uppercase text-amber-600">Med</div>
              <div className="text-xs font-semibold text-zinc-800 tabular-nums">{breakdown.medium}</div>
            </div>
          )}
          {breakdown.hard && (
            <div className="bg-zinc-50 border border-zinc-100 rounded-md py-1.5 px-1">
              <div className="text-[10px] font-semibold uppercase text-rose-600">Hard</div>
              <div className="text-xs font-semibold text-zinc-800 tabular-nums">{breakdown.hard}</div>
            </div>
          )}
        </div>
      )}

      {footer && (
        <div className="mt-3 pt-2 text-xs text-zinc-500 border-t border-zinc-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default StatCard;