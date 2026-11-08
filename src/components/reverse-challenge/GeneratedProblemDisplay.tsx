import React, { useState } from 'react';
import { 
  Play, 
  Copy, 
  Download, 
  Eye, 
  EyeOff, 
  Clock, 
  Zap, 
  Target, 
  Lightbulb, 
  AlertTriangle,
  Code,
  FileText,
  CheckCircle
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import type { GeneratedProblemOutput } from '../../lib/supabase';

interface GeneratedProblemDisplayProps {
  problem: GeneratedProblemOutput;
  onSimulateSolving: () => void;
}

const GeneratedProblemDisplay: React.FC<GeneratedProblemDisplayProps> = ({
  problem,
  onSimulateSolving
}) => {
  const [showHints, setShowHints] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [showEdgeCases, setShowEdgeCases] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200/80';
      case 'Medium':
        return 'text-amber-700 bg-amber-50 border-amber-200/80';
      case 'Hard':
        return 'text-rose-700 bg-rose-50 border-rose-200/80';
      default:
        return 'text-zinc-700 bg-zinc-100 border-zinc-200';
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const exportProblem = () => {
    const problemText = `
# ${problem.title}

**Difficulty:** ${problem.difficulty}
**Tags:** ${problem.tags.join(', ')}
**Pattern:** ${problem.algorithmicPattern}

## Problem Description
${problem.description}

## Input Format
${problem.inputFormat}

## Output Format
${problem.outputFormat}

## Examples
${problem.examples.map((example, index) => `
### Example ${index + 1}
**Input:**
\`\`\`
${example.input}
\`\`\`

**Output:**
\`\`\`
${example.output}
\`\`\`

**Explanation:** ${example.explanation}
`).join('\n')}

## Constraints
${problem.constraints.map(constraint => `- ${constraint}`).join('\n')}

${problem.hints && problem.hints.length > 0 ? `
## Hints
${problem.hints.map(hint => `- ${hint}`).join('\n')}
` : ''}

## Complexity Analysis
- **Time Complexity:** ${problem.timeComplexity}
- **Space Complexity:** ${problem.spaceComplexity}

---
*Synthesized by AlgoMind Reverse Engine*
    `.trim();

    const blob = new Blob([problemText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${problem.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="bg-white border-zinc-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${getDifficultyBadge(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                {problem.algorithmicPattern}
              </span>
              {problem.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-zinc-50 text-zinc-600 border border-zinc-200/70">
                  #{tag}
                </span>
              ))}
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">{problem.title}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Synthesized from source implementation AST analysis</p>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-zinc-100 text-xs font-mono text-zinc-600">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                <span>Time: <strong className="text-zinc-900 font-semibold">{problem.timeComplexity}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-zinc-400" />
                <span>Space: <strong className="text-zinc-900 font-semibold">{problem.spaceComplexity}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-zinc-400" />
                <span>{problem.examples.length} Verified Test Cases</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-zinc-400" />
                <span>{problem.constraints.length} Boundary Constraints</span>
              </div>
            </div>
          </div>

          <div className="flex flex-row lg:flex-col gap-2.5 self-start lg:self-center shrink-0">
            <Button
              onClick={onSimulateSolving}
              variant="primary"
              size="md"
              rightIcon={<Play className="h-3.5 w-3.5" />}
            >
              Simulate in SSA Coach
            </Button>
            <Button
              onClick={exportProblem}
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Export Markdown
            </Button>
          </div>
        </div>
      </Card>

      {/* Problem Description */}
      <Card>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Problem Statement
          </h3>
          <Button
            onClick={() => copyToClipboard(problem.description, 'description')}
            variant="ghost"
            size="sm"
            leftIcon={copiedSection === 'description' ? <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          >
            {copiedSection === 'description' ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">
          {problem.description}
        </p>
      </Card>

      {/* Input / Output Format */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-100">
            <Code className="h-4 w-4 text-zinc-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Input Specification</h3>
          </div>
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/70 text-xs font-mono text-zinc-700 leading-relaxed">
            {problem.inputFormat}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-100">
            <Code className="h-4 w-4 text-zinc-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Output Specification</h3>
          </div>
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/70 text-xs font-mono text-zinc-700 leading-relaxed">
            {problem.outputFormat}
          </div>
        </Card>
      </div>

      {/* Examples */}
      <Card>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-zinc-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Canonical Test Cases
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {problem.examples.length} cases
          </span>
        </div>

        <div className="space-y-4">
          {problem.examples.map((example, index) => (
            <div key={index} className="p-4 rounded-lg border border-zinc-200/80 bg-zinc-50/50 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-900">
                <span className="font-mono text-xs">Example {index + 1}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Input</div>
                  <pre className="p-2.5 rounded bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800">
                    {example.input}
                  </pre>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Output</div>
                  <pre className="p-2.5 rounded bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-zinc-800">
                    {example.output}
                  </pre>
                </div>
              </div>

              {example.explanation && (
                <div className="pt-2 border-t border-zinc-200/60 text-xs text-zinc-600">
                  <span className="font-semibold text-zinc-800">Rationale: </span>
                  {example.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Constraints */}
      <Card>
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-zinc-100">
          <AlertTriangle className="h-4 w-4 text-zinc-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
            Boundary & Invariant Constraints
          </h3>
        </div>
        <ul className="space-y-2">
          {problem.constraints.map((constraint, index) => (
            <li key={index} className="flex items-start text-xs text-zinc-700">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 mr-2.5 shrink-0" />
              <code className="font-mono text-zinc-900 bg-zinc-100 px-1 py-0.5 rounded text-[11px]">{constraint}</code>
            </li>
          ))}
        </ul>
      </Card>

      {/* Deep Dives / Accordions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hints */}
        {problem.hints && problem.hints.length > 0 && (
          <Card>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
              <div className="flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-zinc-500" />
                <h4 className="text-xs font-semibold text-zinc-900">Socratic Hints</h4>
              </div>
              <button
                onClick={() => setShowHints(!showHints)}
                className="text-xs text-zinc-600 hover:text-zinc-950 font-medium inline-flex items-center gap-1"
              >
                {showHints ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showHints ? 'Hide' : 'Reveal'}
              </button>
            </div>
            {showHints ? (
              <ul className="space-y-2 mt-2">
                {problem.hints.map((hint, index) => (
                  <li key={index} className="text-xs text-zinc-600 leading-relaxed flex items-start">
                    <span className="text-zinc-400 mr-1.5 font-mono">•</span>
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-zinc-400 italic">Hints hidden to preserve interview simulation</p>
            )}
          </Card>
        )}

        {/* Inferred Assumptions */}
        {problem.inferredAssumptions.length > 0 && (
          <Card>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-zinc-500" />
                <h4 className="text-xs font-semibold text-zinc-900">Assumptions</h4>
              </div>
              <button
                onClick={() => setShowAssumptions(!showAssumptions)}
                className="text-xs text-zinc-600 hover:text-zinc-950 font-medium inline-flex items-center gap-1"
              >
                {showAssumptions ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showAssumptions ? 'Hide' : 'Reveal'}
              </button>
            </div>
            {showAssumptions ? (
              <ul className="space-y-2 mt-2">
                {problem.inferredAssumptions.map((assumption, index) => (
                  <li key={index} className="text-xs text-zinc-600 leading-relaxed flex items-start">
                    <span className="text-zinc-400 mr-1.5 font-mono">•</span>
                    <span>{assumption}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-zinc-400 italic">Assumptions hidden</p>
            )}
          </Card>
        )}

        {/* Hidden Edge Cases */}
        {problem.hiddenEdgeCases.length > 0 && (
          <Card>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-zinc-500" />
                <h4 className="text-xs font-semibold text-zinc-900">Edge Cases</h4>
              </div>
              <button
                onClick={() => setShowEdgeCases(!showEdgeCases)}
                className="text-xs text-zinc-600 hover:text-zinc-950 font-medium inline-flex items-center gap-1"
              >
                {showEdgeCases ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showEdgeCases ? 'Hide' : 'Reveal'}
              </button>
            </div>
            {showEdgeCases ? (
              <ul className="space-y-2 mt-2">
                {problem.hiddenEdgeCases.map((edgeCase, index) => (
                  <li key={index} className="text-xs text-zinc-600 leading-relaxed flex items-start">
                    <span className="text-rose-500 mr-1.5 font-mono">!</span>
                    <span>{edgeCase}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-zinc-400 italic">Edge cases hidden</p>
            )}
          </Card>
        )}
      </div>

      <div className="text-center py-2 text-xs text-zinc-400">
        Generated with AlgoMind AST Synthesis Engine • {problem.generatedAt.toLocaleDateString()}
      </div>
    </div>
  );
};

export default GeneratedProblemDisplay;
