import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawAnonKey &&
  rawUrl !== 'your-supabase-project-url' &&
  rawAnonKey !== 'your-supabase-anon-key' &&
  !rawUrl.includes('placeholder')
);

// Fallback to valid placeholder URL and JWT-like string so createClient never throws on construction
const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder-project.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? rawAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

if (!isSupabaseConfigured) {
  console.warn(
    '[algoOS] Supabase credentials are missing or placeholders. Running in offline/demo mode.\n' +
    'To connect a real Supabase database, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Re-export all application types from central types module
export type * from '../types';
