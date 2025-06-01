import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase";
import type { Problem } from "../../lib/supabase";

interface ProblemState {
  problems: Problem[];
  loading: boolean;
  error: string | null;
}

const initialState: ProblemState = {
  problems: [],
  loading: false,
  error: null,
};

export const fetchProblems = createAsyncThunk(
  'problems/fetchProblems',
  async () => {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
);

export const createProblem = createAsyncThunk(
  'problems/createProblem',
  async (problem: Partial<Problem>) => {
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
    const { data, error } = await supabase
      .from('problems')
      .update(updates)
      .eq('problem_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const deleteProblem = createAsyncThunk(
  'problems/deleteProblem',
  async (id: string) => {
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
      })
      .addCase(fetchProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch problems';
      })
      // Create Problem
      .addCase(createProblem.fulfilled, (state, action) => {
        state.problems.unshift(action.payload);
      })
      // Update Problem
      .addCase(updateProblem.fulfilled, (state, action) => {
        const index = state.problems.findIndex(p => p.problem_id === action.payload.problem_id);
        if (index !== -1) {
          state.problems[index] = action.payload;
        }
      })
      // Delete Problem
      .addCase(deleteProblem.fulfilled, (state, action) => {
        state.problems = state.problems.filter(p => p.problem_id !== action.payload);
      });
  },
});

export default problemSlice.reducer;