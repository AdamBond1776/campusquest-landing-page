import { signedInUser } from '@/lib/session';
import { gate } from '@/lib/gate';
import WelcomeView, { type GeniusMiningAccess } from './welcome-view';

/**
 * Whether to offer the instrument, and in what terms.
 *
 * Age is checked before plan. Telling a 17-year-old to upgrade to reach
 * something they are not allowed to reach at any price would be a worse thing
 * to do than saying nothing.
 */
async function geniusMiningAccess(plan: string | undefined): Promise<GeniusMiningAccess> {
  const access = await gate('genius_mining');
  if (!access.allowed) return { state: 'hidden' };
  return plan === 'premium' ? { state: 'ready' } : { state: 'upgrade' };
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
  const user = await signedInUser();

  return (
    <WelcomeView
      isNew={flag === '1'}
      initialUser={user}
      geniusMining={await geniusMiningAccess(user?.plan)}
    />
  );
}
