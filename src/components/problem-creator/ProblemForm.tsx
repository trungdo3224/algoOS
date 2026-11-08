import React, { useState, useEffect } from 'react';
import { Plus, Minus, HelpCircle, Tag as TagIcon, FileText, AlertTriangle, Clock, RefreshCw, StickyNote, Globe } from 'lucide-react';
import Button from '../ui/Button';
import type { Problem, ProblemStatus, ProblemSite } from '../../lib/supabase';

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
  site?: ProblemSite;
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

const PROBLEM_SITES: ProblemSite[] = [
  'LeetCode',
  'Codeforces',
  'HackerRank',
  'AtCoder',
  'CodeChef',
  'TopCoder',
  'SPOJ',
  'GeeksforGeeks',
  'InterviewBit',
  'Custom'
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
    site: undefined,
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
        site: initialData.site,
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
      {/* Basic Attributes Section */}
      <div className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Core Problem Identifiers
        </h3>
        
        <div>
          <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
            Problem Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
            placeholder="e.g., Trapping Rain Water"
            required
          />
          {errors.title && (
            <p className="mt-1.5 text-xs text-rose-600 flex items-center">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              {errors.title}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-2">
              Difficulty *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map(level => {
                const isSelected = formData.difficulty === level;
                return (
                  <label
                    key={level}
                    className={`
                      flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all capitalize
                      ${isSelected
                        ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm'
                        : 'border-zinc-200/90 bg-white hover:bg-zinc-50 text-zinc-700'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      value={level}
                      checked={isSelected}
                      onChange={e => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                      required
                    />
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      level === 'easy' ? 'bg-emerald-400' :
                      level === 'medium' ? 'bg-amber-400' : 'bg-rose-400'
                    }`} />
                    <span>{level}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-2">
              Problem Platform
            </label>
            <div className="relative">
              <select
                value={formData.site || ''}
                onChange={e => setFormData(prev => ({ ...prev, site: e.target.value as ProblemSite || undefined }))}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
              >
                <option value="">Select Platform (Optional)</option>
                {PROBLEM_SITES.map(site => (
                  <option key={site} value={site}>
                    {site}
                  </option>
                ))}
              </select>
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-2">
            Practice Status *
          </label>
          <div className="flex flex-wrap gap-2">
            {PROBLEM_STATUSES.map(status => {
              const isSelected = formData.status === status;
              return (
                <label
                  key={status}
                  className={`
                    px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all
                    ${isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                    }
                  `}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    value={status}
                    checked={isSelected}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as ProblemStatus }))}
                    required
                  />
                  <span>{status}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Description & Constraints Section */}
      <div className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
            Problem Statement / Description
          </label>
          <div className="relative">
            <textarea
              id="description"
              rows={5}
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors leading-relaxed"
              placeholder="State the problem clearly, including the input format, output format, and any specific invariants..."
            />
            <div className="absolute top-2.5 right-3 text-zinc-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-2">
            Algorithmic Tags
          </label>
          <div className="p-3.5 rounded-lg border border-zinc-200/80 bg-zinc-50/50">
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map(tag => {
                const isSelected = formData.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`
                      inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono transition-colors
                      ${isSelected
                        ? 'bg-zinc-900 text-white border border-zinc-900 font-semibold'
                        : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }
                    `}
                  >
                    <TagIcon className="h-3 w-3 mr-1 opacity-70" />
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Examples Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Input &amp; Output Test Cases
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addExample}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Add Case
            </Button>
          </div>
          <div className="space-y-3">
            {formData.examples.map((example, index) => (
              <div key={index} className="relative p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-zinc-900">
                    Test Case #{index + 1}
                  </span>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      className="text-zinc-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-zinc-500 mb-1">Input</label>
                    <input
                      type="text"
                      value={example.input}
                      onChange={e => updateExample(index, 'input', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                      placeholder="nums = [2,7,11,15], target = 9"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-medium text-zinc-500 mb-1">Output</label>
                    <input
                      type="text"
                      value={example.output}
                      onChange={e => updateExample(index, 'output', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                      placeholder="[0,1]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">Explanation</label>
                  <textarea
                    value={example.explanation}
                    onChange={e => updateExample(index, 'explanation', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                    placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Constraints */}
        <div>
          <label htmlFor="constraints" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
            Boundary Constraints
          </label>
          <textarea
            id="constraints"
            rows={3}
            value={formData.constraints}
            onChange={e => setFormData(prev => ({ ...prev, constraints: e.target.value }))}
            className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
            placeholder="1 <= nums.length <= 10^5&#10;-10^9 <= nums[i] <= 10^9"
          />
        </div>

        {/* Hint */}
        <div>
          <label htmlFor="hint" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
            Socratic Hint (Optional)
          </label>
          <div className="relative">
            <textarea
              id="hint"
              rows={2}
              value={formData.hint}
              onChange={e => setFormData(prev => ({ ...prev, hint: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
              placeholder="Consider storing previously visited values in a hash set to achieve O(1) lookup..."
            />
            <div className="absolute top-2.5 right-3 text-zinc-400">
              <HelpCircle className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Cadence Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="time_taken" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
              Time Taken (Minutes)
            </label>
            <div className="relative">
              <input
                type="number"
                id="time_taken"
                min="0"
                value={formData.time_taken || ''}
                onChange={e => setFormData(prev => ({ ...prev, time_taken: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="w-full pl-9 pr-4 py-2 text-xs font-mono bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                placeholder="25"
              />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            </div>
            {errors.time_taken && (
              <p className="mt-1 text-xs text-rose-600">{errors.time_taken}</p>
            )}
          </div>

          <div>
            <label htmlFor="attempts" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
              Number of Attempts
            </label>
            <div className="relative">
              <input
                type="number"
                id="attempts"
                min="0"
                value={formData.attempts || ''}
                onChange={e => setFormData(prev => ({ ...prev, attempts: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="w-full pl-9 pr-4 py-2 text-xs font-mono bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                placeholder="1"
              />
              <RefreshCw className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            </div>
            {errors.attempts && (
              <p className="mt-1 text-xs text-rose-600">{errors.attempts}</p>
            )}
          </div>
        </div>

        {/* Note */}
        <div>
          <label htmlFor="note" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1.5">
            Personal Reflection &amp; Caveats
          </label>
          <div className="relative">
            <textarea
              id="note"
              rows={3}
              value={formData.note}
              onChange={e => setFormData(prev => ({ ...prev, note: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
              placeholder="Key lesson learned, edge case caught during interview..."
            />
            <div className="absolute top-2.5 right-3 text-zinc-400">
              <StickyNote className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200/80">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          {initialData ? 'Update Challenge' : 'Save to Problem Bank'}
        </Button>
      </div>
    </form>
  );
};

export default ProblemForm;
