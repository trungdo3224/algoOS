import React, { useState, useEffect } from 'react';
import { Plus, Minus, HelpCircle, Tag as TagIcon, FileText, AlertTriangle, Clock, RefreshCw, StickyNote } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import type { Problem, ProblemStatus } from '../../lib/supabase';

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface ProblemFormData {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  examples: Example[];
  constraints: string;
  hint?: string;
  status: ProblemStatus;
  time_taken?: number;
  attempts?: number;
  note?: string;
}

interface ProblemFormProps {
  onSubmit: (data: ProblemFormData) => void;
  isLoading?: boolean;
  initialData?: Problem | null;
}

const AVAILABLE_TAGS = [
  'Array', 'String', 'Hash Table', 'Dynamic Programming',
  'Math', 'Sorting', 'Greedy', 'Depth-First Search',
  'Binary Search', 'Database', 'Breadth-First Search',
  'Tree', 'Matrix', 'Two Pointers', 'Bit Manipulation',
  'Stack', 'Heap', 'Graph', 'Sliding Window'
];

const PROBLEM_STATUSES: ProblemStatus[] = [
  'Giải với hint',
  'Đã tự giải',
  'Giải từ solution',
  'Cần ôn tập sớm',
  'Đã ôn tập'
];

const ProblemForm: React.FC<ProblemFormProps> = ({ 
  onSubmit, 
  isLoading = false,
  initialData = null
}) => {
  const [formData, setFormData] = useState<ProblemFormData>({
    title: '',
    description: '',
    difficulty: 'medium',
    tags: [],
    examples: [{ input: '', output: '', explanation: '' }],
    constraints: '',
    hint: '',
    status: 'Cần ôn tập sớm',
    time_taken: undefined,
    attempts: undefined,
    note: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProblemFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        difficulty: initialData.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
        tags: initialData.tags || [],
        examples: [
          {
            input: initialData.example_input || '',
            output: initialData.example_output || '',
            explanation: ''
          }
        ],
        constraints: initialData.constraints || '',
        hint: initialData.hint || '',
        status: initialData.status || 'Cần ôn tập sớm',
        time_taken: initialData.time_taken,
        attempts: initialData.attempts,
        note: initialData.note || ''
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProblemFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.time_taken && formData.time_taken < 0) {
      newErrors.time_taken = 'Time taken must be a positive number';
    }

    if (formData.attempts && formData.attempts < 0) {
      newErrors.attempts = 'Number of attempts must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const addExample = () => {
    setFormData(prev => ({
      ...prev,
      examples: [...prev.examples, { input: '', output: '', explanation: '' }]
    }));
  };

  const removeExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const updateExample = (index: number, field: keyof Example, value: string) => {
    setFormData(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) => 
        i === index ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {/* Required Fields Section */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-blue-800 mb-4">Required Fields</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Problem Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter problem title"
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty *</label>
              <div className="flex space-x-4">
                {(['easy', 'medium', 'hard'] as const).map(level => (
                  <label
                    key={level}
                    className={`
                      flex items-center px-4 py-2 rounded-lg border-2 cursor-pointer transition-colors
                      ${formData.difficulty === level
                        ? level === 'easy'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : level === 'medium'
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      value={level}
                      checked={formData.difficulty === level}
                      onChange={e => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                      required
                    />
                    <span className="capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <div className="flex flex-wrap gap-3">
                {PROBLEM_STATUSES.map(status => (
                  <label
                    key={status}
                    className={`
                      flex items-center px-4 py-2 rounded-lg border-2 cursor-pointer transition-colors
                      ${formData.status === status
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      value={status}
                      checked={formData.status === status}
                      onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as ProblemStatus }))}
                      required
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Optional Fields Section */}
        <div className="space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <div className="relative">
              <textarea
                id="description"
                rows={6}
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the problem..."
              />
              <div className="absolute top-3 right-3">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`
                      flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                      ${formData.tags.includes(tag)
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <TagIcon className="h-3.5 w-3.5 mr-1.5" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Examples</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExample}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Example
              </Button>
            </div>
            <div className="space-y-6">
              {formData.examples.map((example, index) => (
                <Card key={index} className="relative bg-gray-50 border-gray-200">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
                      <input
                        type="text"
                        value={example.input}
                        onChange={e => updateExample(index, 'input', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., nums = [1,1,0,1]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Output</label>
                      <input
                        type="text"
                        value={example.output}
                        onChange={e => updateExample(index, 'output', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Explanation
                      </label>
                      <textarea
                        value={example.explanation}
                        onChange={e => updateExample(index, 'explanation', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Explain the example..."
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="constraints" className="block text-sm font-medium text-gray-700 mb-1">
              Constraints
            </label>
            <textarea
              id="constraints"
              rows={4}
              value={formData.constraints}
              onChange={e => setFormData(prev => ({ ...prev, constraints: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="List the constraints..."
            />
          </div>

          <div>
            <label htmlFor="hint" className="block text-sm font-medium text-gray-700 mb-1">
              Hint
            </label>
            <div className="relative">
              <textarea
                id="hint"
                rows={3}
                value={formData.hint}
                onChange={e => setFormData(prev => ({ ...prev, hint: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a helpful hint..."
              />
              <div className="absolute top-3 right-3">
                <HelpCircle className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="time_taken" className="block text-sm font-medium text-gray-700 mb-1">
                Time Taken (minutes)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="time_taken"
                  min="0"
                  value={formData.time_taken || ''}
                  onChange={e => setFormData(prev => ({ ...prev, time_taken: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter time taken"
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.time_taken && (
                <p className="mt-1 text-sm text-red-600">{errors.time_taken}</p>
              )}
            </div>

            <div>
              <label htmlFor="attempts" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Attempts
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="attempts"
                  min="0"
                  value={formData.attempts || ''}
                  onChange={e => setFormData(prev => ({ ...prev, attempts: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter number of attempts"
                />
                <RefreshCw className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.attempts && (
                <p className="mt-1 text-sm text-red-600">{errors.attempts}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <div className="relative">
              <textarea
                id="note"
                rows={4}
                value={formData.note}
                onChange={e => setFormData(prev => ({ ...prev, note: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any additional notes..."
              />
              <div className="absolute top-3 right-3">
                <StickyNote className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button
          type="submit"
          isLoading={isLoading}
          leftIcon={<Plus className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          {initialData ? 'Update Problem' : 'Create Problem'}
        </Button>
      </div>
    </form>
  );
};

export default ProblemForm;