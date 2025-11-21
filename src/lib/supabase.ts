import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://mpizntvbwkktnzmnjtep.supabase.co';

// IMPORTANT: Replace this with your actual Supabase anon key
// You can find this in your Supabase project settings under API
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Type definitions for authentication
export interface AuthUser {
    id: string;
    email?: string;
    user_metadata?: {
        username?: string;
        full_name?: string;
    };
}

export interface AuthError {
    message: string;
    status?: number;
}
