import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mqkhbdqihdwcylhhbmvn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xa2hiZHFpaGR3Y3lsaGhibXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODc4NzEsImV4cCI6MjA4MDI2Mzg3MX0.f1QtNGs7QP3B-0ebS28LPljv8J0_FtUhGf8-qjeBXBU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});
