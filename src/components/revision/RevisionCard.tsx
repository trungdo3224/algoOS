import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface RevisionCardProps {
  problemTitle: string;
  category: string;
  weakAreas: string[];
  lastAttemptDate: Date;
  score: number;
  onStart: () => void;
}

const RevisionCard: React.FC<RevisionCardProps> = ({
  problemTitle,
  category,
  weakAreas,
  lastAttemptDate,
  score,
  onStart,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
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
        <div className="flex items-center justify-center rounded-full h-10 w-10 bg-red-50 text-red-600 font-medium">
          {score}/10
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
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Start Revision
        </Button>
      </div>
    </Card>
  );
};

export default RevisionCard;