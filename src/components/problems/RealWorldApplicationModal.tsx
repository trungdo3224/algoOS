import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Code, Lightbulb, Briefcase, Globe, Clock, Database, Zap, Shield, BarChart, Users } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen && !application) {
      generateApplication();
    }
  }, [isOpen]);

  const generateApplication = async () => {
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
  };

  const handleRegenerate = () => {
    setApplication(null);
    generateApplication();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Real-world Application</h2>
              <p className="text-sm text-gray-600">{problem.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {application && (
              <Button
                onClick={handleRegenerate}
                variant="outline"
                leftIcon={<RefreshCw className="h-4 w-4" />}
                disabled={isLoading}
              >
                Regenerate
              </Button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full mb-6">
                <RefreshCw className="h-8 w-8 text-white animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Real-world Analysis...</h3>
              <p className="text-gray-600">Gemini AI is analyzing the problem and creating practical applications</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <X className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generation Failed</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={generateApplication} leftIcon={<RefreshCw className="h-4 w-4" />}>
                Try Again
              </Button>
            </div>
          )}

          {/* Content */}
          {application && !isLoading && (
            <div className="space-y-8">
              {/* Problem Overview */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{problem.title}</h3>
                    <p className="text-gray-700 mb-4">{problem.description}</p>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium
                        ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                        {problem.difficulty}
                      </span>
                      <div className="flex items-center space-x-2">
                        {problem.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {problem.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{problem.tags.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 1. Theoretical Foundation */}
              <Card>
                <div className="flex items-center mb-6">
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">1. Theoretical Foundation</h3>
                    <p className="text-gray-600">Computer science concepts and algorithmic theory</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                      Core Concepts
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {application.theoreticalFoundation.concepts.map((concept, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-purple-500" />
                      Algorithms
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {application.theoreticalFoundation.algorithms.map((algorithm, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                          {algorithm}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Database className="h-4 w-4 mr-2 text-green-500" />
                      Data Structures
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {application.theoreticalFoundation.dataStructures.map((structure, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          {structure}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <BarChart className="h-4 w-4 mr-2 text-orange-500" />
                      Complexity
                    </h4>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Time:</span> {application.theoreticalFoundation.timeComplexity}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Space:</span> {application.theoreticalFoundation.spaceComplexity}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Explanation</h4>
                  <p className="text-gray-700">{application.theoreticalFoundation.explanation}</p>
                </div>
              </Card>

              {/* 2. Practical Application */}
              <Card>
                <div className="flex items-center mb-6">
                  <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">2. Practical Application</h3>
                    <p className="text-gray-600">Real-world scenarios and industry use cases</p>
                  </div>
                </div>

                {/* Real-world Scenarios */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Industry Scenarios</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.practicalApplication.realWorldScenarios.map((scenario, index) => (
                      <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center mb-2">
                          <Users className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">{scenario.industry}</span>
                        </div>
                        <h5 className="font-semibold text-gray-900 mb-2">{scenario.title}</h5>
                        <p className="text-gray-700 text-sm">{scenario.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Concrete Examples */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Concrete Examples</h4>
                  <div className="space-y-2">
                    {application.practicalApplication.concreteExamples.map((example, index) => (
                      <div key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{example}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Open-ended Question */}
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-6">
                  <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Think About This
                  </h4>
                  <p className="text-yellow-800">{application.practicalApplication.openEndedQuestion}</p>
                </div>

                {/* Modifications */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Real-time System Modifications</h4>
                  <div className="space-y-2">
                    {application.practicalApplication.modifications.map((modification, index) => (
                      <div key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{modification}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* 3. Reframed Problem */}
              <Card>
                <div className="flex items-center mb-6">
                  <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">3. Reframed Problem</h3>
                    <p className="text-gray-600">Software engineering challenge version</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Problem Description */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">{application.reframedProblem.title}</h4>
                    <p className="text-gray-700 mb-4">{application.reframedProblem.description}</p>
                  </div>

                  {/* API Specification */}
                  {application.reframedProblem.apiSpec && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Code className="h-4 w-4 mr-2" />
                        API Specification
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Endpoint:</span> 
                          <code className="ml-2 px-2 py-1 bg-gray-200 rounded">{application.reframedProblem.apiSpec.endpoint}</code>
                        </div>
                        <div>
                          <span className="font-medium">Method:</span> 
                          <code className="ml-2 px-2 py-1 bg-gray-200 rounded">{application.reframedProblem.apiSpec.method}</code>
                        </div>
                        <div>
                          <span className="font-medium">Request:</span> 
                          <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs">{application.reframedProblem.apiSpec.requestFormat}</code>
                        </div>
                        <div>
                          <span className="font-medium">Response:</span> 
                          <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs">{application.reframedProblem.apiSpec.responseFormat}</code>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Constraints, Edge Cases, System Design */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-red-500" />
                        Constraints
                      </h4>
                      <div className="space-y-2">
                        {application.reframedProblem.constraints.map((constraint, index) => (
                          <div key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-gray-700 text-sm">{constraint}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-yellow-500" />
                        Edge Cases
                      </h4>
                      <div className="space-y-2">
                        {application.reframedProblem.edgeCases.map((edgeCase, index) => (
                          <div key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-gray-700 text-sm">{edgeCase}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <BarChart className="h-4 w-4 mr-2 text-blue-500" />
                        System Design
                      </h4>
                      <div className="space-y-2">
                        {application.reframedProblem.systemDesignConsiderations.map((consideration, index) => (
                          <div key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-gray-700 text-sm">{consideration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Footer */}
              <div className="text-center py-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Generated by Gemini AI • {application.generatedAt.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealWorldApplicationModal;