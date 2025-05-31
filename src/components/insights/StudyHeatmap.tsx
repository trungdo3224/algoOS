import React from 'react';
import Card from '../ui/Card';

interface StudyData {
  date: string;
  minutes: number;
  problems: number;
}

interface StudyHeatmapProps {
  data: StudyData[];
}

const StudyHeatmap: React.FC<StudyHeatmapProps> = ({ data }) => {
  const maxMinutes = Math.max(...data.map(d => d.minutes));

  const getIntensityClass = (minutes: number) => {
    if (minutes === 0) return 'bg-gray-100';
    const intensity = (minutes / maxMinutes) * 100;
    if (intensity <= 25) return 'bg-green-100';
    if (intensity <= 50) return 'bg-green-200';
    if (intensity <= 75) return 'bg-green-300';
    return 'bg-green-400';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const weeks = Math.ceil(data.length / 7);

  return (
    <Card title="Study Activity">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          Last {weeks} weeks
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Less</span>
          <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {data.map((day) => (
          <div
            key={day.date}
            className={`aspect-square rounded-md transition-all duration-200 hover:scale-110 cursor-pointer ${getIntensityClass(
              day.minutes
            )}`}
            title={`${formatDate(day.date)}
Study time: ${day.minutes} minutes
Problems solved: ${day.problems}`}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Total Time</div>
          <div className="text-lg font-medium text-gray-900">
            {Math.round(data.reduce((sum, d) => sum + d.minutes, 0) / 60)} hours
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Problems Solved</div>
          <div className="text-lg font-medium text-gray-900">
            {data.reduce((sum, d) => sum + d.problems, 0)}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudyHeatmap;