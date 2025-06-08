export interface SSASession {
  sessionId: string;
  currentStage: number;
  validatedStages: number[];
  stageMessages: {
    [stageId: number]: {
      userAnswer: string;
      assistantFeedback: string;
    };
  };
  isCompleted: boolean;
  completedAt?: Date;
}

export interface StageValidation {
  stageId: number;
  isValid: boolean;
  userInput: string;
  assistantResponse: string;
  timestamp: Date;
}