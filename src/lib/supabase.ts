import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
// These are injected at build time by esbuild
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.error('❌ Missing or invalid Supabase environment variables.');
    console.error('📝 Please update your .env file with your actual Supabase credentials.');
    console.error('💡 See SUPABASE_SETUP.md for instructions.');
}

// Create Supabase client
// Even with invalid credentials, we create the client to allow the app to render
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
