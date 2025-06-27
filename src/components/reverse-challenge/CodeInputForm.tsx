import React, { useState } from 'react';
import { Code, Zap, AlertTriangle, Lightbulb } from 'lucide-react';
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
      <div className="flex items-center mb-6">
        <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
          <Code className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Code Input</h2>
          <p className="text-gray-600">Paste your solution code and let AI generate a problem for it</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Code Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Solution Code *
            </label>
            <div className="text-xs text-gray-500">
              Supports Python, JavaScript, Java, C++, and pseudocode
            </div>
          </div>
          <textarea
            id="code"
            rows={12}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="def solution(arr):
    # Your algorithm implementation here
    result = []
    for i in range(len(arr)):
        # Process each element
        pass
    return result"
            required
          />
          {error && (
            <div className="mt-2 flex items-center text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {error}
            </div>
          )}
        </div>

        {/* Quick Examples */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quick Examples (Click to use)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {codeExamples.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  handleCodeExample(example.code);
                  setSelectedPattern(example.pattern);
                }}
                className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900 text-sm">{example.name}</div>
                <div className="text-xs text-gray-500 mt-1">{example.pattern}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Pattern Selection */}
        <div>
          <label htmlFor="pattern" className="block text-sm font-medium text-gray-700 mb-2">
            Expected Algorithmic Pattern (Optional)
          </label>
          <select
            id="pattern"
            value={selectedPattern}
            onChange={(e) => setSelectedPattern(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {algorithmicPatterns.map((pattern) => (
              <option key={pattern} value={pattern}>
                {pattern}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Leave as "Auto-detect" to let AI analyze the pattern from your code
          </p>
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Target Problem Difficulty
          </label>
          <div className="flex space-x-4">
            {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
              <label
                key={level}
                className={`
                  flex items-center px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors
                  ${difficulty === level
                    ? level === 'Easy'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : level === 'Medium'
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
                  checked={difficulty === level}
                  onChange={(e) => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                />
                <div className="text-center">
                  <div className="font-medium">{level}</div>
                  <div className="text-xs mt-1">
                    {level === 'Easy' && 'Simple logic, basic patterns'}
                    {level === 'Medium' && 'Moderate complexity, common patterns'}
                    {level === 'Hard' && 'Complex logic, advanced patterns'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Lightbulb className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">Tips for Better Results</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Include complete, working code with clear logic</li>
                <li>• Add comments to explain complex parts</li>
                <li>• Use meaningful variable names</li>
                <li>• Include edge case handling if present</li>
                <li>• The more complete your solution, the better the generated problem</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!code.trim() || isLoading}
            isLoading={isLoading}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3"
            rightIcon={<Zap className="h-4 w-4" />}
          >
            Generate Problem
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CodeInputForm;