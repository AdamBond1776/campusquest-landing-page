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

  return <Onboarding finishing={flag === '1'} />;
}
