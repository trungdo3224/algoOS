import React from 'react';
import { CheckCircle, Lock, Circle } from 'lucide-react';

interface StageNavigationProps {
  currentStage: number;
  validatedStages: number[];
  onStageChange: (stage: number) => void;
}

const stages = [
  { id: 1, name: 'Understanding', shortName: 'Understand' },
  { id: 2, name: 'Simulation', shortName: 'Simulate' },
  { id: 3, name: 'Pattern Recognition', shortName: 'Pattern' },
  { id: 4, name: 'Validation', shortName: 'Validate' },
  { id: 5, name: 'Solution Planning', shortName: 'Solution' },
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

  const getStageIcon = (stageId: number) => {
    const status = getStageStatus(stageId);
    
    switch (status) {
      case 'validated':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'current':
        return <Circle className="h-5 w-5 text-blue-600 fill-current" />;
      case 'locked':
        return <Lock className="h-4 w-4 text-gray-400" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStageClasses = (stageId: number) => {
    const status = getStageStatus(stageId);
    const isClickable = status === 'validated' || status === 'current';
    
    let baseClasses = `
      flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
      ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
    `;

    switch (status) {
      case 'validated':
        return `${baseClasses} bg-green-50 text-green-800 hover:bg-green-100 border border-green-200`;
      case 'current':
        return `${baseClasses} bg-blue-100 text-blue-800 border-2 border-blue-300`;
      case 'locked':
        return `${baseClasses} bg-gray-50 text-gray-400 border border-gray-200`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200`;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Progress Stages</h3>
      
      <div className="flex flex-wrap gap-2">
        {stages.map((stage) => {
          const status = getStageStatus(stage.id);
          const isClickable = status === 'validated' || status === 'current';
          
          return (
            <div
              key={stage.id}
              className={getStageClasses(stage.id)}
              onClick={() => isClickable && handleStageClick(stage.id)}
              title={
                status === 'locked' 
                  ? 'Complete the current stage first' 
                  : `${stage.name} - ${status === 'validated' ? 'Completed' : 'In Progress'}`
              }
            >
              <span className="mr-2">{getStageIcon(stage.id)}</span>
              <span className="hidden sm:inline">{stage.name}</span>
              <span className="sm:hidden">{stage.shortName}</span>
              {status === 'validated' && (
                <span className="ml-2 text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full">
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{validatedStages.length}/5 stages completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(validatedStages.length / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StageNavigation;