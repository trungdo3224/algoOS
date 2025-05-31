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
  const maxScore = Math.max(...data.map(d => d.score));

  return (
    <Card title="Pattern Analysis">
      <div className="space-y-4">
        {data.map((pattern) => (
          <div key={pattern.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700">{pattern.name}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({pattern.problemCount} problems)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {pattern.score.toFixed(1)}/10
                </span>
                <span
                  className={`text-xs ${
                    pattern.trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {pattern.trend > 0 ? '↑' : '↓'} {Math.abs(pattern.trend)}%
                </span>
              </div>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                style={{ width: `${(pattern.score / 10) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white bg-opacity-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PatternAnalysis;