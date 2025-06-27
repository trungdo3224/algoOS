import React, { useState } from 'react';
import { RefreshCw, Code, Lightbulb, Target, ArrowRight, Zap } from 'lucide-react';
import CodeInputForm from '../components/reverse-challenge/CodeInputForm';
import GeneratedProblemDisplay from '../components/reverse-challenge/GeneratedProblemDisplay';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { generateProblemFromCode } from '../services/gemini';
import type { GeneratedProblemOutput } from '../lib/supabase';

const ReverseChallenge: React.FC = () => {
  const [generatedProblem, setGeneratedProblem] = useState<GeneratedProblemOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCodeSubmit = async (
    code: string, 
    pattern?: string, 
    difficulty?: 'Easy' | 'Medium' | 'Hard'
  ) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedProblem(null);

    try {
      const problem = await generateProblemFromCode(code, pattern, difficulty);
      setGeneratedProblem(problem);
    } catch (err) {
      console.error('Error generating problem:', err);
      setError('Failed to generate problem from code. Please check your code and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSimulateSolving = () => {
    // Navigate to SSA coaching with the generated problem
    // For now, we'll just show an alert
    alert('This would navigate to SSA Coaching with the generated problem. Feature coming soon!');
  };

  const handleReset = () => {
    setGeneratedProblem(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
          <RefreshCw className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Reverse Challenge Mode</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Think like a problem setter! Provide your solution code and let AI generate a competitive programming 
          problem that would naturally lead to your implementation.
        </p>
      </div>

      {/* How It Works */}
      {!generatedProblem && !isGenerating && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How Reverse Challenge Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Provide Code</h3>
              <p className="text-gray-600 text-sm">
                Paste your working solution code in any programming language
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. AI Analysis</h3>
              <p className="text-gray-600 text-sm">
                Gemini AI analyzes your code to understand the algorithmic pattern and logic
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Problem Generated</h3>
              <p className="text-gray-600 text-sm">
                Get a complete competitive programming problem with examples and constraints
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      {!generatedProblem && !isGenerating && (
        <CodeInputForm onSubmit={handleCodeSubmit} isLoading={isGenerating} />
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-6">
            <RefreshCw className="h-10 w-10 text-white animate-spin" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Generating Problem...</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Gemini AI is analyzing your code, identifying patterns, and crafting a competitive programming 
            problem that would naturally lead to your solution.
          </p>
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="space-y-3">
                <div className="text-sm text-gray-600">Analyzing code structure...</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                </div>
                <div className="text-xs text-gray-500">Identifying algorithmic patterns and generating problem statement</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <AlertTriangle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Generation Failed</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleReset} leftIcon={<RefreshCw className="h-4 w-4" />}>
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Generated Problem */}
      {generatedProblem && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Generated Problem</h2>
                <p className="text-gray-600">AI-crafted competitive programming challenge</p>
              </div>
            </div>
            <Button
              onClick={handleReset}
              variant="outline"
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Generate Another
            </Button>
          </div>

          <GeneratedProblemDisplay 
            problem={generatedProblem} 
            onSimulateSolving={handleSimulateSolving}
          />
        </div>
      )}

      {/* Benefits Section */}
      {!generatedProblem && !isGenerating && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Use Reverse Challenge?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">🧠 Develop Problem-Setting Skills</h3>
              <p className="text-gray-700">
                Understand how problems are crafted by seeing the reverse process. Learn what makes 
                a good competitive programming problem.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">🔍 Pattern Recognition</h3>
              <p className="text-gray-700">
                See how your code maps to problem statements. Improve your ability to identify 
                patterns and choose appropriate algorithms.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">📚 Learning Tool</h3>
              <p className="text-gray-700">
                Generate practice problems from solutions you've seen. Create variations and 
                similar problems to strengthen your understanding.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">🎯 Insight Generation</h3>
              <p className="text-gray-700">
                Discover hidden assumptions, edge cases, and constraints that your code handles. 
                Gain deeper insights into your own solutions.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReverseChallenge;