import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAppSelector } from './reduxHooks';

export function useProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProblems() {
      try {
        const { data, error } = await supabase
          .from('problems')
          .select('*');
        
        if (error) throw error;
        setProblems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProblems();
  }, []);

  return { problems, loading, error };
}

export function useUserSubmissions() {
  const { id: userId } = useAppSelector((state) => state.user);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchSubmissions() {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select(`
            *,
            problems (*)
          `)
          .eq('user_id', userId)
          .order('submitted_at', { ascending: false });
        
        if (error) throw error;
        setSubmissions(data);
      } catch (err) {
        setError(err.message);
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
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchInsights() {
      try {
        const { data, error } = await supabase
          .from('insights')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        setInsights(data);
      } catch (err) {
        setError(err.message);
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
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchRevisions() {
      try {
        const { data, error } = await supabase
          .from('revision_history')
          .select(`
            *,
            problems (*)
          `)
          .eq('user_id', userId)
          .order('last_attempt', { ascending: false });
        
        if (error) throw error;
        setRevisions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRevisions();
  }, [userId]);

  return { revisions, loading, error };
}

export function useVideoFeedback() {
  const { id: userId } = useAppSelector((state) => state.user);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    async function fetchFeedback() {
      try {
        const { data, error } = await supabase
          .from('video_feedback')
          .select(`
            *,
            problems (*),
            submissions (*)
          `)
          .eq('user_id', userId)
          .order('generated_at', { ascending: false });
        
        if (error) throw error;
        setFeedback(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFeedback();
  }, [userId]);

  return { feedback, loading, error };
}