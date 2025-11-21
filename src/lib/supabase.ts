import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
// These are injected at build time by esbuild
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables. Please check your .env file.');
}

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
