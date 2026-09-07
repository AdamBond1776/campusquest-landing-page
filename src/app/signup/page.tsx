import { signedInEmail } from '@/lib/session';
import Onboarding from './onboarding-view';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // `finish=1` is set by the auth callback for an account that has a session but
  // never answered the onboarding questions. Read here rather than in the client
  // so the first paint already knows which form it is.
  const params = await searchParams;
  const flag = Array.isArray(params.finish) ? params.finish[0] : params.finish;
  const finishing = flag === '1';

  // The age answer is stored against an address. In the finishing path there is
  // no email field on the form, so it has to come from the session.
  return <Onboarding finishing={finishing} sessionEmail={finishing ? await signedInEmail() : null} />;
}
