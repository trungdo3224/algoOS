import { supabase } from '../lib/supabase';
import type { Problem, Submission, SsaSession, RevisionHistory, Insight } from '../lib/supabase';

// Problems
export async function getProblems() {
  const { data, error } = await supabase
    .from('problems')
    .select('*');
  
  if (error) throw error;
  return data;
}

export async function getProblemById(id: string) {
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .eq('problem_id', id)
    .single();
  
  if (error) throw error;
  return data;
}

// Submissions
export async function getUserSubmissions(userId: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      problems (*)
    `)
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createSubmission(submission: Partial<Submission>) {
  const { data, error } = await supabase
    .from('submissions')
    .insert(submission)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// SSA Sessions
export async function getCurrentSession(userId: string, problemId: string) {
  const { data, error } = await supabase
    .from('ssa_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('problem_id', problemId)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createSsaSession(session: Partial<SsaSession>) {
  const { data, error } = await supabase
    .from('ssa_sessions')
    .insert(session)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateSsaSession(sessionId: number, updates: Partial<SsaSession>) {
  const { data, error } = await supabase
    .from('ssa_sessions')
    .update(updates)
    .eq('session_id', sessionId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Revision History
export async function getRevisionHistory(userId: string) {
  const { data, error } = await supabase
    .from('revision_history')
    .select(`
      *,
      problems (*)
    `)
    .eq('user_id', userId)
    .order('last_attempt', { ascending: false });
  
  if (error) throw error;
  return data;
}

// Insights
export async function getUserInsights(userId: string) {
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  return data;
}