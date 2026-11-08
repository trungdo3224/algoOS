import React, { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Tag, Clock, Edit, Trash2, Briefcase } from 'lucide-react';
import Card from '../components/ui/Card';
import ProblemForm from '../components/problem-creator/ProblemForm';
import ProblemFilters from '../components/problems/ProblemFilters';
import RealWorldApplicationModal from '../components/problems/RealWorldApplicationModal';
import Button from '../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchProblems, createProblem, updateProblem, deleteProblem } from '../features/problems/problemSlice';
import type { Problem, ProblemStatus, ProblemSite } from '../lib/supabase';

interface ProblemData {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  site?: ProblemSite;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string;
  hint?: string;
  status: ProblemStatus;
}

interface FilterState {
  site: ProblemSite | 'all';
  difficulty: 'all' | 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

interface ProblemCreatorProps {
  openModal?: boolean;
  onModalClose?: () => void;
}

const ProblemCreator: React.FC<ProblemCreatorProps> = ({ openModal = false, onModalClose }) => {
  const dispatch = useAppDispatch();
  const { id: userId } = useAppSelector((state) => state.user);
  const { problems, loading, error } = useAppSelector((state) => state.problems);
  
  const [isModalOpen, setIsModalOpen] = useState(openModal);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [isRealWorldModalOpen, setIsRealWorldModalOpen] = useState(false);
  const [realWorldProblem, setRealWorldProblem] = useState<Problem | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    site: 'all',
    difficulty: 'all',
    tags: []
  });

  useEffect(() => {
    dispatch(fetchProblems());
  }, [dispatch]);

  // Effect to sync with parent component's modal state
  useEffect(() => {
    setIsModalOpen(openModal);
  }, [openModal]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProblem(null);
    setApiError(null);
    setSuccessMessage('');
    if (onModalClose) {
      onModalClose();
    }
  };

  const handleSubmit = async (data: ProblemData) => {
    if (!userId) return;

    setIsSubmitting(true);
    setSuccessMessage('');
    setApiError(null);

    try {
      const problemData = {
        title: data.title,
        description: data.description,
        difficulty: (data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1)) as 'Easy' | 'Medium' | 'Hard',
        tags: data.tags,
        site: data.site,
        example_input: data.examples[0]?.input || '',
        example_output: data.examples[0]?.output || '',
        constraints: data.constraints,
        hint: data.hint,
        status: data.status,
        time_taken: data.time_taken,
        attempts: data.attempts,
        note: data.note
      };

      if (selectedProblem) {
        await dispatch(updateProblem({ 
          id: selectedProblem.problem_id, 
          updates: problemData 
        })).unwrap();
        setSuccessMessage('Problem updated successfully!');
      } else {
        await dispatch(createProblem(problemData)).unwrap();
        setSuccessMessage('Problem created successfully!');
      }

      setIsModalOpen(false);
      setSelectedProblem(null);
      if (onModalClose) {
        onModalClose();
      }
    } catch (err: any) {
      console.error('Error saving problem:', err);
      let errorMessage = 'An error occurred while saving the problem.';
      
      if (err.message?.includes('not found') || err.message?.includes('no rows')) {
        errorMessage = selectedProblem 
          ? 'The problem you are trying to update no longer exists.'
          : 'Failed to create the problem. Please try again.';
      } else if (err.message?.includes('unique constraint')) {
        errorMessage = 'A problem with this title already exists.';
      }
      
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (problem: Problem) => {
    setSelectedProblem(problem);
    setApiError(null);
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      try {
        await dispatch(deleteProblem(id)).unwrap();
      } catch (err) {
        console.error('Error deleting problem:', err);
      }
    }
  };

  const handleRealWorldView = (problem: Problem) => {
    setRealWorldProblem(problem);
    setIsRealWorldModalOpen(true);
  };

  // Get unique values for filters
  const availableSites = Array.from(new Set(problems.filter(p => p.site).map(p => p.site!)));
  const availableTags = Array.from(new Set(problems.flatMap(p => p.tags)));

  // Apply filters
  const filteredProblems = problems.filter(problem => {
    // Search filter
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Site filter
    const matchesSite = filters.site === 'all' || problem.site === filters.site;
    
    // Difficulty filter
    const matchesDifficulty = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    
    // Tags filter
    const matchesTags = filters.tags.length === 0 || 
                       filters.tags.some(tag => problem.tags.includes(tag));

    return matchesSearch && matchesSite && matchesDifficulty && matchesTags;
  });

  const getStatusColor = (status?: ProblemStatus) => {
    switch (status) {
      case 'Đã tự giải':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
      case 'Giải với hint':
        return 'bg-amber-50 text-amber-700 border border-amber-200/60';
      case 'Giải từ solution':
        return 'bg-orange-50 text-orange-700 border border-orange-200/60';
      case 'Cần ôn tập sớm':
        return 'bg-rose-50 text-rose-700 border border-rose-200/60';
      case 'Đã ôn tập':
        return 'bg-blue-50 text-blue-700 border border-blue-200/60';
      default:
        return 'bg-zinc-100 text-zinc-700 border border-zinc-200/60';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'Hard':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200/60';
    }
  };

  const getSiteIcon = (site?: ProblemSite) => {
    if (!site) return null;
    
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-600 bg-zinc-100 border border-zinc-200 rounded">
              Curated Problem Bank
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-xs text-zinc-500 font-mono">
              {filteredProblems.length} available
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
            Problem Bank
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Browse, author, and inspect algorithm challenges across global competitive platforms.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedProblem(null);
            setApiError(null);
            setSuccessMessage('');
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="h-4 w-4" />}
          className="self-start sm:self-auto"
        >
          Add Problem
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ProblemFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableTags={availableTags}
            availableSites={availableSites}
          />
        </div>

        {/* Problems List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter by title, topic, or keyword (e.g. Dynamic Programming, Tree)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-zinc-200/90 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            />
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono px-1">
            <span>
              Showing {filteredProblems.length} of {problems.length} challenges
            </span>
            {(filters.site !== 'all' || filters.difficulty !== 'all' || filters.tags.length > 0) && (
              <span className="text-zinc-900 font-medium">Filters active</span>
            )}
          </div>

          {/* Problems Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin" />
              <span className="text-xs font-mono text-zinc-500">Loading problem catalog...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-mono text-center">
              {error}
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="text-center py-16 bg-white border border-zinc-200/80 rounded-xl">
              <p className="text-sm font-medium text-zinc-700 mb-1">No matching problems</p>
              <p className="text-xs text-zinc-400">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProblems.map((problem) => (
                <Card
                  key={problem.problem_id}
                  hoverable
                  className="transition-all hover:border-zinc-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <BookOpen className="h-4 w-4 text-zinc-700 flex-shrink-0" />
                        <h3 className="text-base font-semibold text-zinc-900 tracking-tight">
                          {problem.title}
                        </h3>
                        {problem.site && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 bg-zinc-50 border border-zinc-200/60 px-2 py-0.5 rounded">
                            <span>{getSiteIcon(problem.site)}</span>
                            {problem.site}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-600 mb-3 line-clamp-2 leading-relaxed">
                        {problem.description}
                      </p>

                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium ${getDifficultyBadge(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                        {problem.status && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium ${getStatusColor(problem.status)}`}>
                            {problem.status}
                          </span>
                        )}
                        <span className="inline-flex items-center text-xs text-zinc-400 font-mono">
                          <Clock className="h-3.5 w-3.5 mr-1 text-zinc-400" />
                          20–30m
                        </span>

                        <Button
                          onClick={() => handleRealWorldView(problem)}
                          variant="ghost"
                          size="sm"
                          className="text-zinc-600 hover:text-zinc-900 text-xs py-1 px-2 h-auto"
                          leftIcon={<Briefcase className="h-3.5 w-3.5 text-zinc-400" />}
                        >
                          Real-world scenario
                        </Button>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 flex-shrink-0">
                      <div className="flex flex-wrap gap-1 max-w-xs justify-end">
                        {problem.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 text-zinc-600 border border-zinc-200/60"
                          >
                            <Tag className="h-2.5 w-2.5 mr-1 text-zinc-400" />
                            {tag}
                          </span>
                        ))}
                        {problem.tags.length > 3 && (
                          <span className="text-[10px] font-mono text-zinc-400 px-1 py-0.5">
                            +{problem.tags.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 border-t sm:border-t-0 pt-2 sm:pt-1">
                        <button
                          onClick={() => handleEdit(problem)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-800 rounded hover:bg-zinc-100 transition-colors"
                          title="Edit Problem"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(problem.problem_id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                          title="Delete Problem"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Problem Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200/90 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80 mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {selectedProblem ? 'Edit Problem' : 'Create New Problem'}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Define constraints, test cases, and algorithmic attributes.</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {successMessage && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono px-3.5 py-2.5 rounded-lg">
                  {successMessage}
                </div>
              )}

              {apiError && (
                <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono px-3.5 py-2.5 rounded-lg">
                  {apiError}
                </div>
              )}

              <ProblemForm 
                onSubmit={handleSubmit} 
                isLoading={isSubmitting}
                initialData={selectedProblem}
              />
            </div>
          </div>
        </div>
      )}

      {/* Real-world Application Modal */}
      {realWorldProblem && (
        <RealWorldApplicationModal
          isOpen={isRealWorldModalOpen}
          onClose={() => {
            setIsRealWorldModalOpen(false);
            setRealWorldProblem(null);
          }}
          problem={realWorldProblem}
        />
      )}
    </div>
  );
};

export default ProblemCreator;