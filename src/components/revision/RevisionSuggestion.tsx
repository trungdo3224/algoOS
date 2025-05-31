import React from 'react';
import { AlertTriangle, Clock, Tag, TrendingUp } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface RevisionSuggestionProps {
  problemTitle: string;
  category: string;
  lastAttemptDate: Date;
  score: number;
  attempts: number;
  weakAreas: string[];
  revisionReason: {
    type: 'low_score' | 'pattern_weakness' | 'time_elapsed' | 'multiple_attempts';
    description: string;
  };
  onStart: () => void;
}

const RevisionSuggestion: React.FC<RevisionSuggestionProps> = ({
  problemTitle,
  category,
  lastAttemptDate,
  score,
  attempts,
  weakAreas,
  revisionReason,
  onStart,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getReasonIcon = () => {
    switch (revisionReason.type) {
      case 'low_score':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case 'pattern_weakness':
        return <Tag className="h-5 w-5 text-yellow-500" />;
      case 'time_elapsed':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'multiple_attempts':
        return <AlertTriangle className="h-5 w-5 text-purple-500" />;
    }
  };

  const getReasonColor = () => {
    switch (revisionReason.type) {
      case 'low_score':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'pattern_weakness':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'time_elapsed':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'multiple_attempts':
        return 'bg-purple-50 text-purple-700 border-purple-100';
    }
  };

  return (
    <Card hoverable className="h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{problemTitle}</h3>
          <div className="flex items-center mt-1">
            <span className="text-sm text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">
              {category}
            </span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-sm text-gray-500">
              Last attempt: {formatDate(lastAttemptDate)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center justify-center rounded-full h-10 w-10 bg-red-50 text-red-600 font-medium">
            {score}/10
          </div>
          <span className="text-xs text-gray-500 mt-1">
            {attempts} attempt{attempts !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className={`p-3 rounded-lg mb-4 border ${getReasonColor()}`}>
        <div className="flex items-center">
          {getReasonIcon()}
          <p className="ml-2 text-sm">{revisionReason.description}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center text-sm font-medium text-amber-600 mb-2">
          <AlertTriangle className="h-4 w-4 mr-1" />
          Areas to improve:
        </div>
        <ul className="list-disc list-inside space-y-1">
          {weakAreas.map((area, index) => (
            <li key={index} className="text-sm text-gray-700">
              {area}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-auto pt-2">
        <Button
          onClick={onStart}
          variant="outline"
          className="w-full"
        >
          Start Revision
        </Button>
      </div>
    </Card>
  );
};

export default RevisionSuggestion;