import { signedInUser } from '@/lib/session';
import WelcomeView from './welcome-view';

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
