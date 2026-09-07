import { NextResponse } from 'next/server';
import { cronSecret, defaultCampusId } from '@/lib/env';
import { campusesWithFeeds, runIngest } from '@/lib/activities/ingest';

export const dynamic = 'force-dynamic';

/**
 * Refresh the activity directory from every configured source.
 *
 * Unlike the retention job this only writes public listings, so it is allowed
 * to run without a secret in local development where no secret is configured.
 * Once CRON_SECRET exists it is enforced, because an open endpoint that makes a
 * few hundred outbound requests is a free denial-of-service lever.
 */
async function handle(request: Request): Promise<Response> {
  const secret = cronSecret();

  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const requested = url.searchParams.get('campus');
  const campuses = requested
    ? [requested]
    : campusesWithFeeds().length > 0
      ? campusesWithFeeds()
      : [defaultCampusId()];

  try {
    const reports = [];
    for (const campus of campuses) {
      reports.push(...(await runIngest(campus)));
    }

    const failed = reports.filter((report) => report.error);

    return NextResponse.json(
      {
        ran_at: new Date().toISOString(),
        campuses,
        reports,
      },
      // A partial sync is still a successful run, but it should not read as a
      // clean one in an uptime check.
      { status: failed.length > 0 && failed.length === reports.length ? 502 : 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
