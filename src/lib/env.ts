/**
 * Server-side configuration.
 *
 * Everything here is read lazily and nothing throws at import time, so the app
 * boots and is clickable with no environment set at all. Features degrade to a
 * local mock instead of crashing — see `isMockEngine` and `alertsConfigured`.
 */

function str(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function list(name: string): string[] {
  return (
    str(name)
      ?.split(',')
      .map((entry) => entry.trim())
      .filter(Boolean) ?? []
  );
}

/**
 * Where Genius Mining operational alerts go.
 *
 * Defaults to the gm-alerts group, which fans out to Adam and Nick. Kept
 * configurable rather than hardcoded so the address can change without a deploy,
 * and so staging can point somewhere harmless.
 */
export const DEFAULT_ALERT_RECIPIENTS = ['gm-alerts@campusquestapp.com'];

export function alertRecipients(): string[] {
  const configured = list('GM_ALERT_EMAIL');
  return configured.length > 0 ? configured : DEFAULT_ALERT_RECIPIENTS;
}

/** Verified Resend sender. `auth.campusquestapp.com` is already sending for auth. */
export function mailFrom(): string {
  return str('GM_MAIL_FROM') ?? 'CampusQuest <noreply@auth.campusquestapp.com>';
}

export function resendApiKey(): string | undefined {
  return str('RESEND_API_KEY');
}

export function alertsConfigured(): boolean {
  return Boolean(resendApiKey());
}

export function anthropicApiKey(): string | undefined {
  return str('ANTHROPIC_API_KEY');
}

/**
 * The analysis engine runs against a canned response unless an Anthropic key is
 * present, or unless GM_ENGINE explicitly asks for one. Two credits per student
 * is a standing constraint, so nothing spends a real call by accident.
 */
export function engineMode(): 'mock' | 'anthropic' {
  const explicit = str('GM_ENGINE');
  if (explicit === 'anthropic' || explicit === 'mock') return explicit;
  return anthropicApiKey() ? 'anthropic' : 'mock';
}

export function isMockEngine(): boolean {
  return engineMode() === 'mock';
}

export function supabaseUrl(): string | undefined {
  return str('NEXT_PUBLIC_SUPABASE_URL');
}

export function supabaseAnonKey(): string | undefined {
  return str('NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Service role key, used only by the retention job and the billing webhook,
 * which act on rows with no user session attached.
 */
export function supabaseServiceRoleKey(): string | undefined {
  return str('SUPABASE_SERVICE_ROLE_KEY');
}

export function supabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

export function stripeWebhookSecret(): string | undefined {
  return str('STRIPE_WEBHOOK_SECRET');
}

/** Shared secret the retention cron must present. */
export function cronSecret(): string | undefined {
  return str('CRON_SECRET');
}

/** Operators allowed to grant an analysis re-run override. */
export function adminEmails(): string[] {
  return list('GM_ADMIN_EMAILS');
}

/** Phase 1 is URI only. */
export function defaultCampusId(): string {
  return str('GM_CAMPUS_ID') ?? 'uri';
}

/**
 * Where an administrator reading the institutional page should write.
 *
 * Configurable because the address does not exist yet. Set
 * `CQ_PARTNERSHIP_EMAIL` once the mailbox is live; until then the page shows
 * the placeholder, which is at least on a domain we control.
 */
export function partnershipEmail(): string {
  return str('CQ_PARTNERSHIP_EMAIL') ?? 'partners@campusquestapp.com';
}
