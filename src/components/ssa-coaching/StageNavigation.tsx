import React from 'react';
import { CheckCircle, Lock } from 'lucide-react';

interface StageNavigationProps {
  currentStage: number;
  validatedStages: number[];
  onStageChange: (stage: number) => void;
}

const stages = [
  { id: 1, name: '1. Understanding', shortName: '1. Understand' },
  { id: 2, name: '2. Simulation', shortName: '2. Simulate' },
  { id: 3, name: '3. Pattern Recognition', shortName: '3. Pattern' },
  { id: 4, name: '4. Validation', shortName: '4. Validate' },
  { id: 5, name: '5. Solution Planning', shortName: '5. Solution' },
];

const StageNavigation: React.FC<StageNavigationProps> = ({
  currentStage,
  validatedStages,
  onStageChange,
}) => {
  const handleStageClick = (stageId: number) => {
    if (validatedStages.includes(stageId) || stageId === currentStage) {
      onStageChange(stageId);
    }
  };

  const getStageStatus = (stageId: number) => {
    if (validatedStages.includes(stageId)) return 'validated';
    if (stageId === currentStage) return 'current';
    if (stageId < currentStage) return 'accessible';
    return 'locked';
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200/90 p-4 mb-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Socratic Reasoning Pipeline
        </h3>
        <span className="text-xs font-mono font-medium text-zinc-500">
          Stage {currentStage} of 5
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {stages.map((stage) => {
          const status = getStageStatus(stage.id);
          const isClickable = status === 'validated' || status === 'current';
          const isValidated = status === 'validated';
          const isCurrent = status === 'current';

          return (
            <button
              key={stage.id}
              onClick={() => isClickable && handleStageClick(stage.id)}
              disabled={!isClickable}
              className={`
                flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all duration-150
                ${isCurrent 
                  ? 'bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-900 font-semibold' 
                  : isValidated 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100/70' 
                  : 'bg-zinc-50 text-zinc-400 border border-zinc-200/60 cursor-not-allowed opacity-70'
                }
              `}
              title={
                status === 'locked' 
                  ? 'Complete previous stage first' 
                  : `${stage.name} - ${isValidated ? 'Completed' : 'In Progress'}`
              }
            >
              <div className="flex items-center space-x-2 truncate">
                {isValidated ? (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                ) : isCurrent ? (
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse flex-shrink-0" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                )}
                <span className="truncate hidden lg:inline">{stage.name}</span>
                <span className="truncate lg:hidden">{stage.shortName}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StageNavigation;
