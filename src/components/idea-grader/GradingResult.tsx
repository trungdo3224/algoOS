import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Lightbulb, Compass, Cpu, Layers } from 'lucide-react';
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
  const getScoreBadge = (score: number) => {
    if (score >= 8) return 'text-emerald-700 bg-emerald-50 border-emerald-200/80';
    if (score >= 6) return 'text-amber-700 bg-amber-50 border-amber-200/80';
    return 'text-rose-700 bg-rose-50 border-rose-200/80';
  };

  return (
    <Card className="overflow-hidden">
      {/* Header Evaluation Scorecard */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-zinc-100">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Diagnostic Evaluation</h3>
          <h2 className="text-base font-bold text-zinc-950 mt-0.5">Strategy Competency Report</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 block">Overall Score</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${getScoreBadge(overallScore)}`}>
              {overallScore} / {scoreMax}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/80 mb-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Executive Summary</h4>
        <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">{summary}</p>
      </div>

      {/* Criteria Grid */}
      <div className="space-y-3.5">
        {/* Pattern Recognition */}
        <div className="p-3.5 rounded-lg border border-zinc-200/80 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-zinc-500" />
              <h4 className="text-xs font-bold text-zinc-900">Pattern Recognition</h4>
            </div>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
              patternRecognition.isCorrectPattern 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                : 'bg-rose-50 text-rose-700 border-rose-200/80'
            }`}>
              {patternRecognition.isCorrectPattern ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Identified
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Suboptimal Pattern
                </>
              )}
            </span>
          </div>
          <div className="text-xs text-zinc-600 space-y-1">
            <p>
              Target Invariant: <span className="font-mono font-semibold text-zinc-900">{patternRecognition.identifiedPattern}</span>
            </p>
            <p className="text-zinc-500 leading-relaxed">{patternRecognition.patternFeedback}</p>
          </div>
        </div>

        {/* Efficiency Analysis */}
        <div className="p-3.5 rounded-lg border border-zinc-200/80 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-zinc-500" />
              <h4 className="text-xs font-bold text-zinc-900">Complexity & Efficiency</h4>
            </div>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
              efficiencyAnalysis.isOptimal 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                : 'bg-amber-50 text-amber-700 border-amber-200/80'
            }`}>
              {efficiencyAnalysis.isOptimal ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Asymptotically Optimal
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3" />
                  Suboptimal Complexity
                </>
              )}
            </span>
          </div>
          <div className="text-xs text-zinc-600 space-y-1">
            <p>
              Asymptotic Bound: <span className="font-mono font-semibold text-zinc-900">{efficiencyAnalysis.complexity}</span>
            </p>
            <p className="text-zinc-500 leading-relaxed">{efficiencyAnalysis.efficiencyFeedback}</p>
          </div>
        </div>

        {/* Logical Flow */}
        <div className="p-3.5 rounded-lg border border-zinc-200/80 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-zinc-500" />
              <h4 className="text-xs font-bold text-zinc-900">Logical Coherence & Invariants</h4>
            </div>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
              logicalFlow.isClear 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                : 'bg-amber-50 text-amber-700 border-amber-200/80'
            }`}>
              {logicalFlow.isClear ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Structured
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3" />
                  Ambiguous Transitions
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">{logicalFlow.flowFeedback}</p>
        </div>

        {/* Improvement Suggestion Callout */}
        <div className="p-4 rounded-lg bg-zinc-900 text-white space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            <span>Target Strategic Refinement</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {improvementSuggestion}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default GradingResult;
