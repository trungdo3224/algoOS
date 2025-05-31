// Define types for the Learning OS application

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface Solution {
  id: string;
  problemId: string;
  userId: string;
  ideaDescription: string;
  code?: string;
  gradeScore?: number;
  gradeComment?: string;
  createdAt: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  problemsSolved: string[];
}

export interface LearningInsight {
  userId: string;
  category: string;
  score: number;
  timestamp: Date;
}

export interface VideoFeedback {
  id: string;
  solutionId: string;
  videoUrl: string;
  createdAt: Date;
}

export interface RevisionSuggestion {
  userId: string;
  problemIds: string[];
  reason: string;
  createdAt: Date;
}