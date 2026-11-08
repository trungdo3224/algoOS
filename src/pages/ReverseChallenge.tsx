import React, { useState } from 'react';
import { RefreshCw, Zap, AlertTriangle } from 'lucide-react';
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
      setError('Failed to generate problem from code. Please check your code syntax and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSimulateSolving = () => {
    alert('This will navigate to SSA Coaching with the generated challenge in your session.');
  };

  const handleReset = () => {
    setGeneratedProblem(null);
    setError(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto pt-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-950 text-white rounded-xl mb-4 shadow-sm">
          <RefreshCw className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 mb-2">
          Reverse Challenge Engine
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-xl mx-auto">
          Deconstruct algorithms like an interviewer. Supply any working implementation to infer the exact problem statement, invariants, and edge constraints that demand that pattern.
        </p>
      </div>

      {/* How It Works */}
      {!generatedProblem && !isGenerating && (
        <Card>
          <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Workflow Methodology</h3>
            <h2 className="text-sm font-semibold text-zinc-900 mt-0.5">How Reverse Engineering Operates</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200/70 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-800 flex items-center justify-center text-xs font-mono font-bold">
                01
              </div>
              <h3 className="text-xs font-bold text-zinc-900">Provide Target Code</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Paste any working snippet or algorithm implementation in Python, TypeScript, Java, or C++.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200/70 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-800 flex items-center justify-center text-xs font-mono font-bold">
                02
              </div>
              <h3 className="text-xs font-bold text-zinc-900">Pattern Synthesis</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                The engine analyzes loop bounds, space allocations, and invariants to detect the intended paradigm.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200/70 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-800 flex items-center justify-center text-xs font-mono font-bold">
                03
              </div>
              <h3 className="text-xs font-bold text-zinc-900">Challenge Formulated</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Receive an authoritative competitive programming problem with boundary conditions and verified examples.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Code Input */}
      {!generatedProblem && !isGenerating && (
        <CodeInputForm onSubmit={handleCodeSubmit} isLoading={isGenerating} />
      )}

      {/* Loading State */}
      {isGenerating && (
        <Card className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-900 text-white rounded-xl mb-4">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-zinc-950 mb-1">Synthesizing Problem Specification...</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto mb-6">
            Gemini is analyzing AST patterns, computing asymptotic bounds, and generating problem constraints.
          </p>
          <div className="max-w-xs mx-auto">
            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-zinc-900 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-rose-200 bg-rose-50/60">
          <div className="text-center py-6">
            <AlertTriangle className="h-8 w-8 mx-auto text-rose-600 mb-2" />
            <h3 className="text-sm font-semibold text-rose-900 mb-1">Analysis Interrupted</h3>
            <p className="text-xs text-rose-700 max-w-md mx-auto mb-4">{error}</p>
            <Button 
              onClick={handleReset} 
              size="sm"
              variant="outline"
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Generated Problem Output */}
      {generatedProblem && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-zinc-950 text-white rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-950">Synthesized Challenge</h2>
                <p className="text-xs text-zinc-500">Competitive programming problem derived from your implementation</p>
              </div>
            </div>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Analyze Another Code
            </Button>
          </div>

          <GeneratedProblemDisplay 
            problem={generatedProblem} 
            onSimulateSolving={handleSimulateSolving}
          />
        </div>
      )}

      {/* Strategic Value */}
      {!generatedProblem && !isGenerating && (
        <Card>
          <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Pedagogical Value</h3>
            <h2 className="text-sm font-semibold text-zinc-900 mt-0.5">Why Practice In Reverse?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-100 space-y-1">
              <h4 className="font-semibold text-zinc-900">Interviewer Perspective</h4>
              <p className="text-zinc-600 leading-relaxed">
                By seeing how a clean algorithm translates into problem statements, you learn what interviewers look for when setting constraints.
              </p>
            </div>
            
            <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-100 space-y-1">
              <h4 className="font-semibold text-zinc-900">Invariant Identification</h4>
              <p className="text-zinc-600 leading-relaxed">
                Forces you to articulate the exact loop and pointer invariants that keep your code correct across boundary inputs.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReverseChallenge;
