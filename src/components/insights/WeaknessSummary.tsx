import React from 'react';
import { AlertTriangle, Brain, Target } from 'lucide-react';
import Card from '../ui/Card';

interface WeaknessSummaryProps {
  data: {
    patterns: string[];
    concepts: string[];
    recommendations: string[];
  };
}

const WeaknessSummary: React.FC<WeaknessSummaryProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxItems = 5;
  
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Areas for Improvement</h3>
        {(data.patterns.length > maxItems || data.concepts.length > maxItems || data.recommendations.length > maxItems) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isExpanded ? 'Show Less' : 'Show All'}
          </button>
        )}
      </div>
      <div className="space-y-6">
        <div className="p-4 bg-red-50 rounded-lg">
          <h3 className="text-sm font-medium text-red-800 flex items-center mb-2">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Weak Patterns
          </h3>
          <div className="flex flex-wrap gap-2">
            {(isExpanded ? data.patterns : data.patterns.slice(0, maxItems)).map((pattern, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-sm"
              >
                {pattern}
              </span>
            ))}
            {!isExpanded && data.patterns.length > maxItems && (
              <span className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-sm">
                +{data.patterns.length - maxItems} more
              </span>
            )}
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 flex items-center mb-2">
            <Brain className="h-4 w-4 mr-2" />
            Concepts to Review
          </h3>
          <div className="flex flex-wrap gap-2">
            {(isExpanded ? data.concepts : data.concepts.slice(0, maxItems)).map((concept, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm"
              >
                {concept}
              </span>
            ))}
            {!isExpanded && data.concepts.length > maxItems && (
              <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-md text-sm">
                +{data.concepts.length - maxItems} more
              </span>
            )}
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 flex items-center mb-2">
            <Target className="h-4 w-4 mr-2" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {(isExpanded ? data.recommendations : data.recommendations.slice(0, maxItems)).map((recommendation, index) => (
              <li
                key={index}
                className="text-sm text-blue-700 flex items-start"
              >
                <span className="h-4 w-4 mr-2 mt-0.5 rounded-full bg-blue-100 flex-shrink-0" />
                {recommendation}
              </li>
            ))}
            {!isExpanded && data.recommendations.length > maxItems && (
              <li className="text-sm text-blue-600 flex items-start">
                <span className="h-4 w-4 mr-2 mt-0.5 rounded-full bg-blue-50 flex-shrink-0" />
                +{data.recommendations.length - maxItems} more recommendations
              </li>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default WeaknessSummary;