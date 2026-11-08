import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../ui/Card';

interface ProblemStatementProps {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: string;
  tags: string[];
  exampleInput?: string;
  exampleOutput?: string;
  constraints?: string;
}

const ProblemStatement: React.FC<ProblemStatementProps> = ({
  title,
  description,
  difficulty,
  timeEstimate,
  tags,
  exampleInput,
  exampleOutput,
  constraints,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'medium':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      case 'hard':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <Card className="mb-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 pb-3 border-b border-zinc-100">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-950">{title}</h2>
          <div className="flex flex-wrap items-center mt-2 gap-2">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getDifficultyBadge(difficulty)}`}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <span className="flex items-center text-xs text-zinc-500 font-mono">
              <Clock className="h-3 w-3 mr-1 text-zinc-400" />
              {timeEstimate}
            </span>
          </div>
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 self-start">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium text-zinc-600 bg-zinc-100 border border-zinc-200/60 px-2 py-0.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Description */}
      <div className="space-y-3 text-xs leading-relaxed text-zinc-700">
        <div className={!isExpanded && description.length > 250 ? 'line-clamp-3' : ''}>
          <p className="whitespace-pre-line">{description}</p>
        </div>
        
        {description.length > 250 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-zinc-900 hover:text-black font-semibold text-xs inline-flex items-center gap-1 focus:outline-none"
          >
            {isExpanded ? (
              <>Show less <ChevronUp className="h-3.5 w-3.5" /></>
            ) : (
              <>Read full description <ChevronDown className="h-3.5 w-3.5" /></>
            )}
          </button>
        )}
      </div>

      {/* Examples & Constraints Accordion */}
      {(exampleInput || exampleOutput || constraints) && (
        <div className="mt-4 pt-3 border-t border-zinc-100">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <span>Examples & Constraints</span>
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-3 font-mono text-xs">
              {(exampleInput || exampleOutput) && (
                <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-lg space-y-2">
                  {exampleInput && (
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">Example Input</span>
                      <pre className="text-zinc-800 bg-white p-2 rounded border border-zinc-200/60 text-xs overflow-x-auto">{exampleInput}</pre>
                    </div>
                  )}
                  {exampleOutput && (
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">Example Output</span>
                      <pre className="text-zinc-800 bg-white p-2 rounded border border-zinc-200/60 text-xs overflow-x-auto">{exampleOutput}</pre>
                    </div>
                  )}
                </div>
              )}

              {constraints && (
                <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-lg">
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-1">Constraints</span>
                  <div className="text-zinc-700 text-xs whitespace-pre-line leading-relaxed">{constraints}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ProblemStatement;
