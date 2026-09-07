import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const DEFAULT_NEXT = '/welcome';
const ERROR_PATH = '/auth/auth-code-error';

/**
 * Only same-origin relative paths are honoured, so a tampered link cannot turn
 * the callback into an open redirect.
 */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return DEFAULT_NEXT;
  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeNext(searchParams.get('next'));
  const code = searchParams.get('code');

  const failure = (reason: string) =>
    NextResponse.redirect(new URL(`${ERROR_PATH}?reason=${reason}`, origin));

  // Supabase reports a rejected or expired link on the query string.
  if (searchParams.get('error')) return failure('link');
  if (!code) return failure('missing');

  const supabase = await createClient();
  if (!supabase) return failure('unconfigured');

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return failure('link');

  return NextResponse.redirect(new URL(next, origin));
}
