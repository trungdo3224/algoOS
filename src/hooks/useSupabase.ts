import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAppSelector } from './reduxHooks';
import type { Submission, Insight, RevisionHistory } from '../types';

export function useUserSubmissions() {
  const { id: userId } = useAppSelector((state) => state.user);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchSubmissions() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('submissions')
          .select(`
            *,
            problems (*)
          `)
          .eq('user_id', userId)
          .order('submitted_at', { ascending: false });
        
        if (fetchError) throw fetchError;
        setSubmissions(data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch submissions';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, [userId]);

  return { submissions, loading, error };
}

export function useUserInsights() {
  const { id: userId } = useAppSelector((state) => state.user);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchInsights() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('insights')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
        
        if (fetchError) throw fetchError;
        setInsights(data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch insights';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [userId]);

  return { insights, loading, error };
}

export function useRevisionHistory() {
  const { id: userId } = useAppSelector((state) => state.user);
  const [revisions, setRevisions] = useState<RevisionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchRevisions() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('revision_history')
          .select(`
            *,
            problems (*)
          `)
          .eq('user_id', userId)
          .order('last_attempt', { ascending: false });
        
        if (fetchError) throw fetchError;
        setRevisions(data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch revision history';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchRevisions();
  }, [userId]);

  return { revisions, loading, error };
}
