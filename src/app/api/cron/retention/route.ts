import { NextResponse } from 'next/server';
import { cronSecret } from '@/lib/env';
import { runRetentionJob } from '@/lib/gm/retention-job';

export const dynamic = 'force-dynamic';

/**
 * The retention job. Warns at day 7 and day 25, de-identifies and purges at 30.
 *
 * Runs on a schedule but is written so a silent failure is not possible: a purge
 * that cannot preserve the corpus copy alerts instead of proceeding, and the
 * response body reports every action taken.
 */
export async function POST(request: Request): Promise<Response> {
  const secret = cronSecret();

  // Vercel Cron sends the secret as a bearer token. Refusing to run without one
  // configured is deliberate: an unauthenticated endpoint that deletes student
  // data is worse than a job that has not been set up yet.
  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured; the retention job will not run.' },
      { status: 503 }
    );
  }

  const provided = request.headers.get('authorization');
  if (provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const outcomes = await runRetentionJob();
    return NextResponse.json({
      ran_at: new Date().toISOString(),
      considered: outcomes.length,
      outcomes,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
