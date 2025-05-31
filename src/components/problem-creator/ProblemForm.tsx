import React, { useState } from 'react';
import { Plus, Minus, HelpCircle, Tag as TagIcon, FileText, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import type { ProblemStatus } from '../../lib/supabase';

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
}

interface ProblemFormProps {
  onSubmit: (data: ProblemFormData) => void;
  isLoading?: boolean;
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

const ProblemForm: React.FC<ProblemFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<ProblemFormData>({
    title: '',
    description: '',
    difficulty: 'medium',
    tags: [],
    examples: [{ input: '', output: '', explanation: '' }],
    constraints: '',
    hint: '',
    status: 'Cần ôn tập sớm'
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProblemFormData, string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProblemFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }
    if (!formData.constraints.trim()) {
      newErrors.constraints = 'Constraints are required';
    }
    if (formData.examples.some(ex => !ex.input.trim() || !ex.output.trim())) {
      newErrors.examples = 'Input and output are required for all examples';
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Problem Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Longest Subarray of 1's After Deleting One Element"
          />
          {errors.title && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Problem Description
          </label>
          <div className="relative">
            <textarea
              id="description"
              rows={6}
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the problem in detail..."
            />
            <div className="absolute top-3 right-3">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          {errors.description && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {errors.description}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Difficulty</label>
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
                />
                <span className="capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
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
                />
                <span>{status}</span>
              </label>
            ))}
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
            {errors.tags && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {errors.tags}
              </p>
            )}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Input</label>
                    <input
                      type="text"
                      value={example.input}
                      onChange={e => updateExample(index, 'input', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., nums = [1,1,0,1]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Output</label>
                    <input
                      type="text"
                      value={example.output}
                      onChange={e => updateExample(index, 'output', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation (Optional)
                    </label>
                    <textarea
                      value={example.explanation}
                      onChange={e => updateExample(index, 'explanation', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Explain why this is the correct output..."
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {errors.examples && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {errors.examples}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="constraints" className="block text-sm font-medium text-gray-700 mb-2">
            Constraints
          </label>
          <textarea
            id="constraints"
            rows={4}
            value={formData.constraints}
            onChange={e => setFormData(prev => ({ ...prev, constraints: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 1 <= nums.length <= 10^5"
          />
          {errors.constraints && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {errors.constraints}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="hint" className="block text-sm font-medium text-gray-700 mb-2">
            Hint (Optional)
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
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button
          type="submit"
          isLoading={isLoading}
          leftIcon={<Plus className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          Create Problem
        </Button>
      </div>
    </form>
  );
};

export default ProblemForm;