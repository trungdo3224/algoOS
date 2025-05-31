import React, { useState } from 'react';
import { Tag, Clock, BarChart, ChevronDown, ChevronUp, Code, FileText } from 'lucide-react';
import Card from '../ui/Card';

interface ProblemStatementProps {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: string;
  tags: string[];
}

const ProblemStatement: React.FC<ProblemStatementProps> = ({
  title,
  description,
  difficulty,
  timeEstimate,
  tags,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTagIcon = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'array':
        return <Code className="h-3 w-3" />;
      case 'dynamic programming':
        return <FileText className="h-3 w-3" />;
      default:
        return <Tag className="h-3 w-3" />;
    }
  };

  const difficultyColor = getDifficultyColor(difficulty);

  return (
    <Card>
      <div className="relative">
        <div className="absolute -top-6 -right-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <BarChart className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <div className="flex flex-wrap items-center mt-2 gap-2">
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${difficultyColor}`}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <span className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {timeEstimate}
            </span>
          </div>
        </div>
        
        <div className={`prose prose-sm max-w-none ${!isExpanded && 'line-clamp-3'}`}>
          <p className="text-gray-700">{description}</p>
        </div>
        
        {description.length > 150 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center mt-2"
          >
            {isExpanded ? (
              <>
                Show less
                <ChevronUp className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Read more
                <ChevronDown className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        )}
        
        <div className="mt-4 flex items-center flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium"
            >
              {getTagIcon(tag)}
              <span>{tag}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ProblemStatement;