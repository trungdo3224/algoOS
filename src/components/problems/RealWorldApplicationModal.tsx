import React, { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw, Code, Lightbulb, Globe, Clock, Database, Zap, Shield, BarChart, Users } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { generateRealWorldApplication } from '../../services/gemini';
import type { Problem, RealWorldApplication } from '../../lib/supabase';

interface RealWorldApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem;
}

const RealWorldApplicationModal: React.FC<RealWorldApplicationModalProps> = ({
  isOpen,
  onClose,
  problem
}) => {
  const [application, setApplication] = useState<RealWorldApplication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateApplication = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateRealWorldApplication(problem);
      setApplication(result);
    } catch (err) {
      console.error('Error generating real-world application:', err);
      setError('Failed to generate real-world application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [problem]);

  useEffect(() => {
    if (isOpen) {
      setApplication(null);
      generateApplication();
    }
  }, [isOpen, problem.problem_id, generateApplication]);

  const handleRegenerate = () => {
    setApplication(null);
    generateApplication();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-zinc-200/90 w-full max-w-5xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-zinc-950 text-white rounded-lg flex items-center justify-center font-mono">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Synthetic Case Study
                </span>
              </div>
              <h2 className="text-base font-bold tracking-tight text-zinc-950">Real-World Engineering Context</h2>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {application && (
              <Button
                onClick={handleRegenerate}
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                disabled={isLoading}
              >
                Regenerate
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-950 text-white rounded-xl mb-4">
                <RefreshCw className="h-5 w-5 animate-spin" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">Synthesizing Real-World Architecture...</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Gemini is translating algorithm invariants into production-grade distributed system scenarios.
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <X className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 mb-1">Generation Failed</h3>
              <p className="text-xs text-zinc-500 mb-4">{error}</p>
              <Button onClick={generateApplication} size="sm" variant="outline" leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                Try Again
              </Button>
            </div>
          )}

          {/* Content */}
          {application && !isLoading && (
            <div className="space-y-6">
              {/* Problem Overview */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-5 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                        problem.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' :
                        problem.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' :
                        'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}>
                        {problem.difficulty}
                      </span>
                      <h3 className="text-base font-bold text-zinc-950">{problem.title}</h3>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">{problem.description}</p>
                  </div>
                </div>
              </div>

              {/* 1. Theoretical Foundation */}
              <Card>
                <div className="flex items-center mb-4 pb-3 border-b border-zinc-100">
                  <div className="h-7 w-7 bg-zinc-950 text-white rounded-lg flex items-center justify-center mr-2.5 font-mono text-xs">
                    01
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Theoretical Foundation</h3>
                    <h4 className="text-sm font-bold text-zinc-900">Computer Science Invariants</h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/70 space-y-2">
                    <h5 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center">
                      <Lightbulb className="h-3 w-3 mr-1 text-zinc-600" />
                      Core Concepts
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {application.theoreticalFoundation.concepts.map((concept, index) => (
                        <span key={index} className="px-2 py-0.5 bg-white text-zinc-800 text-xs font-mono rounded border border-zinc-200">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/70 space-y-2">
                    <h5 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center">
                      <Zap className="h-3 w-3 mr-1 text-zinc-600" />
                      Algorithms &amp; Techniques
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {application.theoreticalFoundation.algorithms.map((algorithm, index) => (
                        <span key={index} className="px-2 py-0.5 bg-white text-zinc-800 text-xs font-mono rounded border border-zinc-200">
                          {algorithm}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/70 space-y-2">
                    <h5 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center">
                      <Database className="h-3 w-3 mr-1 text-zinc-600" />
                      Data Structures
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {application.theoreticalFoundation.dataStructures.map((structure, index) => (
                        <span key={index} className="px-2 py-0.5 bg-white text-zinc-800 text-xs font-mono rounded border border-zinc-200">
                          {structure}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/70 space-y-2">
                    <h5 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center">
                      <BarChart className="h-3 w-3 mr-1 text-zinc-600" />
                      Asymptotic Bounds
                    </h5>
                    <div className="space-y-1 text-xs font-mono">
                      <div>
                        <span className="text-zinc-500">Time:</span> <strong className="text-zinc-900">{application.theoreticalFoundation.timeComplexity}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500">Space:</span> <strong className="text-zinc-900">{application.theoreticalFoundation.spaceComplexity}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-100/70 rounded-lg border border-zinc-200/60 text-xs text-zinc-700 leading-relaxed">
                  <span className="font-semibold text-zinc-900">Rationale: </span>
                  {application.theoreticalFoundation.explanation}
                </div>
              </Card>

              {/* 2. Practical Application */}
              <Card>
                <div className="flex items-center mb-4 pb-3 border-b border-zinc-100">
                  <div className="h-7 w-7 bg-zinc-950 text-white rounded-lg flex items-center justify-center mr-2.5 font-mono text-xs">
                    02
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Industry Architecture</h3>
                    <h4 className="text-sm font-bold text-zinc-900">Production Scale Scenarios</h4>
                  </div>
                </div>

                {/* Real-world Scenarios */}
                <div className="mb-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2.5">
                    Production Scenarios
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {application.practicalApplication.realWorldScenarios.map((scenario, index) => (
                      <div key={index} className="bg-zinc-50/70 rounded-lg p-3.5 border border-zinc-200/70 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Users className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="font-mono font-medium text-zinc-600">{scenario.industry}</span>
                        </div>
                        <h5 className="font-bold text-xs text-zinc-900">{scenario.title}</h5>
                        <p className="text-zinc-600 text-xs leading-relaxed">{scenario.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tradeoff Prompt */}
                <div className="bg-zinc-900 text-white rounded-lg p-4 space-y-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5" />
                    Architectural Tradeoff Prompt
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {application.practicalApplication.openEndedQuestion}
                  </p>
                </div>
              </Card>

              {/* 3. Reframed Problem */}
              <Card>
                <div className="flex items-center mb-4 pb-3 border-b border-zinc-100">
                  <div className="h-7 w-7 bg-zinc-950 text-white rounded-lg flex items-center justify-center mr-2.5 font-mono text-xs">
                    03
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">System Formulation</h3>
                    <h4 className="text-sm font-bold text-zinc-900">{application.reframedProblem.title}</h4>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-zinc-700 leading-relaxed">
                    {application.reframedProblem.description}
                  </p>

                  {/* API Specification */}
                  {application.reframedProblem.apiSpec && (
                    <div className="bg-zinc-950 text-zinc-100 rounded-lg p-4 border border-zinc-800 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-300 pb-2 border-b border-zinc-800">
                        <Code className="h-3.5 w-3.5 text-emerald-400" />
                        <span>API Contract Specification</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        <div>
                          <span className="text-zinc-500">Endpoint:</span>{' '}
                          <code className="text-emerald-400">{application.reframedProblem.apiSpec.endpoint}</code>
                        </div>
                        <div>
                          <span className="text-zinc-500">Method:</span>{' '}
                          <code className="text-amber-400">{application.reframedProblem.apiSpec.method}</code>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-zinc-500 block mb-1">Request Payload:</span>
                          <pre className="p-2 bg-zinc-900 rounded text-[11px] overflow-x-auto text-zinc-300">
                            {application.reframedProblem.apiSpec.requestFormat}
                          </pre>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-zinc-500 block mb-1">Response Payload:</span>
                          <pre className="p-2 bg-zinc-900 rounded text-[11px] overflow-x-auto text-zinc-300">
                            {application.reframedProblem.apiSpec.responseFormat}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Constraints, Edge Cases, System Design */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/70 space-y-2">
                      <h5 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-zinc-500" />
                        SLAs &amp; Constraints
                      </h5>
                      <ul className="space-y-1 text-xs text-zinc-700">
                        {application.reframedProblem.constraints.map((c, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-zinc-400 mr-1.5 font-mono">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/70 space-y-2">
                      <h5 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center">
                        <Shield className="h-3.5 w-3.5 mr-1 text-zinc-500" />
                        Edge Scenarios
                      </h5>
                      <ul className="space-y-1 text-xs text-zinc-700">
                        {application.reframedProblem.edgeCases.map((e, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-zinc-400 mr-1.5 font-mono">•</span>
                            <span>{e}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/70 space-y-2">
                      <h5 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center">
                        <BarChart className="h-3.5 w-3.5 mr-1 text-zinc-500" />
                        System Architecture
                      </h5>
                      <ul className="space-y-1 text-xs text-zinc-700">
                        {application.reframedProblem.systemDesignConsiderations.map((s, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-zinc-400 mr-1.5 font-mono">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealWorldApplicationModal;
