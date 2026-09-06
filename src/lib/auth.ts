import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type Role = 'student' | 'organization';
export type Plan = 'free' | 'basic' | 'premium' | 'club';

export type SignUpInput = {
  email: string;
  password: string;
  role: Role;
  interests: string[];
  plan: Plan;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type AuthResult = { ok: true } | { ok: false; message: string };

const STORAGE_KEY = 'campusquest.accounts';
const MOCK_LATENCY_MS = 700;

type StoredAccount = {
  email: string;
  password: string;
  role: Role;
  interests: string[];
  plan: Plan;
  createdAt: string;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function readAccounts(): StoredAccount[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as StoredAccount[]) : [];
  } catch {
    // Private browsing or corrupted state: treat as a fresh slate rather than
    // breaking the form.
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // Persistence is a nicety for the mock; failing to store must not surface
    // as a signup error.
  }
}

async function mockSignUp(input: SignUpInput): Promise<AuthResult> {
  await wait(MOCK_LATENCY_MS);
  const email = normalizeEmail(input.email);
  const accounts = readAccounts();

  if (accounts.some((account) => account.email === email)) {
    return {
      ok: false,
      message: 'An account with this email already exists. Try logging in instead.',
    };
  }

  accounts.push({
    email,
    password: input.password,
    role: input.role,
    interests: input.interests,
    plan: input.plan,
    createdAt: new Date().toISOString(),
  });
  writeAccounts(accounts);

  return { ok: true };
}

async function mockSignIn(input: SignInInput): Promise<AuthResult> {
  await wait(MOCK_LATENCY_MS);
  const email = normalizeEmail(input.email);
  const account = readAccounts().find((candidate) => candidate.email === email);

  if (!account || account.password !== input.password) {
    return {
      ok: false,
      message: "That email and password don't match an account.",
    };
  }

  return { ok: true };
}

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  if (!supabase) return mockSignUp(input);

  const { error } = await supabase.auth.signUp({
    email: normalizeEmail(input.email),
    password: input.password,
    options: {
      data: {
        role: input.role,
        interests: input.interests,
        plan: input.plan,
      },
    },
  });

  return error ? { ok: false, message: error.message } : { ok: true };
}

export async function signIn(input: SignInInput): Promise<AuthResult> {
  if (!supabase) return mockSignIn(input);

  const { error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(input.email),
    password: input.password,
  });

  return error ? { ok: false, message: error.message } : { ok: true };
}

export { isSupabaseConfigured };
