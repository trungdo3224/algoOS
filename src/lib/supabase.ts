import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ProblemStatus = 
  | 'Giải với hint'
  | 'Đã tự giải'
  | 'Giải từ solution'
  | 'Cần ôn tập sớm'
  | 'Đã ôn tập';

export type ProblemSite = 
  | 'LeetCode'
  | 'Codeforces'
  | 'HackerRank'
  | 'AtCoder'
  | 'CodeChef'
  | 'TopCoder'
  | 'SPOJ'
  | 'GeeksforGeeks'
  | 'InterviewBit'
  | 'Custom';

// Generated Problem Types for Reverse Challenge
export interface GeneratedProblemOutput {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  inputFormat: string;
  outputFormat: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  hints?: string[];
  inferredAssumptions: string[];
  hiddenEdgeCases: string[];
  algorithmicPattern: string;
  timeComplexity: string;
  spaceComplexity: string;
  generatedAt: Date;
}

// Real-world Application Types
export interface TheoreticalFoundation {
  concepts: string[];
  algorithms: string[];
  dataStructures: string[];
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
}

export interface PracticalApplication {
  realWorldScenarios: {
    title: string;
    description: string;
    industry: string;
  }[];
  concreteExamples: string[];
  openEndedQuestion: string;
  modifications: string[];
}

export interface ReframedProblem {
  title: string;
  description: string;
  apiSpec?: {
    endpoint: string;
    method: string;
    requestFormat: string;
    responseFormat: string;
  };
  constraints: string[];
  edgeCases: string[];
  systemDesignConsiderations: string[];
}

export interface RealWorldApplication {
  theoreticalFoundation: TheoreticalFoundation;
  practicalApplication: PracticalApplication;
  reframedProblem: ReframedProblem;
  generatedAt: Date;
}

// Type definitions for our database tables
export type User = {
  user_id: string;
  name: string;
  email: string;
  created_at: string;
};

export type Problem = {
  problem_id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  site?: ProblemSite;
  example_input: string;
  example_output: string;
  constraints: string;
  hint?: string;
  status?: ProblemStatus;
  created_at: string;
  time_taken?: number;
  attempts?: number;
  note?: string;
};

export type Submission = {
  submission_id: number;
  user_id: string;
  problem_id: string;
  idea: string;
  grader_score: number;
  grader_feedback: string;
  grader_suggestion: string;
  submitted_at: string;
};

export type SsaSession = {
  session_id: number;
  user_id: string;
  problem_id: string;
  current_stage: number;
  session_data: Record<string, any>;
  started_at: string;
  updated_at: string;
};

export type RevisionHistory = {
  revision_id: number;
  user_id: string;
  problem_id: string;
  last_attempt: string;
  times_attempted: number;
  last_score: number;
  reason: string;
};

export type Insight = {
  insight_id: number;
  user_id: string;
  tag: string;
  avg_score: number;
  mistakes: number;
  updated_at: string;
};