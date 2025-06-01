import React from 'react';
import Card from '../ui/Card';
import type { ProblemStatus } from '../../lib/supabase';

interface StatusData {
  status: ProblemStatus;
  count: number;
}

interface StatusPieChartProps {
  data: StatusData[];
}

const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const getStatusColor = (status: ProblemStatus) => {
    switch (status) {
      case 'Đã tự giải':
        return 'from-green-500 to-green-600';
      case 'Giải với hint':
        return 'from-yellow-500 to-yellow-600';
      case 'Giải từ solution':
        return 'from-orange-500 to-orange-600';
      case 'Cần ôn tập sớm':
        return 'from-red-500 to-red-600';
      case 'Đã ôn tập':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  let cumulativePercentage = 0;

  return (
    <Card title="Phân bố trạng thái giải">
      <p className="text-sm text-gray-500 mb-4">Thống kê trạng thái giải các bài tập</p>
      <div className="relative w-48 h-48 mx-auto mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-white shadow-inner" />
        </div>
        {data.map((item) => {
          const percentage = (item.count / total) * 100;
          const rotate = cumulativePercentage;
          cumulativePercentage += percentage;

          return (
            <div
              key={item.status}
              className={`absolute inset-0 bg-gradient-to-br ${getStatusColor(item.status)}`}
              style={{
                clipPath: `conic-gradient(from ${rotate}deg, currentColor ${percentage}deg, transparent ${percentage}deg)`,
              }}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {data.map((item) => (
          <div key={item.status} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${getStatusColor(item.status)}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.status}</p>
              <p className="text-xs text-gray-500">{((item.count / total) * 100).toFixed(0)}%</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StatusPieChart;