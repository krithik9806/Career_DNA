import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

if (!process.env.SUPABASE_URL) {
  console.warn('[SUPABASE NOTICE] SUPABASE_URL not set in backend/.env. Using fallback placeholder configuration.');
}

// Client for standard anon operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend operations requiring service role privileges
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
