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
  const maxActivity = activities.length > 0 
    ? Math.max(...activities.map(day => day.problemsSolved), 1) 
    : 1;
  
  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700';
    const intensity = (count / maxActivity) * 100;
    if (intensity <= 25) return 'bg-blue-200 dark:bg-blue-950/80 dark:border dark:border-blue-900/60 hover:opacity-90';
    if (intensity <= 50) return 'bg-blue-400 dark:bg-blue-800 hover:opacity-90';
    if (intensity <= 75) return 'bg-blue-600 dark:bg-blue-600 hover:opacity-90';
    return 'bg-blue-800 dark:bg-blue-400 hover:opacity-90';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const totalSolved = activities.reduce((sum, day) => sum + day.problemsSolved, 0);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900">Activity Calendar</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{totalSolved} problems completed across session history</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
          <span>Less</span>
          <div className="w-2.5 h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-blue-200 dark:bg-blue-950 rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-blue-400 dark:bg-blue-800 rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-600 rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-blue-800 dark:bg-blue-400 rounded-sm"></div>
          <span>More</span>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center text-zinc-500 text-xs">
          No activity recorded yet. Start solving problems to populate your calendar.
        </div>
      ) : (
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 my-2">
          {activities.map((day) => (
            <div
              key={day.date}
              className={`aspect-square rounded-[3px] transition-all duration-150 cursor-pointer ${getIntensityClass(day.problemsSolved)}`}
              title={`${formatDate(day.date)}: ${day.problemsSolved} solved • Avg ${day.averageScore.toFixed(1)}/10 • ${Math.round(day.timeSpent)}m`}
            />
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
        <span className="font-medium text-zinc-700">Consistency Tracker</span>
        <span className="font-mono text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded text-[11px]">
          {activities.filter(a => a.problemsSolved > 0).length} active days
        </span>
      </div>
    </Card>
  );
};

export default ActivityCalendar;
