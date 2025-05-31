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
  return (
    <Card title="Areas for Improvement">
      <div className="space-y-6">
        <div className="p-4 bg-red-50 rounded-lg">
          <h3 className="text-sm font-medium text-red-800 flex items-center mb-2">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Weak Patterns
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.patterns.map((pattern, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-sm"
              >
                {pattern}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 flex items-center mb-2">
            <Brain className="h-4 w-4 mr-2" />
            Concepts to Review
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.concepts.map((concept, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 flex items-center mb-2">
            <Target className="h-4 w-4 mr-2" />
            Recommendations
          </h3>
          <ul className="space-y-2">
            {data.recommendations.map((recommendation, index) => (
              <li
                key={index}
                className="text-sm text-blue-700 flex items-start"
              >
                <span className="h-4 w-4 mr-2 mt-0.5 rounded-full bg-blue-100 flex-shrink-0" />
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default WeaknessSummary;