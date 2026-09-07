'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  GraduationCap,
  Building2,
  Music,
  Trophy,
  Heart,
  Gamepad2,
  BookOpen,
  Palette,
  Camera,
  Mic,
  Users,
  Leaf,
  Code,
  Plane,
  Star,
  Mail,
} from 'lucide-react';
import CheckInbox from '@/components/CheckInbox';
import TextField from '@/components/TextField';
import FormAlert from '@/components/FormAlert';
import AgeFields, {
  EMPTY_AGE,
  ageAnswerComplete,
  bracketOf,
  type AgeAnswer,
} from '@/components/signup/AgeFields';
import { recordAge } from '@/app/signup/age-actions';
import { completeOnboarding, signUpWithEmail, type Plan, type Role } from '@/lib/auth';
import { PLANS, PRICE_LOCK_COPY, STUDENT_PLANS, formatPrice } from '@/lib/pricing';
import { validateEmail } from '@/lib/validation';

const interestOptions = [
  { icon: Music, label: 'Music' },
  { icon: Trophy, label: 'Sports' },
  { icon: Heart, label: 'Volunteering' },
  { icon: Gamepad2, label: 'Gaming' },
  { icon: BookOpen, label: 'Academic' },
  { icon: Palette, label: 'Art' },
  { icon: Camera, label: 'Photography' },
  { icon: Mic, label: 'Theater' },
  { icon: Users, label: 'Social' },
  { icon: Leaf, label: 'Outdoors' },
  { icon: Code, label: 'Tech' },
  { icon: Plane, label: 'Travel' },
];

const planOptions = STUDENT_PLANS.map((plan) => ({
  id: plan.id as Plan,
  name: plan.name,
  price: formatPrice(plan.price),
  period: plan.price > 0 ? '/mo' : '',
  tagline: plan.shortTagline,
  badge: plan.id === 'premium' ? 'Genius Mining' : undefined,
}));

const TOTAL_STEPS = 4;

type SentLink = {
  email: string;
  mock: boolean;
  alreadyRegistered: boolean;
};

/**
 * The four-step onboarding wizard.
 *
 * `finishing` means the visitor already has a session and only the answers are
 * missing, so the email step is dropped and the answers are written straight to
 * the account instead of being carried on a second magic link.
 */
export default function Onboarding({
  finishing = false,
  sessionEmail = null,
}: {
  finishing?: boolean;
  sessionEmail?: string | null;
}) {
  const router = useRouter();
  // Nothing to introduce when the account already exists — start on the first
  // real question instead of the welcome step.
  const [step, setStep] = useState(finishing ? 1 : 0);
  const [role, setRole] = useState<Role | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<AgeAnswer>(EMPTY_AGE);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<SentLink | null>(null);

  // Clear a field's complaint as soon as it is being corrected, so stale errors
  // never sit under freshly typed input.
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || !role || !plan) return;

    const address = finishing ? sessionEmail : email;

    if (!finishing) {
      const emailError = validateEmail(email);
      if (emailError) {
        setFieldErrors({ email: emailError });
        setFormError(null);
        return;
      }
    }

    setFieldErrors({});
    setFormError(null);
    setSubmitting(true);

    // The age answer is written before the account so the gate is in place the
    // first time they sign in. Without an address there is nothing to key it to,
    // which only happens if the session expired mid-form.
    if (address && age.birthYear) {
      const recorded = await recordAge({
        email: address,
        birthYear: age.birthYear,
        guardianName: age.guardianName,
        guardianEmail: age.guardianEmail,
      });

      if (!recorded.ok) {
        setFormError(recorded.message);
        setSubmitting(false);
        return;
      }
    }

    if (finishing) {
      const result = await completeOnboarding({ role, interests, plan });
      if (!result.ok) {
        setFormError(result.message);
        setSubmitting(false);
        return;
      }

      router.push('/welcome?new=1');
      return;
    }

    const result = await signUpWithEmail({ email, role, interests, plan });

    if (!result.ok) {
      setFormError(result.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setSent({
      email: email.trim(),
      mock: result.mock,
      alreadyRegistered: result.alreadyRegistered,
    });
  };

  const retry = () => {
    setSent(null);
    setEmail('');
  };

  const canProceed = () => {
    if (step === 0) return true; // welcome
    if (step === 1) return role !== null;
    if (step === 2) return role === 'organization' || interests.length > 0;
    if (step === 3) return plan !== null;
    return false;
  };

  const firstStep = finishing ? 1 : 0;

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  };
  const back = () => {
    if (step > firstStep) setStep((s) => s - 1);
  };

  const toggleInterest = (label: string) => {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  // For organizations, skip interests and jump to plan selection
  const handleRoleSelect = (r: Role) => {
    setRole(r);
    if (r === 'organization') {
      setPlan('club');
      setStep(3); // skip to account step
    } else {
      setStep(2); // go to interests
    }
  };

  const handlePlanSelect = (p: Plan) => {
    setPlan(p);
  };

  // A minor cannot hold a subscription, so answering "under 18" drops any paid
  // plan already picked rather than letting them reach a checkout they are not
  // allowed to complete.
  const handleAgeChange = (next: AgeAnswer) => {
    setAge(next);
    if (bracketOf(next) === 'minor' && plan !== 'free' && role === 'student') {
      setPlan('free');
    }
  };

  return (
    <div className="min-h-screen bg-brand-950 text-white flex flex-col">
      {/* Top bar */}
      <header className="px-5 sm:px-8 py-5 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 text-white">
            <Compass className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-base text-white">
            Campus<span className="text-brand-400">Quest</span>
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 pb-16">
        <div className="w-full max-w-lg">
          {/* Progress bar */}
          <div className={`flex items-center gap-2 ${finishing ? 'mb-4' : 'mb-8'}`}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-gold-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {finishing && (
            <p className="mb-8 text-center text-sm text-white/50">
              Your email is confirmed. Answer a few questions and your account is set up.
            </p>
          )}

          {/* Step content */}
          <div key={step} className="animate-fade-in">
            {step === 0 && <WelcomeStep />}
            {step === 1 && (
              <RoleStep role={role} onSelect={handleRoleSelect} />
            )}
            {step === 2 && (
              <InterestStep
                interests={interests}
                onToggle={toggleInterest}
              />
            )}
            {step === 3 &&
              (sent ? (
                <CheckInbox
                  email={sent.email}
                  mock={sent.mock}
                  alreadyRegistered={sent.alreadyRegistered}
                  continueHref="/welcome?new=1"
                  onUseDifferentEmail={retry}
                />
              ) : (
                <AccountStep
                  role={role}
                  plan={plan}
                  email={email}
                  age={age}
                  onAge={handleAgeChange}
                  onEmail={handleEmailChange}
                  onPlanSelect={handlePlanSelect}
                  onSubmit={handleSubmit}
                  fieldErrors={fieldErrors}
                  formError={formError}
                  submitting={submitting}
                  finishing={finishing}
                />
              ))}
          </div>

          {/* Navigation buttons */}
          {step > 0 && step < 3 && (
            <div className="flex items-center justify-between mt-8">
              {step > firstStep ? (
                <button
                  onClick={back}
                  className="inline-flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <span />
              )}
              <button
                onClick={next}
                disabled={!canProceed()}
                className="btn-gold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 0 && (
            <div className="mt-8 flex justify-center">
              <button onClick={next} className="btn-gold">
                Let&apos;s go
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Step 0: Welcome ---------- */

function WelcomeStep() {
  return (
    <div className="text-center py-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 mb-6">
        <Compass className="w-8 h-8" strokeWidth={2.5} />
      </div>
      <h1 className="text-3xl font-extrabold">Welcome to CampusQuest</h1>
      <p className="mt-4 text-white/60 text-lg leading-relaxed max-w-md mx-auto">
        Let&apos;s set up your account. It takes less than a minute — just answer a
        few quick questions and you&apos;re in.
      </p>
      <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/40">
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-gold-400" />
          4 steps
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-gold-400" />
          Under a minute
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 text-gold-400" />
          No credit card to start
        </span>
      </div>
    </div>
  );
}

/* ---------- Step 1: Role ---------- */

function RoleStep({
  role,
  onSelect,
}: {
  role: Role | null;
  onSelect: (r: Role) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-center">I am a...</h2>
      <p className="mt-2 text-sm text-white/50 text-center">
        We&apos;ll tailor your experience based on your answer.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('student')}
          className={`group p-6 rounded-2xl border transition-all duration-200 text-center ${
            role === 'student'
              ? 'bg-brand-600 border-brand-500 shadow-lift'
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
          }`}
        >
          <div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-transform group-hover:scale-110 ${
              role === 'student' ? 'bg-white text-brand-700' : 'bg-brand-600 text-white'
            }`}
          >
            <GraduationCap className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base">Student</h3>
          <p className="text-xs text-white/50 mt-1">Discover events & clubs</p>
        </button>

        <button
          onClick={() => onSelect('organization')}
          className={`group p-6 rounded-2xl border transition-all duration-200 text-center ${
            role === 'organization'
              ? 'bg-brand-600 border-brand-500 shadow-lift'
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
          }`}
        >
          <div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-transform group-hover:scale-110 ${
              role === 'organization' ? 'bg-white text-brand-700' : 'bg-gold-500 text-brand-950'
            }`}
          >
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base">Organization</h3>
          <p className="text-xs text-white/50 mt-1">Club or local business</p>
        </button>
      </div>

      {role === 'organization' && (
        <div className="mt-6 p-4 rounded-xl bg-gold-500/10 border border-gold-500/20 animate-fade-in">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
            <p className="text-sm text-white/70">
              Organization accounts include a full club page with event
              management, ticketing, templates, and analytics for{' '}
              <span className="font-bold text-gold-400">
                {formatPrice(PLANS.club.price)}/month
              </span>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Step 2: Interests ---------- */

function InterestStep({
  interests,
  onToggle,
}: {
  interests: string[];
  onToggle: (label: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-center">What are you into?</h2>
      <p className="mt-2 text-sm text-white/50 text-center">
        Pick a few interests. We&apos;ll use these to personalize your feed. You can
        change these anytime.
      </p>

      <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 gap-3">
        {interestOptions.map((opt) => {
          const selected = interests.includes(opt.label);
          return (
            <button
              key={opt.label}
              onClick={() => onToggle(opt.label)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                selected
                  ? 'bg-brand-600 border-brand-500 shadow-soft'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <opt.icon
                className={`w-6 h-6 ${selected ? 'text-white' : 'text-white/60'}`}
                strokeWidth={2}
              />
              <span
                className={`text-xs font-medium ${selected ? 'text-white' : 'text-white/60'}`}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-center text-xs text-white/40">
        {interests.length === 0
          ? 'Pick at least one to continue'
          : `${interests.length} selected`}
      </p>
    </div>
  );
}

/* ---------- Step 3: Plan + Account ---------- */

function AccountStep({
  role,
  plan,
  email,
  age,
  onAge,
  onEmail,
  onPlanSelect,
  onSubmit,
  fieldErrors,
  formError,
  submitting,
  finishing,
}: {
  role: Role | null;
  plan: Plan | null;
  email: string;
  age: AgeAnswer;
  onAge: (next: AgeAnswer) => void;
  onEmail: (v: string) => void;
  onPlanSelect: (p: Plan) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  fieldErrors: { email?: string };
  formError: string | null;
  submitting: boolean;
  finishing: boolean;
}) {
  const isOrg = role === 'organization';
  const bracket = bracketOf(age);
  // A club page is a paid account, and a minor cannot be held to that contract.
  const orgNeedsAdult = isOrg && bracket === 'minor';
  const ageOk = ageAnswerComplete(age) && !orgNeedsAdult;

  const heading = finishing
    ? isOrg
      ? 'Confirm your club plan'
      : 'Pick your plan'
    : isOrg
      ? 'Create your club account'
      : 'Pick your plan & create account';

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-center">{heading}</h2>
      <p className="mt-2 text-sm text-white/50 text-center">
        {isOrg
          ? `${formatPrice(PLANS.club.price)}/month — full club page with everything you need.`
          : 'Start free. Upgrade anytime.'}
      </p>

      {/* Plan selection (students only).
          Three columns leaves about 120px a card on a phone, which is not enough
          for a price, a tagline and a badge. Below `sm` each plan is a full-width
          row instead: name and tagline on the left, price on the right. */}
      {!isOrg && (
        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {planOptions.map((p) => {
            const selected = plan === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPlanSelect(p.id)}
                className={`relative rounded-xl border p-4 text-left transition-all duration-200 sm:text-center ${
                  selected
                    ? 'bg-brand-600 border-brand-500 shadow-soft'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-2 left-4 px-2 py-0.5 rounded-full bg-gold-500 text-brand-950 text-[9px] font-bold uppercase tracking-wide whitespace-nowrap sm:left-1/2 sm:-translate-x-1/2">
                    {p.badge}
                  </span>
                )}

                <div className="flex items-center gap-3 sm:block">
                  <div className="min-w-0 flex-1 sm:flex-none">
                    <p className={`text-sm font-bold ${selected ? 'text-white' : 'text-white/80'}`}>
                      {p.name}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-white/40 sm:hidden">
                      {p.tagline}
                    </p>
                  </div>

                  <p
                    className={`shrink-0 text-xl font-extrabold sm:mt-1 ${
                      selected ? 'text-white' : 'text-white/80'
                    }`}
                  >
                    {p.price}
                    <span className="text-xs font-normal">{p.period}</span>
                  </p>

                  <p className="mt-1.5 hidden text-[10px] leading-snug text-white/40 sm:block">
                    {p.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!isOrg && <p className="mt-3 text-center text-xs leading-relaxed text-white/40">{PRICE_LOCK_COPY}</p>}

      {/* Org plan summary */}
      {isOrg && (
        <div className="mt-6 p-4 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gold-500 text-brand-950">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Club & Business</p>
              <p className="text-xs text-white/50">Full club page toolkit</p>
            </div>
          </div>
          <span className="text-lg font-extrabold text-gold-400">
            {formatPrice(PLANS.club.price)}
            <span className="text-sm font-normal">/mo</span>
          </span>
        </div>
      )}

      {/* Account form */}
      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        {formError && <FormAlert message={formError} />}

        {!finishing && (
          <TextField
            label="School email"
            type="email"
            value={email}
            onChange={onEmail}
            placeholder={isOrg ? 'you@yourclub.org' : 'you@uri.edu'}
            autoComplete="email"
            error={fieldErrors.email}
            disabled={submitting}
          />
        )}

        <AgeFields value={age} onChange={onAge} disabled={submitting} />

        {orgNeedsAdult && (
          <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm leading-relaxed text-red-100">
            A club account is a paid subscription, so it has to be held by someone 18 or
            over. Ask an officer or advisor who is 18+ to create it, then they can add you.
          </div>
        )}

        <button
          type="submit"
          disabled={(!finishing && !email) || !plan || !ageOk || submitting}
          className="btn-gold w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {finishing ? 'Saving your answers' : 'Sending your link'}
            </>
          ) : finishing ? (
            <>
              <Check className="w-4 h-4" />
              Finish setting up my account
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Email me a sign-up link
            </>
          )}
        </button>

        {!finishing && (
          <p className="text-xs text-white/40 text-center leading-relaxed">
            No password to pick. We email you a link that creates your account and
            signs you in.
          </p>
        )}
      </form>

      {!finishing && (
        <p className="mt-5 text-center text-sm text-white/50">
          Already have an account?{' '}
          <Link href="/login" className="text-gold-400 font-semibold hover:text-gold-500 transition-colors">
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}
