import React, { useState } from 'react';
import { Tag, Clock, BarChart, ChevronDown, ChevronUp, Code, FileText, Eye, EyeOff } from 'lucide-react';
import Card from '../ui/Card';

interface ProblemStatementProps {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: string;
  tags: string[];
  exampleInput?: string;
  exampleOutput?: string;
  constraints?: string;
}

const ProblemStatement: React.FC<ProblemStatementProps> = ({
  title,
  description,
  difficulty,
  timeEstimate,
  tags,
  exampleInput,
  exampleOutput,
  constraints,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

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
    <div className="space-y-4">
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

      {/* Problem Details Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Problem Details</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showDetails ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                Hide Details
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Show Details
              </>
            )}
          </button>
        </div>

        {showDetails && (
          <div className="space-y-6">
            {/* Example Input/Output */}
            {(exampleInput || exampleOutput) && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Code className="h-4 w-4 mr-2 text-blue-600" />
                  Example
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exampleInput && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Input
                      </div>
                      <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
                        {exampleInput}
                      </pre>
                    </div>
                  )}
                  {exampleOutput && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Output
                      </div>
                      <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
                        {exampleOutput}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Constraints */}
            {constraints && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-amber-600" />
                  Constraints
                </h4>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="text-sm text-amber-800 whitespace-pre-wrap">
                    {constraints}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProblemStatement;