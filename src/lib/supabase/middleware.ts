import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from './config';

/**
 * Refreshes an expiring Supabase session and copies the rotated auth cookies
 * onto both the forwarded request and the outgoing response, so the render
 * that follows sees the new tokens.
 *
 * With no credentials configured this is a pass-through.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request: { headers: request.headers } });

  if (!supabaseUrl || !supabaseAnonKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request: { headers: request.headers } });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // Responses carrying Set-Cookie for auth must never be cached by a CDN.
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // Reading the user is what triggers the refresh and the setAll above. It has
  // to happen before the response is handed back.
  await supabase.auth.getUser();

  return response;
}

export { isSupabaseConfigured };
