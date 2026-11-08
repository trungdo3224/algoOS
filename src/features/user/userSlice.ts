import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";

export interface UserState {
  id: string | null;
  name: string | null;
  email: string | undefined;
  profilePicture: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  id: null,
  name: null,
  email: undefined,
  profilePicture: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your credentials to .env or use Demo Mode.');
    }
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
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please add your credentials to .env or use Demo Mode.');
    }
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
      try {
        if (supabase.auth.admin?.deleteUser) {
          await supabase.auth.admin.deleteUser(authData.user.id);
        }
      } catch {
        // Admin deleteUser may not be available on client side
      }
      throw profileError;
    }

    return authData.user;
  }
);

export const logout = createAsyncThunk('user/logout', async () => {
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
  }
});

export const checkSession = createAsyncThunk('user/checkSession', async () => {
  if (!isSupabaseConfigured) {
    return null;
  }
  try {
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) => {
      setTimeout(() => resolve({ data: { session: null } }), 2500);
    });
    const result = await Promise.race([sessionPromise, timeoutPromise]);
    return result.data.session?.user || null;
  } catch (error) {
    console.warn('Session check failed or timed out:', error);
    return null;
  }
});

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginAsDemo: (state) => {
      state.id = 'demo-user-101';
      state.name = 'Demo Learner';
      state.email = 'demo@algomind.dev';
      state.profilePicture = null;
      state.loading = false;
      state.error = null;
    },
  },
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
      .addCase(logout.fulfilled, () => {
        return {
          ...initialState,
          loading: false,
        };
      })
      // Check Session
      .addCase(checkSession.pending, (state) => {
        // Only set loading if not already determined
        if (state.id === null) {
          state.loading = false;
        }
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.id = action.payload.id;
          state.email = action.payload.email;
          state.name = action.payload.user_metadata?.full_name;
        }
        state.loading = false;
      })
      .addCase(checkSession.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { loginAsDemo } = userSlice.actions;
export default userSlice.reducer;
