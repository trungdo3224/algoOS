import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import type { Problem } from "../../types";
import { SAMPLE_PROBLEMS } from "../../data/sampleProblems";

interface ProblemState {
  problems: Problem[];
  loading: boolean;
  error: string | null;
  stats: {
    totalTimeTaken: number;
    totalAttempts: number;
    averageTimePerProblem: number;
    averageAttemptsPerProblem: number;
    statusDistribution: {
      [key: string]: number;
    };
  };
}

const calculateStats = (problems: Problem[]) => {
  const validProblems = problems.filter(p => p.time_taken || p.attempts);
  const totalTimeTaken = problems.reduce((sum, p) => sum + (p.time_taken || 0), 0);
  const totalAttempts = problems.reduce((sum, p) => sum + (p.attempts || 0), 0);
  
  const statusDistribution = problems.reduce((acc, p) => {
    if (p.status) {
      acc[p.status] = (acc[p.status] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    totalTimeTaken,
    totalAttempts,
    averageTimePerProblem: validProblems.length ? totalTimeTaken / validProblems.length : 0,
    averageAttemptsPerProblem: validProblems.length ? totalAttempts / validProblems.length : 0,
    statusDistribution,
  };
};

const initialState: ProblemState = {
  problems: SAMPLE_PROBLEMS,
  loading: false,
  error: null,
  stats: calculateStats(SAMPLE_PROBLEMS),
};

export const fetchProblems = createAsyncThunk(
  'problems/fetchProblems',
  async () => {
    if (!isSupabaseConfigured) {
      return SAMPLE_PROBLEMS;
    }
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Database query error, using local sample problems:', error);
        return SAMPLE_PROBLEMS;
      }
      return data && data.length > 0 ? data : SAMPLE_PROBLEMS;
    } catch (err) {
      console.warn('Network error fetching problems:', err);
      return SAMPLE_PROBLEMS;
    }
  }
);

export const createProblem = createAsyncThunk(
  'problems/createProblem',
  async (problem: Partial<Problem>) => {
    if (!isSupabaseConfigured) {
      const newProblem: Problem = {
        problem_id: 'p-' + Date.now(),
        title: problem.title || 'Untitled Problem',
        description: problem.description || '',
        difficulty: problem.difficulty || 'Medium',
        tags: problem.tags || [],
        site: problem.site || 'Custom',
        example_input: problem.example_input || '',
        example_output: problem.example_output || '',
        constraints: problem.constraints || '',
        hint: problem.hint || '',
        status: problem.status || 'Đã tự giải',
        created_at: new Date().toISOString(),
        time_taken: problem.time_taken || 0,
        attempts: problem.attempts || 1,
        note: problem.note || '',
      };
      return newProblem;
    }

    const { data, error } = await supabase
      .from('problems')
      .insert(problem)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const updateProblem = createAsyncThunk(
  'problems/updateProblem',
  async ({ id, updates }: { id: string; updates: Partial<Problem> }) => {
    if (!isSupabaseConfigured) {
      return { problem_id: id, ...updates } as Problem;
    }

    const { data, error } = await supabase
      .from('problems')
      .update(updates)
      .eq('problem_id', id)
      .select();

    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error('Problem not found for update: no rows affected.');
    }
    
    return data[0];
  }
);

export const deleteProblem = createAsyncThunk(
  'problems/deleteProblem',
  async (id: string) => {
    if (!isSupabaseConfigured) {
      return id;
    }

    const { error } = await supabase
      .from('problems')
      .delete()
      .eq('problem_id', id);

    if (error) throw error;
    return id;
  }
);

const problemSlice = createSlice({
  name: "problems",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Problems
      .addCase(fetchProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.loading = false;
        state.problems = action.payload;
        state.stats = calculateStats(action.payload);
      })
      .addCase(fetchProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch problems';
      })
      // Create Problem
      .addCase(createProblem.fulfilled, (state, action) => {
        state.problems.unshift(action.payload);
        state.stats = calculateStats(state.problems);
      })
      // Update Problem
      .addCase(updateProblem.fulfilled, (state, action) => {
        const index = state.problems.findIndex(p => p.problem_id === action.payload.problem_id);
        if (index !== -1) {
          state.problems[index] = { ...state.problems[index], ...action.payload };
          state.stats = calculateStats(state.problems);
        }
      })
      // Delete Problem
      .addCase(deleteProblem.fulfilled, (state, action) => {
        state.problems = state.problems.filter(p => p.problem_id !== action.payload);
        state.stats = calculateStats(state.problems);
      });
  },
});

export default problemSlice.reducer;
