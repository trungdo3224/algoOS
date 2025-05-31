import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    async function fetchSubmissions() {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select(`
            *,
            problems (*)
          `)
          .eq('user_id', user.id)
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
  }, [user]);

  return { submissions, loading, error };
}

export function useUserInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    async function fetchInsights() {
      try {
        const { data, error } = await supabase
          .from('insights')
          .select('*')
          .eq('user_id', user.id)
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
  }, [user]);

  return { insights, loading, error };
}

export function useRevisionHistory() {
  const { user } = useAuth();
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    async function fetchRevisions() {
      try {
        const { data, error } = await supabase
          .from('revision_history')
          .select(`
            *,
            problems (*)
          `)
          .eq('user_id', user.id)
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
  }, [user]);

  return { revisions, loading, error };
}

export function useVideoFeedback() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    async function fetchFeedback() {
      try {
        const { data, error } = await supabase
          .from('video_feedback')
          .select(`
            *,
            problems (*),
            submissions (*)
          `)
          .eq('user_id', user.id)
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
  }, [user]);

  return { feedback, loading, error };
}