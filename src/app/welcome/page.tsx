import { createClient } from '@/lib/supabase/server';
import type { CurrentUser, Plan, Role } from '@/lib/auth';
import WelcomeView from './welcome-view';

const ROLES: Role[] = ['student', 'organization'];
const PLANS: Plan[] = ['free', 'basic', 'premium', 'club'];

/**
 * Resolves the signed-in user before the first paint.
 *
 * The client can do this too, and has to when the localStorage mock is standing
 * in for Supabase, but waiting for it means an organization sees a frame of the
 * student copy. Returns null with no Supabase project configured, and the view
 * falls back to fetching it itself.
 */
async function signedInUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user?.email) return null;

  const metadata: Record<string, unknown> = user.user_metadata ?? {};
  return {
    email: user.email,
    role: ROLES.includes(metadata.role as Role) ? (metadata.role as Role) : undefined,
    plan: PLANS.includes(metadata.plan as Plan) ? (metadata.plan as Plan) : undefined,
  };
}

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // The old SPA passed `{ email, isNew }` through router location state. Only
  // the "you just signed up" flag survives as a search param; the email comes
  // from the session so it cannot be spoofed through the URL.
  const params = await searchParams;
  const flag = Array.isArray(params.new) ? params.new[0] : params.new;

  return <WelcomeView isNew={flag === '1'} initialUser={await signedInUser()} />;
}
