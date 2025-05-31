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

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Problem Distribution</h3>
        <div className="text-sm text-gray-500">{total} total problems</div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-700">Easy</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-sm font-medium text-gray-900">{stats.easy}</span>
              <span className="text-xs text-gray-500">({getPercentage(stats.easy)}%)</span>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
              style={{ width: `${getPercentage(stats.easy)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-700">Medium</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-sm font-medium text-gray-900">{stats.medium}</span>
              <span className="text-xs text-gray-500">({getPercentage(stats.medium)}%)</span>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
              style={{ width: `${getPercentage(stats.medium)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-700">Hard</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-sm font-medium text-gray-900">{stats.hard}</span>
              <span className="text-xs text-gray-500">({getPercentage(stats.hard)}%)</span>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
              style={{ width: `${getPercentage(stats.hard)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DifficultyDistribution;