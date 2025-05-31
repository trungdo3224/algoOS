import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';

interface GradingResultProps {
  patternRecognition: {
    identifiedPattern: string;
    isCorrectPattern: boolean;
    patternFeedback: string;
  };
  efficiencyAnalysis: {
    complexity: string;
    isOptimal: boolean;
    efficiencyFeedback: string;
  };
  logicalFlow: {
    isClear: boolean;
    flowFeedback: string;
  };
  overallScore: number;
  scoreMax: number;
  summary: string;
  improvementSuggestion: string;
}

const GradingResult: React.FC<GradingResultProps> = ({
  patternRecognition,
  efficiencyAnalysis,
  logicalFlow,
  overallScore,
  scoreMax,
  summary,
  improvementSuggestion,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const scoreColor = getScoreColor(overallScore);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Grading Result</h3>
        <div className="flex items-center mt-2 sm:mt-0">
          <span className="text-sm font-medium text-gray-500 mr-2">Score:</span>
          <span className={`text-2xl font-bold ${scoreColor}`}>{overallScore}/{scoreMax}</span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Overall Summary</h4>
        <p className="text-gray-700">{summary}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="flex items-center text-sm font-medium text-gray-900 mb-2">
            <span className={`mr-2 ${patternRecognition.isCorrectPattern ? 'text-green-600' : 'text-red-600'}`}>
              {patternRecognition.isCorrectPattern ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </span>
            Pattern Recognition
          </h4>
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-sm text-gray-700 mb-2">
              Identified Pattern: <span className="font-medium">{patternRecognition.identifiedPattern}</span>
            </p>
            <p className="text-sm text-gray-600">{patternRecognition.patternFeedback}</p>
          </div>
        </div>

        <div>
          <h4 className="flex items-center text-sm font-medium text-gray-900 mb-2">
            <span className={`mr-2 ${efficiencyAnalysis.isOptimal ? 'text-green-600' : 'text-yellow-600'}`}>
              {efficiencyAnalysis.isOptimal ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
            </span>
            Efficiency Analysis
          </h4>
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-sm text-gray-700 mb-2">
              Time Complexity: <span className="font-medium">{efficiencyAnalysis.complexity}</span>
            </p>
            <p className="text-sm text-gray-600">{efficiencyAnalysis.efficiencyFeedback}</p>
          </div>
        </div>

        <div>
          <h4 className="flex items-center text-sm font-medium text-gray-900 mb-2">
            <span className={`mr-2 ${logicalFlow.isClear ? 'text-green-600' : 'text-yellow-600'}`}>
              {logicalFlow.isClear ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
            </span>
            Logical Flow
          </h4>
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-sm text-gray-600">{logicalFlow.flowFeedback}</p>
          </div>
        </div>

        <div>
          <h4 className="flex items-center text-sm font-medium text-blue-600 mb-2">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Suggestions for Improvement
          </h4>
          <div className="bg-blue-50 text-blue-700 rounded-md p-3">
            <p className="text-sm">{improvementSuggestion}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GradingResult;