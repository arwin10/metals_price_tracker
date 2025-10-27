import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a default client for build time (will be overridden at runtime)
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time, return a mock client to prevent errors
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      throw new Error('Missing Supabase environment variables');
    }
    // Return a placeholder client for build time
    return createClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-anon-key'
    );
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

// Client for server-side operations with service role key
export const supabaseAdmin = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey || 'placeholder-service-key'
);
