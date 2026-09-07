import {
  applySubscriptionChange,
  type SubscriptionSnapshot,
  type SubscriptionStatus,
  type Tier,
} from '@hiddengeniuslabs/genius-mining';
import { sendOperatorAlert } from '@/lib/alerts';
import { getStore } from '@/lib/gm/store';

const TIERS: Tier[] = ['free', 'basic', 'premium', 'club'];

const STATUSES: SubscriptionStatus[] = [
  'none',
  'trialing',
  'active',
  'past_due',
  'unpaid',
  'paused',
  'incomplete',
  'incomplete_expired',
  'canceled',
];

export function parseSnapshot(input: unknown): SubscriptionSnapshot | null {
  if (typeof input !== 'object' || input === null) return null;

  const candidate = input as { tier?: unknown; status?: unknown };
  const tier = TIERS.find((value) => value === candidate.tier);
  const status = STATUSES.find((value) => value === candidate.status);

  if (!tier || !status) return null;
  return { tier, status };
}

export type ApplyOutcome = {
  participantCode: string;
  transition: 'clock_started' | 'clock_cleared' | 'unchanged';
  reason: string;
};

/**
 * Folds a subscription change into a student's record.
 *
 * The decision itself lives in the Genius Mining module: a cancellation or a
 * downgrade out of the Genius Mining tier starts the 30-day clock, restoring the
 * tier clears it, and a failing card changes nothing.
 */
export async function applyToStudent(
  userId: string,
  snapshot: SubscriptionSnapshot
): Promise<ApplyOutcome | null> {
  const store = getStore();
  const record = await store.findByUserId(userId);
  if (!record) return null;

  const decision = applySubscriptionChange(record.retention, snapshot);

  await store.save({
    ...record,
    subscription: snapshot,
    retention: decision.state,
  });

  if (decision.transition === 'clock_started') {
    await sendOperatorAlert({
      severity: 'info',
      subject: 'Retention clock started',
      participantCode: record.participant_code,
      body: [
        decision.reason,
        '',
        `Purge due: ${decision.state.purge_due_at}`,
        'Restoring the Genius Mining tier before then cancels the purge and deletes nothing.',
      ].join('\n'),
    });
  }

  return {
    participantCode: record.participant_code,
    transition: decision.transition,
    reason: decision.reason,
  };
}
