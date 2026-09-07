/**
 * Supabase credentials, read once and shared by the browser, server, and
 * middleware clients.
 *
 * Supabase is optional. Without credentials the auth flows fall back to the
 * local mock in `auth.ts`, so the marketing site, signup, and login stay
 * clickable in development and in preview deploys with no backend attached.
 * Nothing here may throw at import time.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
