import React from 'react';
import Card from '../ui/Card';

interface TagStats {
  name: string;
  count: number;
}

interface TagDistributionProps {
  tags: TagStats[];
}

const TagDistribution: React.FC<TagDistributionProps> = ({ tags }) => {
  const sortedTags = [...tags].sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...tags.map(t => t.count));

  return (
    <Card title="Top Problem Tags">
      <div className="space-y-4">
        {sortedTags.map((tag, index) => (
          <div key={tag.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{tag.name}</span>
              <span className="text-sm text-gray-500">{tag.count} problems</span>
            </div>
            <div className="relative h-2">
              <div className="absolute inset-0 bg-gray-100 rounded-full"></div>
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                style={{ width: `${(tag.count / maxCount) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white bg-opacity-20 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TagDistribution;