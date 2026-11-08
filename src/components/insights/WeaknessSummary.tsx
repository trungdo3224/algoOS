import React from 'react';
import { AlertCircle, Brain, Target, CheckCircle2 } from 'lucide-react';
import Card from '../ui/Card';

interface WeaknessSummaryProps {
  data: {
    patterns: string[];
    concepts: string[];
    recommendations: string[];
  };
}

const WeaknessSummary: React.FC<WeaknessSummaryProps> = ({ data }) => {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900">Adaptive Diagnostics</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Automated identification of cognitive bottlenecks</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.patterns.length > 0 ? (
          <div className="p-3.5 bg-rose-50/60 border border-rose-200/70 rounded-lg">
            <h4 className="text-xs font-semibold text-rose-900 flex items-center mb-2">
              <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-rose-600" />
              Challenging Paradigms
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {data.patterns.map((pattern, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white border border-rose-200 text-rose-700 rounded text-xs font-medium"
                >
                  {pattern}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-lg flex items-center text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600 flex-shrink-0" />
            No systemic weaknesses flagged across recent attempts.
          </div>
        )}

        {data.concepts.length > 0 && (
          <div className="p-3.5 bg-amber-50/60 border border-amber-200/70 rounded-lg">
            <h4 className="text-xs font-semibold text-amber-900 flex items-center mb-2">
              <Brain className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
              Core Concepts to Strengthen
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {data.concepts.map((concept, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white border border-amber-200 text-amber-800 rounded text-xs font-medium"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.recommendations.length > 0 && (
          <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-lg">
            <h4 className="text-xs font-semibold text-zinc-900 flex items-center mb-2">
              <Target className="h-3.5 w-3.5 mr-1.5 text-zinc-600" />
              Targeted Interventions
            </h4>
            <ul className="space-y-1.5">
              {data.recommendations.map((recommendation, index) => (
                <li key={index} className="text-xs text-zinc-600 flex items-start">
                  <span className="text-zinc-400 mr-2">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WeaknessSummary;
