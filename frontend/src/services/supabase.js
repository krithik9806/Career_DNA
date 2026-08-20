import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(url && key && !url.includes('placeholder'));

export const supabase = isSupabaseConfigured
  ? createClient(url, key)
  : {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase unconfigured') }),
        signUp: async () => ({ data: null, error: new Error('Supabase unconfigured') }),
        signInWithOAuth: async () => ({ data: null, error: new Error('Supabase unconfigured') }),
        signOut: async () => ({ error: null })
      }
    };
