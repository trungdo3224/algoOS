import React from 'react';
import Card from '../ui/Card';

interface TagStats {
  name: string;
  count: number;
}

interface TagDistributionProps {
  tags: TagStats[];
  showAll?: boolean;
}

const TagDistribution: React.FC<TagDistributionProps> = ({ tags, showAll = false }) => {
  const [isExpanded, setIsExpanded] = useState(showAll);
  const sortedTags = [...tags].sort((a, b) => b.count - a.count);
  const displayTags = isExpanded ? sortedTags : sortedTags.slice(0, 8);
  const maxCount = Math.max(...tags.map(t => t.count));

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Problem Tags</h3>
        {sortedTags.length > 8 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isExpanded ? `Show Less` : `Show All (${sortedTags.length})`}
          </button>
        )}
      </div>
      <div className="space-y-4">
        {displayTags.map((tag, index) => (
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
        {!isExpanded && sortedTags.length > 8 && (
          <div className="text-center pt-2">
            <span className="text-sm text-gray-500">
              and {sortedTags.length - 8} more tags...
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TagDistribution;