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

  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 p-4 space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-600" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Filter Bank</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center text-xs font-mono text-rose-600 hover:text-rose-700 transition-colors"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Reset
          </button>
        )}
      </div>

      {/* Site Filter */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Globe className="h-3.5 w-3.5 text-zinc-500" />
          <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Platform</label>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleSiteChange('all')}
            className={`
              px-2.5 py-1 text-xs rounded-md font-mono transition-colors border
              ${filters.site === 'all'
                ? 'bg-zinc-950 text-white border-zinc-950 font-semibold shadow-sm'
                : 'bg-zinc-50 text-zinc-700 border-zinc-200/70 hover:bg-zinc-100'
              }
            `}
          >
            All
          </button>
          {availableSites.map(site => {
            const isSelected = filters.site === site;
            return (
              <button
                key={site}
                onClick={() => handleSiteChange(site)}
                className={`
                  px-2.5 py-1 text-xs rounded-md font-mono transition-colors border
                  ${isSelected
                    ? 'bg-zinc-950 text-white border-zinc-950 font-semibold shadow-sm'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200/70 hover:bg-zinc-100'
                  }
                `}
              >
                {site}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <BarChart className="h-3.5 w-3.5 text-zinc-500" />
          <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Difficulty</label>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleDifficultyChange('all')}
            className={`
              px-2.5 py-1.5 text-xs rounded-md font-mono transition-colors border text-center
              ${filters.difficulty === 'all'
                ? 'bg-zinc-950 text-white border-zinc-950 font-semibold shadow-sm'
                : 'bg-zinc-50 text-zinc-700 border-zinc-200/70 hover:bg-zinc-100'
              }
            `}
          >
            All Levels
          </button>
          {(['Easy', 'Medium', 'Hard'] as const).map(difficulty => {
            const isSelected = filters.difficulty === difficulty;
            return (
              <button
                key={difficulty}
                onClick={() => handleDifficultyChange(difficulty)}
                className={`
                  flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md font-mono transition-colors border
                  ${isSelected
                    ? 'bg-zinc-950 text-white border-zinc-950 font-semibold shadow-sm'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200/70 hover:bg-zinc-100'
                  }
                `}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  difficulty === 'Easy' ? 'bg-emerald-400' :
                  difficulty === 'Medium' ? 'bg-amber-400' : 'bg-rose-400'
                }`} />
                <span>{difficulty}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags Filter */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-zinc-500" />
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Topic Tags</label>
          </div>
          {filters.tags.length > 0 && (
            <span className="text-[10px] font-mono text-zinc-500">
              {filters.tags.length} selected
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto pr-1">
          {availableTags.map(tag => {
            const isSelected = filters.tags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`
                  px-2 py-0.5 text-[11px] rounded font-mono transition-colors border
                  ${isSelected
                    ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                    : 'bg-zinc-50 text-zinc-600 border-zinc-200/70 hover:bg-zinc-100'
                  }
                `}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-zinc-100 space-y-2">
          <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Selected Filters</div>
          <div className="flex flex-wrap gap-1">
            {filters.site !== 'all' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 text-zinc-800 border border-zinc-200">
                {filters.site}
                <button
                  onClick={() => handleSiteChange('all')}
                  className="ml-1 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.difficulty !== 'all' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 text-zinc-800 border border-zinc-200">
                {filters.difficulty}
                <button
                  onClick={() => handleDifficultyChange('all')}
                  className="ml-1 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 text-zinc-800 border border-zinc-200">
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="ml-1 text-zinc-400 hover:text-zinc-700"
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
