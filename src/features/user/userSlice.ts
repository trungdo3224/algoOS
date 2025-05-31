import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase";

export interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  profilePicture: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  profilePicture: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  }
);

export const signup = createAsyncThunk(
  'user/signup',
  async ({ email, password, name }: { email: string; password: string; name: string }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('No user data returned');

    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        user_id: authData.user.id,
        name,
        email
      }]);

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return authData.user;
  }
);

export const logout = createAsyncThunk('user/logout', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
});

export const checkSession = createAsyncThunk('user/checkSession', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
});

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.id = action.payload.id;
        state.email = action.payload.email;
        state.name = action.payload.user_metadata?.full_name;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.id = action.payload.id;
        state.email = action.payload.email;
        state.name = action.payload.user_metadata?.full_name;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Signup failed';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        return initialState;
      })
      // Check Session
      .addCase(checkSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.id = action.payload.id;
          state.email = action.payload.email;
          state.name = action.payload.user_metadata?.full_name;
        }
        state.loading = false;
      });
  },
});

export default userSlice.reducer;