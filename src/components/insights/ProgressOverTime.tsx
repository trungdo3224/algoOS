import React from 'react';
import Card from '../ui/Card';

interface ProgressData {
  date: string;
  averageScore: number;
  problemsSolved: number;
}

interface ProgressOverTimeProps {
  data: ProgressData[];
  period: 'week' | 'month' | 'year';
  onPeriodChange: (period: 'week' | 'month' | 'year') => void;
}

const ProgressOverTime: React.FC<ProgressOverTimeProps> = ({ 
  data, 
  period, 
  onPeriodChange 
}) => {
  const maxScore = Math.max(...data.map(d => d.averageScore));
  const maxProblems = Math.max(...data.map(d => d.problemsSolved));
  
  // Calculate height for score bars (max 150px)
  const getScoreHeight = (score: number) => {
    return score === 0 ? 0 : Math.max(10, (score / 10) * 150);
  };
  
  // Calculate height for problem bars (max 150px)
  const getProblemHeight = (problems: number) => {
    return problems === 0 ? 0 : Math.max(10, (problems / maxProblems) * 150);
  };
  
  return (
    <Card title="Progress Over Time">
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => onPeriodChange('week')}
          className={`px-3 py-1 text-sm rounded-md ${
            period === 'week'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => onPeriodChange('month')}
          className={`px-3 py-1 text-sm rounded-md ${
            period === 'month'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Month
        </button>
        <button
          onClick={() => onPeriodChange('year')}
          className={`px-3 py-1 text-sm rounded-md ${
            period === 'year'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Year
        </button>
      </div>
      
      <div className="w-full overflow-x-auto">
        <div className="min-w-fit" style={{ width: `${Math.max(500, data.length * 50)}px` }}>
          <div className="flex items-end h-40 mb-2">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex items-end justify-center px-1">
                <div className="flex space-x-1">
                  <div
                    className="w-5 bg-blue-500 rounded-t"
                    style={{ height: `${getScoreHeight(item.averageScore)}px` }}
                    title={`Score: ${item.averageScore.toFixed(1)}`}
                  ></div>
                  <div
                    className="w-5 bg-green-500 rounded-t"
                    style={{ height: `${getProblemHeight(item.problemsSolved)}px` }}
                    title={`Problems: ${item.problemsSolved}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex border-t border-gray-200 pt-2">
            {data.map((item, index) => (
              <div key={index} className="flex-1 text-center">
                <div className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis px-1">
                  {item.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-4 space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
          <span className="text-xs text-gray-600">Avg. Score</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
          <span className="text-xs text-gray-600">Problems Solved</span>
        </div>
      </div>
    </Card>
  );
};

export default ProgressOverTime;