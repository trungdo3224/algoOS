import React from 'react';
import { X } from 'lucide-react';
import VoiceReasoningSession from './VoiceReasoningSession';
import type { Problem } from '../../lib/supabase';

interface VoiceReasoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem;
  onComplete: (analysis: any, chunks: any[]) => void;
  onStartSSA: (analysis: any) => void;
}

const VoiceReasoningModal: React.FC<VoiceReasoningModalProps> = ({
  isOpen,
  onClose,
  problem,
  onComplete,
  onStartSSA
}) => {
  if (!isOpen) return null;

  const handleComplete = (analysis: any, chunks: any[]) => {
    onComplete(analysis, chunks);
    onClose();
  };

  const handleStartSSA = (analysis: any) => {
    onStartSSA(analysis);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Voice Reasoning Session
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <VoiceReasoningSession
            problemTitle={problem.title}
            onComplete={handleComplete}
            onStartSSA={handleStartSSA}
          />
        </div>
      </div>
    </div>
  );
};

export default VoiceReasoningModal;