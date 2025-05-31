import React from 'react';
import Card from '../ui/Card';

interface CategoryBreakdownProps {
  categories: {
    name: string;
    score: number;
    problemCount: number;
  }[];
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ categories }) => {
  const maxScore = 10; // Assuming the max score is 10
  
  // Sort categories by score in descending order
  const sortedCategories = [...categories].sort((a, b) => b.score - a.score);
  
  return (
    <Card title="Category Breakdown">
      <div className="space-y-4">
        {sortedCategories.map((category, index) => {
          const scorePercentage = (category.score / maxScore) * 100;
          const barColor = 
            scorePercentage >= 80 ? 'bg-green-500' :
            scorePercentage >= 60 ? 'bg-blue-500' :
            scorePercentage >= 40 ? 'bg-yellow-500' :
            'bg-red-500';
          
          return (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {category.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({category.problemCount} problems)
                  </span>
                </div>
                <span className="text-sm font-semibold">
                  {category.score.toFixed(2)}/{maxScore}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${barColor}`}
                  style={{ width: `${scorePercentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default CategoryBreakdown;