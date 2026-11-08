import React, { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Clock, X } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import type { Problem, ProblemStatus } from '../../lib/supabase';

interface ProblemSelectorProps {
  onSelectProblem: (problem: Problem) => void;
  onAddNewProblem: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const ProblemSelector: React.FC<ProblemSelectorProps> = ({
  onSelectProblem,
  onAddNewProblem,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchProblems();
    }
  }, [isOpen]);

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*');
      
      if (error) throw error;
      setProblems(data || []);
    } catch (err) {
      setError('Failed to load problems');
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: ProblemStatus) => {
    switch (status) {
      case 'Đã tự giải':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/70';
      case 'Giải với hint':
        return 'bg-amber-50 text-amber-800 border-amber-200/70';
      case 'Giải từ solution':
        return 'bg-orange-50 text-orange-800 border-orange-200/70';
      case 'Cần ôn tập sớm':
        return 'bg-rose-50 text-rose-800 border-rose-200/70';
      case 'Đã ôn tập':
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'medium':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      case 'hard':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (problem.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleProblemClick = (problem: Problem) => {
    onSelectProblem(problem);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-zinc-200/90 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-zinc-950">Select Problem Target</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Select from your curriculum or instantiate a new problem</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by title, tag or complexity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50/50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 focus:bg-white text-zinc-900"
              />
            </div>
            <Button
              onClick={onAddNewProblem}
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Add New
            </Button>
          </div>
        </div>

        {/* Problem List */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-zinc-900 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-rose-600 text-center py-8 text-xs font-medium">{error}</div>
          ) : filteredProblems.length === 0 ? (
            <div className="text-zinc-400 text-center py-12 text-xs font-mono">
              {searchQuery ? 'No problems matching criteria' : 'No problems loaded in database'}
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <div
                key={problem.problem_id}
                onClick={() => handleProblemClick(problem)}
                className="bg-white border border-zinc-200/90 rounded-xl p-4 hover:border-zinc-400 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <BookOpen className="h-4 w-4 text-zinc-500 group-hover:text-zinc-950 flex-shrink-0" />
                      <h3 className="text-sm font-bold text-zinc-900 group-hover:text-zinc-950 truncate">
                        {problem.title}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-600 mb-3 line-clamp-2 leading-relaxed">
                      {problem.description}
                    </p>
                    <div className="flex items-center space-x-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getDifficultyBadge(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                      {problem.status && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${getStatusBadge(problem.status)}`}>
                          {problem.status}
                        </span>
                      )}
                      <span className="flex items-center text-[11px] font-mono text-zinc-400">
                        <Clock className="h-3 w-3 mr-1 text-zinc-400" />
                        20-30m
                      </span>
                    </div>
                  </div>

                  {problem.tags && problem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 justify-end max-w-[180px] flex-shrink-0">
                      {problem.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200/60"
                        >
                          {tag}
                        </span>
                      ))}
                      {problem.tags.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono text-zinc-400">
                          +{problem.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemSelector;
