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
  const maxCount = tags.length > 0 ? Math.max(...tags.map(t => t.count), 1) : 1;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900">Pattern & Tag Distribution</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Most practiced algorithmic paradigms</p>
        </div>
        <span className="text-xs font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
          {tags.length} patterns
        </span>
      </div>

      {sortedTags.length === 0 ? (
        <div className="py-8 text-center text-zinc-400 text-xs">
          No tags found yet. Tag your problems to see distribution metrics.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTags.slice(0, 8).map((tag) => {
            const pct = Math.min(100, (tag.count / maxCount) * 100);
            return (
              <div key={tag.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-800">{tag.name}</span>
                  <span className="text-zinc-500 font-mono text-[11px] tabular-nums">
                    {tag.count} {tag.count === 1 ? 'problem' : 'problems'}
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default TagDistribution;
