import React, { useState, useEffect } from 'react';
import { Plus, Search, BookOpen, Tag, Clock } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
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

  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Select a Problem</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex space-x-4">
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
            <Button
              onClick={onAddNewProblem}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add New Problem
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
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
                  onClick={() => onSelectProblem(problem)}
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
                    <div className="flex flex-wrap gap-2 ml-4">
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
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemSelector;