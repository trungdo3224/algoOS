import React, { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Tag, Clock, Edit, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import ProblemForm from '../components/problem-creator/ProblemForm';
import Button from '../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { fetchProblems, createProblem, updateProblem, deleteProblem } from '../features/problems/problemSlice';
import type { Problem, ProblemStatus } from '../lib/supabase';

interface ProblemData {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string;
  hint?: string;
  status: ProblemStatus;
}

const ProblemCreator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { id: userId } = useAppSelector((state) => state.user);
  const { problems, loading, error } = useAppSelector((state) => state.problems);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  useEffect(() => {
    dispatch(fetchProblems());
  }, [dispatch]);

  const handleSubmit = async (data: ProblemData) => {
    if (!userId) return;

    setIsSubmitting(true);
    setSuccessMessage('');
    setApiError(null);

    try {
      const problemData = {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1),
        tags: data.tags,
        example_input: data.examples[0]?.input || '',
        example_output: data.examples[0]?.output || '',
        constraints: data.constraints,
        hint: data.hint,
        status: data.status
      };

      if (selectedProblem) {
        // For updates, first check if the problem still exists
        const existingProblems = await dispatch(fetchProblems()).unwrap();
        const problemExists = existingProblems.some(p => p.problem_id === selectedProblem.problem_id);
        
        if (!problemExists) {
          throw new Error('Problem not found. It may have been deleted.');
        }
        
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

  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status?: ProblemStatus) => {
    switch (status) {
      case 'Đã tự giải':
        return 'bg-green-100 text-green-800';
      case 'Giải với hint':
        return 'bg-yellow-100 text-yellow-800';
      case 'Giải từ solution':
        return 'bg-orange-100 text-orange-800';
      case 'Cần ôn tập sớm':
        return 'bg-red-100 text-red-800';
      case 'Đã ôn tập':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Problems</h1>
          <p className="text-gray-600">
            Browse and manage algorithm problems.
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
        >
          Add New Problem
        </Button>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search problems by title or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : filteredProblems.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          {searchQuery ? 'No problems match your search' : 'No problems available'}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProblems.map((problem) => (
            <Card
              key={problem.problem_id}
              hoverable
              className="cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900">{problem.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{problem.description}</p>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {problem.difficulty}
                    </span>
                    {problem.status && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(problem.status)}`}>
                        {problem.status}
                      </span>
                    )}
                    <span className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      20-30 min
                    </span>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex flex-wrap gap-2">
                    {problem.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(problem)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(problem.problem_id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Problem Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedProblem ? 'Edit Problem' : 'Create New Problem'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedProblem(null);
                    setApiError(null);
                    setSuccessMessage('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {successMessage && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  {successMessage}
                </div>
              )}

              {apiError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
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
    </div>
  );
};

export default ProblemCreator;