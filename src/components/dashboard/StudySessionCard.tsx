import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import Card from '../ui/Card';

interface StudySessionCardProps {
  date: Date;
  duration: number; // in minutes
  problemsSolved: number;
  averageScore: number;
}

const StudySessionCard: React.FC<StudySessionCardProps> = ({
  date,
  duration,
  problemsSolved,
  averageScore,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${mins} min`;
    }
  };

  return (
    <Card hoverable className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span className="text-sm">{formatDate(date)}</span>
        </div>
        <div className="flex items-center text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span className="text-sm">{formatDuration(duration)}</span>
        </div>
      </div>
      
      <div className="flex justify-between mb-2">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500">Problems</p>
          <p className="text-2xl font-bold text-gray-900">{problemsSolved}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500">Avg. Score</p>
          <p className="text-2xl font-bold text-gray-900">{averageScore.toFixed(2)}/10</p>
        </div>
      </div>
      
      <div className="mt-auto pt-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${(averageScore / 10) * 100}%` }}
          ></div>
        </div>
      </div>
    </Card>
  );
};

export default StudySessionCard;