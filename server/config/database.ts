import { createClient } from '@supabase/supabase-js';
import { Database } from '../../lib/database.types';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key for backend operations
export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const initDatabase = async () => {
  try {
    // Test connection by fetching from any table
    const { error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error.message);
      console.log('Please ensure your Supabase tables are created using the SQL in database/supabase-schema.sql');
    } else {
      console.log('Supabase connected successfully');
    }
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    throw error;
  }
};

export default supabase;
