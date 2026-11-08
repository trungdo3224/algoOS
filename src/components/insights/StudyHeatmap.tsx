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
  const maxMinutes = data.length > 0 ? Math.max(...data.map(d => d.minutes), 1) : 1;

  const getIntensityClass = (minutes: number) => {
    if (minutes === 0) return 'bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700';
    const intensity = (minutes / maxMinutes) * 100;
    if (intensity <= 25) return 'bg-emerald-200 dark:bg-emerald-950/80 dark:border dark:border-emerald-900/60 hover:opacity-90';
    if (intensity <= 50) return 'bg-emerald-400 dark:bg-emerald-800 hover:opacity-90';
    if (intensity <= 75) return 'bg-emerald-600 dark:bg-emerald-600 hover:opacity-90';
    return 'bg-emerald-800 dark:bg-emerald-400 hover:opacity-90';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900">Study Intensity Map</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{Math.round(totalMinutes / 60)} hours committed across sessions</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
          <span>Less</span>
          <div className="w-2.5 h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-emerald-200 dark:bg-emerald-950 rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-emerald-400 dark:bg-emerald-800 rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-emerald-600 dark:bg-emerald-600 rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-emerald-800 dark:bg-emerald-400 rounded-sm"></div>
          <span>More</span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="py-8 text-center text-zinc-400 text-xs">
          No study session data recorded yet.
        </div>
      ) : (
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 my-2">
          {data.map((day) => (
            <div
              key={day.date}
              className={`aspect-square rounded-[3px] transition-all duration-150 cursor-pointer ${getIntensityClass(day.minutes)}`}
              title={`${formatDate(day.date)}: ${day.minutes} min • ${day.problems} problems`}
            />
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
        <span>Session Duration Density</span>
        <span className="font-mono text-zinc-700 font-medium">
          Peak: {maxMinutes}m
        </span>
      </div>
    </Card>
  );
};

export default StudyHeatmap;
