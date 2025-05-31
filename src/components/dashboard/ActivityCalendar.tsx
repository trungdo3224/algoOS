import React from 'react';
import Card from '../ui/Card';

interface ActivityDay {
  date: string;
  problemsSolved: number;
  averageScore: number;
  timeSpent: number;
}

interface ActivityCalendarProps {
  activities: ActivityDay[];
}

const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ activities }) => {
  const maxActivity = Math.max(...activities.map(day => day.problemsSolved));
  
  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    const intensity = (count / maxActivity) * 100;
    if (intensity <= 25) return 'bg-gradient-to-br from-blue-100 to-blue-200';
    if (intensity <= 50) return 'bg-gradient-to-br from-blue-200 to-blue-300';
    if (intensity <= 75) return 'bg-gradient-to-br from-blue-300 to-blue-400';
    return 'bg-gradient-to-br from-blue-400 to-blue-500';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Activity Calendar</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Less</span>
          <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-gradient-to-br from-blue-300 to-blue-400 rounded-sm"></div>
          <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-sm"></div>
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {activities.map((day) => (
          <div
            key={day.date}
            className={`aspect-square rounded-md transition-all duration-200 hover:scale-110 cursor-pointer ${getIntensityClass(day.problemsSolved)}`}
            title={`${formatDate(day.date)}
Problems: ${day.problemsSolved}
Avg Score: ${day.averageScore.toFixed(1)}/10
Time: ${Math.round(day.timeSpent)}min`}
          />
        ))}
      </div>

      <div className="mt-4 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
          {activities.reduce((sum, day) => sum + day.problemsSolved, 0)} total problems solved
        </div>
      </div>
    </Card>
  );
};

export default ActivityCalendar;