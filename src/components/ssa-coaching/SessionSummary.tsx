import React from 'react';
import { Download, FileText, RotateCcw, CheckCircle2, X } from 'lucide-react';
import Button from '../ui/Button';

interface SummaryData {
  problemTitle: string;
  completedAt: Date;
  totalTime: number; // in minutes
  stageResponses: {
    [stageId: number]: {
      userAnswer: string;
      assistantFeedback: string;
      stageName: string;
    };
  };
}

interface SessionSummaryProps {
  summaryData: SummaryData;
  onResetSession: () => void;
  onClose: () => void;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({
  summaryData,
  onResetSession,
  onClose,
}) => {
  const stageNames = {
    1: 'Understanding the Problem',
    2: 'Simulation',
    3: 'Pattern Recognition',
    4: 'Validation',
    5: 'Solution Planning',
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const exportAsPDF = () => {
    const content = generateSummaryText();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ssa-summary-${summaryData.problemTitle.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsMarkdown = () => {
    const content = generateMarkdownSummary();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ssa-summary-${summaryData.problemTitle.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateSummaryText = () => {
    let content = `SSA Coaching Session Summary\n`;
    content += `Problem: ${summaryData.problemTitle}\n`;
    content += `Completed: ${summaryData.completedAt.toLocaleString()}\n`;
    content += `Total Time: ${formatTime(summaryData.totalTime)}\n\n`;

    Object.entries(summaryData.stageResponses).forEach(([stageId, response]) => {
      content += `Stage ${stageId}: ${stageNames[parseInt(stageId) as keyof typeof stageNames]}\n`;
      content += `Your Answer: ${response.userAnswer}\n`;
      content += `AI Feedback: ${response.assistantFeedback}\n\n`;
    });

    return content;
  };

  const generateMarkdownSummary = () => {
    let content = `# SSA Coaching Session Summary\n\n`;
    content += `**Problem:** ${summaryData.problemTitle}\n`;
    content += `**Completed:** ${summaryData.completedAt.toLocaleString()}\n`;
    content += `**Total Time:** ${formatTime(summaryData.totalTime)}\n\n`;

    Object.entries(summaryData.stageResponses).forEach(([stageId, response]) => {
      content += `## Stage ${stageId}: ${stageNames[parseInt(stageId) as keyof typeof stageNames]}\n\n`;
      content += `**Your Answer:**\n${response.userAnswer}\n\n`;
      content += `**AI Feedback:**\n${response.assistantFeedback}\n\n`;
    });

    return content;
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-zinc-200/90 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-950">Reasoning Session Complete</h2>
              <p className="text-xs text-zinc-500">{summaryData.problemTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Metadata banner */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-xl">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-0.5">Time Invested</span>
              <span className="text-sm font-bold font-mono text-zinc-900">{formatTime(summaryData.totalTime)}</span>
            </div>
            <div className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-xl">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-0.5">Stages Validated</span>
              <span className="text-sm font-bold font-mono text-emerald-700">5 of 5 Stages (100%)</span>
            </div>
          </div>

          {/* Stage breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Pipeline Stage Review
            </h3>

            {Object.entries(summaryData.stageResponses).map(([stageId, response]) => (
              <div key={stageId} className="p-3.5 bg-zinc-50/70 border border-zinc-200/80 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-900">
                    Stage {stageId}: {stageNames[parseInt(stageId) as keyof typeof stageNames]}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                    Validated
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-zinc-200/60">
                  <span className="text-[10px] font-semibold uppercase text-zinc-400 block mb-1">Your Formulation</span>
                  <p className="text-zinc-700 leading-relaxed">{response.userAnswer}</p>
                </div>

                <div className="bg-zinc-100/70 p-2.5 rounded-lg border border-zinc-200/60">
                  <span className="text-[10px] font-semibold uppercase text-zinc-500 block mb-1">Coach Verification</span>
                  <p className="text-zinc-600 leading-relaxed">{response.assistantFeedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsMarkdown}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Export Markdown
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsPDF}
              leftIcon={<FileText className="h-3.5 w-3.5" />}
            >
              Export Text
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetSession}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            >
              Solve Again
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;
