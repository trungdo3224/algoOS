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
  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Score Trend</h3>
          <div className="flex space-x-2">
            {['week', 'month', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p as 'week' | 'month' | 'year')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  period === p
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[200px] flex items-center justify-center text-gray-500">
          No data available for this period
        </div>
      </Card>
    );
  }

  const maxScore = Math.max(...data.map(d => d.score));
  const minScore = Math.min(...data.map(d => d.score));
  const scoreRange = maxScore - minScore;

  const getHeight = (score: number) => {
    if (scoreRange === 0) return 75; // Return middle height if all scores are the same
    return ((score - minScore) / scoreRange) * 150;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Calculate indices for date labels based on data length
  const getDateLabelIndices = () => {
    if (data.length === 1) return [0];
    if (data.length === 2) return [0, 1];
    return [0, Math.floor(data.length / 2), data.length - 1].filter(
      index => index >= 0 && index < data.length
    );
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Score Trend</h3>
        <div className="flex space-x-2">
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p as 'week' | 'month' | 'year')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                period === p
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[200px]">
        <div className="absolute inset-0">
          {[0, 2.5, 5, 7.5, 10].map((score) => (
            <div
              key={score}
              className="absolute left-0 right-0 border-t border-gray-100"
              style={{ bottom: `${(score / 10) * 100}%` }}
            >
              <span className="absolute -left-6 -translate-y-1/2 text-xs text-gray-400">
                {score}
              </span>
            </div>
          ))}
        </div>

        <div className="relative h-full flex items-end">
          {data.map((point, index) => (
            <div
              key={index}
              className="flex-1 flex items-end justify-center"
              title={`Score: ${point.score.toFixed(1)}\nProblems: ${point.problemCount}`}
            >
              <div
                className="w-2 bg-blue-500 rounded-t transition-all duration-300 ease-in-out hover:bg-blue-600"
                style={{ height: `${getHeight(point.score)}px` }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-between text-xs text-gray-500">
        {getDateLabelIndices().map((index) => (
          <span key={index}>{formatDate(data[index].date)}</span>
        ))}
      </div>
    </Card>
  );
};

export default ScoreTrend;