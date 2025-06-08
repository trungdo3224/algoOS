import React from 'react';
import { Download, FileText, RotateCcw, Trophy, Clock, Target } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

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
    // Create a formatted text version for now
    // In production, you'd use a PDF library like jsPDF
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🎉 Congratulations!
            </h2>
            <p className="text-gray-600">
              You've successfully completed the SSA Coaching Session for
            </p>
            <h3 className="text-xl font-semibold text-blue-600 mt-1">
              {summaryData.problemTitle}
            </h3>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Total Time</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(summaryData.totalTime)}
              </div>
            </Card>

            <Card className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Stages Completed</span>
              </div>
              <div className="text-2xl font-bold text-green-600">5/5</div>
            </Card>

            <Card className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-5 w-5 text-amber-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Achievement</span>
              </div>
              <div className="text-lg font-bold text-amber-600">Problem Solver</div>
            </Card>
          </div>

          {/* Summary Report */}
          <Card title="📄 Summary Report">
            <div className="space-y-6">
              {Object.entries(summaryData.stageResponses).map(([stageId, response]) => (
                <div key={stageId} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Stage {stageId}: {stageNames[parseInt(stageId) as keyof typeof stageNames]}
                  </h4>
                  
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Your Response:</h5>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">{response.userAnswer}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">AI Feedback:</h5>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">{response.assistantFeedback}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={exportAsPDF}
              leftIcon={<Download className="h-4 w-4" />}
              className="flex-1"
            >
              Export as Text
            </Button>
            
            <Button
              onClick={exportAsMarkdown}
              variant="outline"
              leftIcon={<FileText className="h-4 w-4" />}
              className="flex-1"
            >
              Export as Markdown
            </Button>
            
            <Button
              onClick={onResetSession}
              variant="secondary"
              leftIcon={<RotateCcw className="h-4 w-4" />}
              className="flex-1"
            >
              Try Another Problem
            </Button>
          </div>

          {/* Close Button */}
          <div className="text-center mt-4">
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700"
            >
              Close Summary
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;