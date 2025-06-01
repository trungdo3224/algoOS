import React from 'react';
import Card from '../ui/Card';
import type { ProblemStatus } from '../../lib/supabase';

interface StatusData {
  status: ProblemStatus;
  count: number;
}

interface StatusBarChartProps {
  data: StatusData[];
}

const StatusBarChart: React.FC<StatusBarChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  const getStatusColor = (status: ProblemStatus) => {
    switch (status) {
      case 'Đã tự giải':
        return 'bg-green-500';
      case 'Giải với hint':
        return 'bg-yellow-500';
      case 'Giải từ solution':
        return 'bg-orange-500';
      case 'Cần ôn tập sớm':
        return 'bg-red-500';
      case 'Đã ôn tập':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card title="Thống kê theo trạng thái">
      <p className="text-sm text-gray-500 mb-4">Số lượng bài theo từng trạng thái giải</p>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.status}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{item.status}</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-sm font-medium text-gray-900">{item.count}</span>
                <span className="text-xs text-gray-500">
                  ({((item.count / total) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStatusColor(item.status)} rounded-full transition-all duration-300`}
                style={{ width: `${(item.count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StatusBarChart;