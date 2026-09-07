'use client';

import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export type Role = 'student' | 'organization';
export type Plan = 'free' | 'basic' | 'premium' | 'club';

export type SignInInput = {
  email: string;
  /** Path to land on once the emailed link has been exchanged for a session. */
  redirectTo?: string;
};

export type SignUpInput = {
  email: string;
  role: Role;
  interests: string[];
  plan: Plan;
};

export type AuthResult =
  | {
      ok: true;
      /** True when no Supabase project is configured and the link was faked. */
      mock: boolean;
      /** The address was already on file, so the link signs them back in. */
      alreadyRegistered: boolean;
    }
  | { ok: false; message: string };

export type OnboardingInput = {
  role: Role;
  interests: string[];
  plan: Plan;
};

export type OnboardingResult = { ok: true } | { ok: false; message: string };

export type CurrentUser = {
  email: string;
  role?: Role;
  plan?: Plan;
};

const ACCOUNTS_KEY = 'campusquest.accounts';
const SESSION_KEY = 'campusquest.session';
const MOCK_LATENCY_MS = 700;

const SIGN_IN_REDIRECT = '/welcome';
const SIGN_UP_REDIRECT = '/welcome?new=1';

const ROLES: Role[] = ['student', 'organization'];
const PLANS: Plan[] = ['free', 'basic', 'premium', 'club'];

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const asRole = (value: unknown): Role | undefined =>
  ROLES.includes(value as Role) ? (value as Role) : undefined;

const asPlan = (value: unknown): Plan | undefined =>
  PLANS.includes(value as Plan) ? (value as Plan) : undefined;

/**
 * Absolute URL of the route handler that trades the emailed code for a
 * session. Supabase requires an absolute URL here, and it has to be built from
 * the live origin so preview deploys send their links back to themselves.
 */
function callbackUrl(redirectTo: string): string {
  const callback = new URL('/auth/callback', window.location.origin);
  callback.searchParams.set('next', redirectTo);
  return callback.toString();
}

/* ---------- localStorage mock (used when Supabase is unconfigured) ---------- */

type StoredAccount = {
  email: string;
  role?: Role;
  interests?: string[];
  plan?: Plan;
  createdAt: string;
};

type StoredSession = {
  email: string;
  role?: Role;
  plan?: Plan;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    // Private browsing or corrupted state: treat as a fresh slate rather than
    // breaking the form.
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is a nicety for the mock; failing to store must not surface
    // as an auth error.
  }
}

function readAccounts(): StoredAccount[] {
  const parsed = readJson<unknown>(ACCOUNTS_KEY, []);
  return Array.isArray(parsed) ? (parsed as StoredAccount[]) : [];
}

/**
 * Stands in for the whole email round-trip: remembers the address, records a
 * session so `getCurrentUser()` has something to return, and reports whether
 * the address was already known so the UI can say so.
 */
async function mockSendLink(
  email: string,
  details: { role?: Role; interests?: string[]; plan?: Plan } = {}
): Promise<AuthResult> {
  await wait(MOCK_LATENCY_MS);

  const normalized = normalizeEmail(email);
  const accounts = readAccounts();
  const existing = accounts.find((account) => account.email === normalized);

  if (existing) {
    // Only fill gaps — a login must not silently rewrite the signup answers.
    existing.role = details.role ?? existing.role;
    existing.interests = details.interests ?? existing.interests;
    existing.plan = details.plan ?? existing.plan;
  } else {
    accounts.push({
      email: normalized,
      role: details.role,
      interests: details.interests,
      plan: details.plan,
      createdAt: new Date().toISOString(),
    });
  }
  writeJson(ACCOUNTS_KEY, accounts);

  const account = existing ?? accounts[accounts.length - 1];
  const session: StoredSession = {
    email: normalized,
    role: account.role,
    plan: account.plan,
  };
  writeJson(SESSION_KEY, session);

  return { ok: true, mock: true, alreadyRegistered: Boolean(existing) };
}

async function mockCompleteOnboarding(details: OnboardingInput): Promise<OnboardingResult> {
  await wait(MOCK_LATENCY_MS);

  const session = readJson<StoredSession | null>(SESSION_KEY, null);
  if (!session?.email) {
    return { ok: false, message: 'Your session has expired. Request a new link to sign in.' };
  }

  const accounts = readAccounts();
  const existing = accounts.find((account) => account.email === session.email);

  if (existing) {
    existing.role = details.role;
    existing.interests = details.interests;
    existing.plan = details.plan;
  } else {
    accounts.push({ email: session.email, ...details, createdAt: new Date().toISOString() });
  }
  writeJson(ACCOUNTS_KEY, accounts);

  writeJson(SESSION_KEY, { email: session.email, role: details.role, plan: details.plan });
  return { ok: true };
}

function readMockSession(): CurrentUser | null {
  const session = readJson<StoredSession | null>(SESSION_KEY, null);
  if (!session?.email) return null;

  return {
    email: session.email,
    role: asRole(session.role),
    plan: asPlan(session.plan),
  };
}

/* ---------- Public API ---------- */

/**
 * Emails a one-time login link. There is no password to check, so a link is
 * sent whether or not the address is already on file.
 */
export async function signInWithEmail({
  email,
  redirectTo = SIGN_IN_REDIRECT,
}: SignInInput): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) return mockSendLink(email);

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizeEmail(email),
    options: { emailRedirectTo: callbackUrl(redirectTo) },
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true, mock: false, alreadyRegistered: false };
}

/**
 * Emails the same one-time link, carrying the onboarding answers along so they
 * land in the user's metadata when the account is created.
 */
export async function signUpWithEmail({
  email,
  role,
  interests,
  plan,
}: SignUpInput): Promise<AuthResult> {
  const supabase = createClient();
  if (!supabase) return mockSendLink(email, { role, interests, plan });

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizeEmail(email),
    options: {
      emailRedirectTo: callbackUrl(SIGN_UP_REDIRECT),
      shouldCreateUser: true,
      data: { role, interests, plan },
    },
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true, mock: false, alreadyRegistered: false };
}

/**
 * Writes the onboarding answers onto an account that already has a session.
 *
 * A magic link creates the account the first time it is used, so someone who
 * typed an unknown address into the login form arrives signed in but with no
 * role, plan or interests. This is how they finish, without a second link.
 */
export async function completeOnboarding(details: OnboardingInput): Promise<OnboardingResult> {
  const supabase = createClient();
  if (!supabase) return mockCompleteOnboarding(details);

  const { error } = await supabase.auth.updateUser({ data: { ...details } });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createClient();
  if (!supabase) return readMockSession();

  const { data, error } = await supabase.auth.getUser();
  const user = data.user;
  if (error || !user?.email) return null;

  const metadata: Record<string, unknown> = user.user_metadata ?? {};
  return {
    email: user.email,
    role: asRole(metadata.role),
    plan: asPlan(metadata.plan),
  };
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  if (!supabase) {
    writeJson(SESSION_KEY, null);
    return;
  }

  await supabase.auth.signOut();
}

export { isSupabaseConfigured };
