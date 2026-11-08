import React, { useState } from 'react';
import { Zap, AlertTriangle, Lightbulb, Terminal } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface CodeInputFormProps {
  onSubmit: (code: string, pattern?: string, difficulty?: 'Easy' | 'Medium' | 'Hard') => void;
  isLoading: boolean;
}

const CodeInputForm: React.FC<CodeInputFormProps> = ({ onSubmit, isLoading }) => {
  const [code, setCode] = useState('');
  const [selectedPattern, setSelectedPattern] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [error, setError] = useState('');

  const algorithmicPatterns = [
    'Auto-detect from code',
    'Array Manipulation',
    'Two Pointers',
    'Sliding Window',
    'Binary Search',
    'Sorting',
    'Hash Table',
    'Stack/Queue',
    'Linked List',
    'Tree Traversal',
    'Graph Algorithms',
    'Dynamic Programming',
    'Greedy Algorithm',
    'Backtracking',
    'Divide and Conquer',
    'Bit Manipulation',
    'String Processing',
    'Mathematical'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.trim().length < 20) {
      setError('Please provide a more substantial code snippet (at least 20 characters).');
      return;
    }

    const pattern = selectedPattern === 'Auto-detect from code' ? undefined : selectedPattern;
    onSubmit(code.trim(), pattern, difficulty);
  };

  const handleCodeExample = (exampleCode: string) => {
    setCode(exampleCode);
  };

  const codeExamples = [
    {
      name: 'Two Sum',
      code: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      pattern: 'Hash Table'
    },
    {
      name: 'Binary Search',
      code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
      pattern: 'Binary Search'
    },
    {
      name: 'Sliding Window',
      code: `def max_sum_subarray(arr, k):
    if len(arr) < k:
        return -1
    
    window_sum = sum(arr[:k])
    max_sum = window_sum
    
    for i in range(len(arr) - k):
        window_sum = window_sum - arr[i] + arr[i + k]
        max_sum = max(max_sum, window_sum)
    
    return max_sum`,
      pattern: 'Sliding Window'
    }
  ];

  return (
    <Card>
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-100">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-zinc-950 text-white rounded-lg flex items-center justify-center font-mono">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-950">Source Implementation</h2>
            <p className="text-xs text-zinc-500">Paste your algorithm to infer problem requirements and constraints</p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
          Python / TS / C++ / Java
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Code Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="code" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Solution Code *
            </label>
            <div className="text-[11px] text-zinc-400 font-mono">
              {code.length} chars
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2 h-2 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-zinc-400">solution.py</span>
              </span>
              <span className="text-zinc-500">UTF-8</span>
            </div>
            <textarea
              id="code"
              rows={12}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 text-zinc-100 focus:outline-none font-mono text-xs leading-relaxed selection:bg-zinc-800"
              placeholder={`def solution(arr):\n    # Your algorithm implementation here\n    result = []\n    for i in range(len(arr)):\n        # Process each element\n        pass\n    return result`}
              required
            />
          </div>
          {error && (
            <div className="mt-2 flex items-center text-xs font-medium text-rose-600">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Quick Examples */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-2.5">
            Load Preset Implementation
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {codeExamples.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  handleCodeExample(example.code);
                  setSelectedPattern(example.pattern);
                }}
                className="p-3 text-left rounded-lg border border-zinc-200/80 bg-zinc-50/50 hover:bg-zinc-100 hover:border-zinc-300 transition-all text-xs"
              >
                <div className="font-semibold text-zinc-900">{example.name}</div>
                <div className="text-[11px] font-mono text-zinc-500 mt-1">{example.pattern}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Pattern Selection */}
        <div>
          <label htmlFor="pattern" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-2">
            Target Algorithmic Pattern (Optional)
          </label>
          <select
            id="pattern"
            value={selectedPattern}
            onChange={(e) => setSelectedPattern(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none transition-colors"
          >
            {algorithmicPatterns.map((pattern) => (
              <option key={pattern} value={pattern}>
                {pattern}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-zinc-400">
            Leave as "Auto-detect" to infer the optimal invariant pattern directly from code AST.
          </p>
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-2.5">
            Target Problem Difficulty
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['Easy', 'Medium', 'Hard'] as const).map((level) => {
              const isSelected = difficulty === level;
              return (
                <label
                  key={level}
                  className={`
                    flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all
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
                    onChange={(e) => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                  />
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      level === 'Easy' ? 'bg-emerald-400' :
                      level === 'Medium' ? 'bg-amber-400' : 'bg-rose-400'
                    }`} />
                    {level}
                  </div>
                  <span className={`text-[10px] mt-1 text-center ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {level === 'Easy' && 'Basic invariants'}
                    {level === 'Medium' && 'Standard patterns'}
                    {level === 'Hard' && 'Edge-heavy bounds'}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200/70 text-xs text-zinc-600 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-zinc-900">
            <Lightbulb className="h-4 w-4 text-zinc-700" />
            <span>Optimal Synthesis Guidelines</span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Include function signatures, variable naming, and return statements. The engine extracts preconditions, asymptotic bounds, and generates test suites tailored to the algorithm.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={!code.trim() || isLoading}
            isLoading={isLoading}
            variant="primary"
            rightIcon={<Zap className="h-4 w-4 text-amber-400" />}
          >
            Generate Problem Specification
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CodeInputForm;
