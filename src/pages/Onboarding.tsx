import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowLeft,
  ArrowRight,
  Check,
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
  Sparkles,
} from 'lucide-react';

type Role = 'student' | 'organization';
type Plan = 'free' | 'basic' | 'premium' | 'club';

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

const planOptions: {
  id: Plan;
  name: string;
  price: string;
  period: string;
  tagline: string;
  highlight?: boolean;
  badge?: string;
}[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    tagline: 'Browse events, clubs, and activities.',
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '$3',
    period: '/mo',
    tagline: 'Profile, save events, filter by interests.',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$5',
    period: '/mo',
    tagline: 'Smart notifications, weekly feed, invite friends.',
    highlight: true,
    badge: 'Most popular',
  },
];

const TOTAL_STEPS = 4;

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canProceed = () => {
    if (step === 0) return true; // welcome
    if (step === 1) return role !== null;
    if (step === 2) return role === 'organization' || interests.length > 0;
    if (step === 3) return plan !== null;
    return false;
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  };
  const back = () => {
    if (step > 0) setStep((s) => s - 1);
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

  return (
    <div className="min-h-screen bg-brand-950 text-white flex flex-col">
      {/* Top bar */}
      <header className="px-5 sm:px-8 py-5 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
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
          <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-gold-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

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
            {step === 3 && (
              <AccountStep
                role={role}
                plan={plan}
                email={email}
                password={password}
                onEmail={setEmail}
                onPassword={setPassword}
                onPlanSelect={handlePlanSelect}
              />
            )}
          </div>

          {/* Navigation buttons */}
          {step > 0 && step < 3 && (
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={back}
                className="inline-flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
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
                Let's go
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
        Let's set up your account. It takes less than a minute — just answer a
        few quick questions and you're in.
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
        We'll tailor your experience based on your answer.
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
              <span className="font-bold text-gold-400">$49/month</span>.
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
        Pick a few interests. We'll use these to personalize your feed. You can
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
  password,
  onEmail,
  onPassword,
  onPlanSelect,
}: {
  role: Role | null;
  plan: Plan | null;
  email: string;
  password: string;
  onEmail: (v: string) => void;
  onPassword: (v: string) => void;
  onPlanSelect: (p: Plan) => void;
}) {
  const isOrg = role === 'organization';

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-center">
        {isOrg ? 'Create your club account' : 'Pick your plan & create account'}
      </h2>
      <p className="mt-2 text-sm text-white/50 text-center">
        {isOrg
          ? '$49/month — full club page with everything you need.'
          : 'Start free. Upgrade anytime.'}
      </p>

      {/* Plan selection (students only) */}
      {!isOrg && (
        <div className="mt-7 grid grid-cols-3 gap-3">
          {planOptions.map((p) => {
            const selected = plan === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPlanSelect(p.id)}
                className={`relative p-4 rounded-xl border text-center transition-all duration-200 ${
                  selected
                    ? 'bg-brand-600 border-brand-500 shadow-soft'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gold-500 text-brand-950 text-[9px] font-bold uppercase tracking-wide whitespace-nowrap">
                    {p.badge}
                  </span>
                )}
                <p className={`text-sm font-bold ${selected ? 'text-white' : 'text-white/80'}`}>
                  {p.name}
                </p>
                <p className={`text-xl font-extrabold mt-1 ${selected ? 'text-white' : 'text-white/80'}`}>
                  {p.price}
                  <span className="text-xs font-normal">{p.period}</span>
                </p>
                <p className="text-[10px] text-white/40 mt-1.5 leading-snug">
                  {p.tagline}
                </p>
              </button>
            );
          })}
        </div>
      )}

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
          <span className="text-lg font-extrabold text-gold-400">$49<span className="text-sm font-normal">/mo</span></span>
        </div>
      )}

      {/* Account form */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">
            School email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            placeholder="you@uri.edu"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => onPassword(e.target.value)}
            placeholder="Create a password"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
          />
        </div>

        <button
          type="button"
          disabled={!email || !password || !plan}
          onClick={(e) => e.preventDefault()}
          className="btn-gold w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <Sparkles className="w-4 h-4" />
          Create my account
        </button>
      </div>

      <p className="mt-5 text-center text-sm text-white/50">
        Already have an account?{' '}
        <Link to="/login" className="text-gold-400 font-semibold hover:text-gold-500 transition-colors">
          Log in
        </Link>
      </p>
    </div>
  );
}
