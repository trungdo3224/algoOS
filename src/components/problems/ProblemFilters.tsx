import React from 'react';
import { Filter, X, Globe, Tag, BarChart } from 'lucide-react';
import type { ProblemSite } from '../../lib/supabase';

interface FilterState {
  site: ProblemSite | 'all';
  difficulty: 'all' | 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

interface ProblemFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableTags: string[];
  availableSites: ProblemSite[];
}

const ProblemFilters: React.FC<ProblemFiltersProps> = ({
  filters,
  onFiltersChange,
  availableTags,
  availableSites,
}) => {
  const handleSiteChange = (site: ProblemSite | 'all') => {
    onFiltersChange({ ...filters, site });
  };

  const handleDifficultyChange = (difficulty: 'all' | 'Easy' | 'Medium' | 'Hard') => {
    onFiltersChange({ ...filters, difficulty });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      site: 'all',
      difficulty: 'all',
      tags: []
    });
  };

  const hasActiveFilters = filters.site !== 'all' || filters.difficulty !== 'all' || filters.tags.length > 0;

  const getSiteIcon = (site: ProblemSite) => {
    const siteIcons: Record<ProblemSite, string> = {
      'LeetCode': '🟠',
      'Codeforces': '🔵',
      'HackerRank': '🟢',
      'AtCoder': '🔴',
      'CodeChef': '🟤',
      'TopCoder': '🟡',
      'SPOJ': '⚪',
      'GeeksforGeeks': '🟢',
      'InterviewBit': '🔷',
      'Custom': '⭐'
    };
    return siteIcons[site] || '🌐';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'Hard':
        return 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      {/* Site Filter */}
      <div>
        <div className="flex items-center mb-2">
          <Globe className="h-4 w-4 text-gray-500 mr-2" />
          <label className="text-sm font-medium text-gray-700">Platform</label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSiteChange('all')}
            className={`
              px-3 py-1.5 text-sm rounded-full border transition-colors
              ${filters.site === 'all'
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }
            `}
          >
            All Platforms
          </button>
          {availableSites.map(site => (
            <button
              key={site}
              onClick={() => handleSiteChange(site)}
              className={`
                px-3 py-1.5 text-sm rounded-full border transition-colors flex items-center
                ${filters.site === site
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }
              `}
            >
              <span className="mr-1">{getSiteIcon(site)}</span>
              {site}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div>
        <div className="flex items-center mb-2">
          <BarChart className="h-4 w-4 text-gray-500 mr-2" />
          <label className="text-sm font-medium text-gray-700">Difficulty</label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleDifficultyChange('all')}
            className={`
              px-3 py-1.5 text-sm rounded-full border transition-colors
              ${filters.difficulty === 'all'
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }
            `}
          >
            All Levels
          </button>
          {(['Easy', 'Medium', 'Hard'] as const).map(difficulty => (
            <button
              key={difficulty}
              onClick={() => handleDifficultyChange(difficulty)}
              className={`
                px-3 py-1.5 text-sm rounded-full border transition-colors
                ${filters.difficulty === difficulty
                  ? getDifficultyColor(difficulty).replace('hover:bg-', 'bg-').replace('bg-gray-50', 'bg-blue-100').replace('text-gray-600', 'text-blue-800').replace('border-gray-200', 'border-blue-200')
                  : getDifficultyColor(difficulty)
                }
              `}
            >
              {difficulty}
            </button>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      <div>
        <div className="flex items-center mb-2">
          <Tag className="h-4 w-4 text-gray-500 mr-2" />
          <label className="text-sm font-medium text-gray-700">Tags</label>
        </div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`
                px-3 py-1.5 text-sm rounded-full border transition-colors
                ${filters.tags.includes(tag)
                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }
              `}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Active filters:</div>
          <div className="flex flex-wrap gap-1">
            {filters.site !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                <span className="mr-1">{getSiteIcon(filters.site)}</span>
                {filters.site}
                <button
                  onClick={() => handleSiteChange('all')}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.difficulty !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                {filters.difficulty}
                <button
                  onClick={() => handleDifficultyChange('all')}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="ml-1 hover:text-purple-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemFilters;