import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import Card from '../ui/Card';

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
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  className = '',
  breakdown,
}) => {
  // Format number to 2 decimal places if it's a number
  const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;

  return (
    <Card className={`bg-gradient-to-br text-white overflow-hidden relative group hover:shadow-lg transition-all duration-300 ${className}`}>
      {/* Background icon */}
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10 transform group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-full h-full" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center">
          <div className="rounded-lg bg-white bg-opacity-20 p-3 mr-4 backdrop-blur-sm">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-white text-opacity-90 font-medium">{title}</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold tracking-tight">{formattedValue}</h3>
              {trend && (
                <span 
                  className={`text-sm font-medium ${
                    trend.isPositive ? 'text-green-200' : 'text-red-200'
                  }`}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {breakdown && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            {breakdown.easy && (
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-md px-2 py-1.5 group-hover:bg-opacity-15 transition-colors">
                <div className="font-medium mb-0.5">Easy</div>
                <div className="text-white text-opacity-90">{breakdown.easy}</div>
              </div>
            )}
            {breakdown.medium && (
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-md px-2 py-1.5 group-hover:bg-opacity-15 transition-colors">
                <div className="font-medium mb-0.5">Medium</div>
                <div className="text-white text-opacity-90">{breakdown.medium}</div>
              </div>
            )}
            {breakdown.hard && (
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-md px-2 py-1.5 group-hover:bg-opacity-15 transition-colors">
                <div className="font-medium mb-0.5">Hard</div>
                <div className="text-white text-opacity-90">{breakdown.hard}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;