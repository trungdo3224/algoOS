import React, { useState } from 'react';
import { RotateCcw, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

interface SessionControlsProps {
  currentStage: number;
  validatedStages: number[];
  onStageChange: (stage: number) => void;
  onResetSession: () => void;
  isLoading?: boolean;
}

const SessionControls: React.FC<SessionControlsProps> = ({
  currentStage,
  validatedStages,
  onStageChange,
  onResetSession,
  isLoading = false,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const canGoPrevious = currentStage > 1;
  const canGoNext = currentStage < 5 && validatedStages.includes(currentStage);

  const handlePrevious = () => {
    if (canGoPrevious) {
      onStageChange(currentStage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onStageChange(currentStage + 1);
    }
  };

  const handleResetConfirm = () => {
    onResetSession();
    setShowResetConfirm(false);
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!canGoPrevious || isLoading}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Previous
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!canGoNext || isLoading}
          rightIcon={<ChevronRight className="h-4 w-4" />}
        >
          Next
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        {!showResetConfirm ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowResetConfirm(true)}
            disabled={isLoading}
            leftIcon={<RotateCcw className="h-4 w-4" />}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Reset Session
          </Button>
        ) : (
          <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">Are you sure?</span>
            <Button
              variant="danger"
              size="sm"
              onClick={handleResetConfirm}
              disabled={isLoading}
            >
              Yes, Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionControls;