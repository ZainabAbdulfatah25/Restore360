import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gsksxrbvvntmwnmqfipu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdza3N4cmJ2dm50bXdubXFmaXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTg1ODUsImV4cCI6MjA4MDI3NDU4NX0.StwV05RAUH4ArUQVgs1RpoK8hXkY3ydTzlEk2qk9Fxg';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});
