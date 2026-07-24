import { createClient } from '@supabase/supabase-js';

const runtimeEnv = import.meta.env ?? {};
const supabaseUrl = runtimeEnv.VITE_SUPABASE_URL;
const supabaseAnonKey = runtimeEnv.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && runtimeEnv.DEV) {
    console.warn('Supabase is not configured. Copy .env.example to .env and add the public project values.');
}

export const supabase = createClient(
    supabaseUrl || 'http://127.0.0.1:54321',
    supabaseAnonKey || 'public-anon-key-not-configured',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
        global: {
            headers: {
                'x-client-info': 'vibestudy-web',
            },
        },
    }
);
