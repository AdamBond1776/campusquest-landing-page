import type { MembershipStatus, RetentionState } from './types';

export const RETENTION_WINDOW_DAYS = 30;
export const FIRST_WARNING_DAY = 7;
export const SECOND_WARNING_DAY = 25;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Tiers that entitle a student to Genius Mining. */
export const GENIUS_MINING_TIERS = ['premium'] as const;

export type Tier = 'free' | 'basic' | 'premium' | 'club';

/**
 * Stripe subscription statuses, plus `none` for a student with no subscription
 * record at all.
 */
export type SubscriptionStatus =
  | 'none'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'unpaid'
  | 'paused'
  | 'incomplete'
  | 'incomplete_expired'
  | 'canceled';

export type SubscriptionSnapshot = {
  tier: Tier;
  status: SubscriptionStatus;
};

/**
 * Payment trouble is not the same as losing the tier.
 *
 * `past_due` and `unpaid` are both recoverable — the card failed and Stripe is
 * still retrying. Neither starts the deletion clock. When Stripe gives up it
 * emits `canceled`, and that is the event we act on. Deleting a paying student's
 * profile because their card expired is the failure mode this list exists to
 * prevent.
 */
export const PAYMENT_GRACE_STATUSES: SubscriptionStatus[] = ['past_due', 'unpaid', 'incomplete'];

/** Statuses that mean the subscription is genuinely over. */
export const TERMINAL_STATUSES: SubscriptionStatus[] = [
  'none',
  'canceled',
  'incomplete_expired',
  'paused',
];

/**
 * Whether a subscription still entitles the student to Genius Mining.
 *
 * True for an active or trialing Genius Mining tier, and still true while a
 * payment is failing. False once the subscription actually ends, and false the
 * moment the tier drops to Basic or Free even if billing is otherwise healthy —
 * a downgrade is a loss of the tier, and it starts the clock.
 */
export function hasGeniusMining(subscription: SubscriptionSnapshot): boolean {
  const tierQualifies = (GENIUS_MINING_TIERS as readonly string[]).includes(subscription.tier);
  if (!tierQualifies) return false;
  return !TERMINAL_STATUSES.includes(subscription.status);
}

export function initialRetentionState(): RetentionState {
  return {
    membership_status: 'active',
    lapsed_at: null,
    purge_due_at: null,
    warning_7_sent_at: null,
    warning_25_sent_at: null,
    deidentified_copy_retained: false,
  };
}

export type RetentionTransition = 'clock_started' | 'clock_cleared' | 'unchanged';

export type RetentionDecision = {
  state: RetentionState;
  transition: RetentionTransition;
  reason: string;
};

/**
 * Folds a subscription change into the retention state.
 *
 * Losing the Genius Mining tier — by cancellation or by downgrade to Basic or
 * Free — stamps `lapsed_at` and schedules the purge 30 days out. Restoring the
 * tier before the purge runs clears the lapse and deletes nothing. A card that
 * is merely failing changes nothing at all.
 *
 * Once a record is purged it stays purged; restoring a subscription cannot
 * un-delete answers, and the consent copy promises the student exactly that.
 */
export function applySubscriptionChange(
  current: RetentionState,
  subscription: SubscriptionSnapshot,
  now: Date = new Date()
): RetentionDecision {
  if (current.membership_status === 'purged') {
    return {
      state: current,
      transition: 'unchanged',
      reason: 'Record is already purged. Deletion is permanent; the student retakes the form.',
    };
  }

  const entitled = hasGeniusMining(subscription);

  if (entitled) {
    if (current.lapsed_at === null && current.membership_status === 'active') {
      return {
        state: current,
        transition: 'unchanged',
        reason: PAYMENT_GRACE_STATUSES.includes(subscription.status)
          ? `Subscription is ${subscription.status}. A failing payment does not start the deletion clock.`
          : 'Still an active member.',
      };
    }

    return {
      state: {
        ...current,
        membership_status: 'active',
        lapsed_at: null,
        purge_due_at: null,
        warning_7_sent_at: null,
        warning_25_sent_at: null,
      },
      transition: 'clock_cleared',
      reason: 'Genius Mining tier restored before the purge ran. Nothing is deleted.',
    };
  }

  if (PAYMENT_GRACE_STATUSES.includes(subscription.status)) {
    return {
      state: current,
      transition: 'unchanged',
      reason: `Subscription is ${subscription.status}. A failing payment does not start the deletion clock.`,
    };
  }

  if (current.lapsed_at !== null) {
    return {
      state: current,
      transition: 'unchanged',
      reason: 'Clock is already running; the original lapse date stands.',
    };
  }

  const lapsedAt = now;
  const membershipStatus: MembershipStatus =
    subscription.status === 'canceled' || subscription.status === 'none' ? 'cancelled' : 'lapsed';

  return {
    state: {
      ...current,
      membership_status: membershipStatus,
      lapsed_at: lapsedAt.toISOString(),
      purge_due_at: new Date(lapsedAt.getTime() + RETENTION_WINDOW_DAYS * DAY_MS).toISOString(),
      warning_7_sent_at: null,
      warning_25_sent_at: null,
    },
    transition: 'clock_started',
    reason:
      subscription.status === 'canceled' || subscription.status === 'none'
        ? 'Subscription cancelled. Identified data is deleted in 30 days.'
        : `Downgraded to ${subscription.tier}, which does not include Genius Mining. Identified data is deleted in 30 days.`,
  };
}

export type RetentionAction =
  | { action: 'none' }
  | { action: 'warn'; day: 7 | 25; daysUntilPurge: number }
  | { action: 'purge'; purgeDueAt: string };

/**
 * What the retention job should do for one record right now.
 *
 * Returns a single action per call so the job stays idempotent: the caller
 * stamps the timestamp it just acted on, and the next pass moves on.
 */
export function retentionActionDue(state: RetentionState, now: Date = new Date()): RetentionAction {
  if (state.membership_status === 'purged') return { action: 'none' };
  if (!state.lapsed_at || !state.purge_due_at) return { action: 'none' };

  const lapsedAt = new Date(state.lapsed_at).getTime();
  const purgeDueAt = new Date(state.purge_due_at).getTime();
  const elapsedDays = (now.getTime() - lapsedAt) / DAY_MS;
  const daysUntilPurge = Math.max(0, Math.ceil((purgeDueAt - now.getTime()) / DAY_MS));

  if (now.getTime() >= purgeDueAt) {
    return { action: 'purge', purgeDueAt: state.purge_due_at };
  }

  if (elapsedDays >= SECOND_WARNING_DAY && !state.warning_25_sent_at) {
    return { action: 'warn', day: 25, daysUntilPurge };
  }

  if (elapsedDays >= FIRST_WARNING_DAY && !state.warning_7_sent_at) {
    return { action: 'warn', day: 7, daysUntilPurge };
  }

  return { action: 'none' };
}

export function markWarningSent(
  state: RetentionState,
  day: 7 | 25,
  now: Date = new Date()
): RetentionState {
  const stamp = now.toISOString();
  return day === 7
    ? { ...state, warning_7_sent_at: stamp }
    : { ...state, warning_25_sent_at: stamp };
}

/**
 * Marks a record purged. Only ever called after the de-identified copy is
 * confirmed in the development corpus — see `deidentify.ts`.
 */
export function markPurged(state: RetentionState): RetentionState {
  return {
    ...state,
    membership_status: 'purged',
    deidentified_copy_retained: true,
  };
}
