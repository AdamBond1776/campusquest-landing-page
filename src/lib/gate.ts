import { ageStore } from '@/lib/age-store';
import { allows, type AccessDecision, type AgeRecord, type Capability } from '@/lib/age';
import { signedInEmail } from '@/lib/session';

export type GateResult = AccessDecision & {
  /** Null when nobody is signed in. */
  record: AgeRecord | null;
  signedIn: boolean;
};

/**
 * Whether the current visitor may use a capability.
 *
 * Signed out is treated as allowed, not blocked. The activity directory is
 * public information about public events, and putting an age wall in front of a
 * list of football fixtures would be theatre: anyone refused could read the same
 * page on the university's own site. The gate exists to keep the promises made
 * to a guardian about what their student's *account* can do, so it starts
 * mattering once there is an account to make promises about.
 *
 * Capabilities that write something or cost something — contributing, the
 * instrument, billing — require a session anyway, and their callers check that
 * separately.
 */
export async function gate(capability: Capability): Promise<GateResult> {
  const email = await signedInEmail();
  if (!email) return { allowed: true, reason: '', record: null, signedIn: false };

  const record = await ageStore().get(email);

  // An account created before the gate existed has no answer on file. Rather
  // than lock people out of something they were already using, they are let
  // through and asked the next time they hit something that needs an adult.
  if (!record) return { allowed: true, reason: '', record: null, signedIn: true };

  return { ...allows(record, capability), record, signedIn: true };
}
