import React, { useState } from 'react';
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-zinc-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={!canGoPrevious || isLoading}
          leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
        >
          Previous Stage
        </Button>
        
        <Button
          variant={canGoNext ? "primary" : "outline"}
          size="sm"
          onClick={handleNext}
          disabled={!canGoNext || isLoading}
          rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
        >
          Next Stage
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        {!showResetConfirm ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowResetConfirm(true)}
            disabled={isLoading}
            leftIcon={<RotateCcw className="h-3.5 w-3.5 text-zinc-400 group-hover:text-rose-600" />}
            className="text-zinc-500 hover:text-rose-600 hover:bg-rose-50"
          >
            Reset Session
          </Button>
        ) : (
          <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1">
            <span className="text-xs font-medium text-rose-800">Confirm reset?</span>
            <Button
              variant="danger"
              size="sm"
              onClick={handleResetConfirm}
              disabled={isLoading}
              className="h-7 px-2 text-xs"
            >
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(false)}
              disabled={isLoading}
              className="h-7 px-2 text-xs"
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
