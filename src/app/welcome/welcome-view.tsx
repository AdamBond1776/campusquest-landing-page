'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Compass, Mail, Sparkles, CalendarCheck, ArrowLeft } from 'lucide-react';
import { getCurrentUser, type CurrentUser, type Plan } from '@/lib/auth';
import { PLANS, formatPrice } from '@/lib/pricing';

const planLabels: Record<Plan, string> = {
  free: PLANS.free.name,
  basic: `${PLANS.basic.name} — ${formatPrice(PLANS.basic.price)}/mo`,
  premium: `${PLANS.premium.name} — ${formatPrice(PLANS.premium.price)}/mo`,
  club: `${PLANS.club.name} — ${formatPrice(PLANS.club.price)}/mo`,
};

export default function WelcomeView({
  isNew,
  initialUser = null,
}: {
  isNew: boolean;
  initialUser?: CurrentUser | null;
}) {
  const [user, setUser] = useState<CurrentUser | null>(initialUser);

  // Only needed when the server could not resolve the session, which is the
  // case for the localStorage mock that stands in for Supabase. Until it lands
  // the page shows the same generic copy it always showed for a visitor with no
  // email on hand.
  useEffect(() => {
    if (initialUser) return;

    let active = true;
    getCurrentUser().then((resolved) => {
      if (active) setUser(resolved);
    });
    return () => {
      active = false;
    };
  }, [initialUser]);

  const email = user?.email;
  const plan = user?.plan;
  const isOrg = user?.role === 'organization';

  const steps = isOrg
    ? [
        {
          icon: Mail,
          title: 'Confirm your email',
          body: 'We sent a confirmation link. Click it to activate your club page.',
        },
        {
          icon: Sparkles,
          title: "We'll build out your page",
          body: 'Add your events, photos, and description — we help with the first one.',
        },
        {
          icon: CalendarCheck,
          title: 'Get discovered',
          body: 'Students matching your category see your events in their weekly feed.',
        },
      ]
    : [
        {
          icon: Mail,
          title: 'Confirm your email',
          body: 'We sent a confirmation link so we know it is really you.',
        },
        {
          icon: Sparkles,
          title: "We're matching your interests",
          body: 'Clubs, events, and activities are being lined up against what you picked.',
        },
        {
          icon: CalendarCheck,
          title: 'Your first weekly feed',
          body: 'The Rhode Island pilot opens this year. We email you the moment it is live.',
        },
      ];

  return (
    <div className="min-h-screen bg-brand-950 text-white flex flex-col">
      <header className="px-5 sm:px-8 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 pb-16">
        <div className="w-full max-w-lg animate-fade-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-5">
              <Compass className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-extrabold">
              {isNew ? "You're in." : 'Welcome back.'}
            </h1>
            <p className="mt-3 text-white/60">
              {email ? (
                <>
                  Signed in as <span className="text-white/90 font-medium">{email}</span>.
                </>
              ) : (
                'Your CampusQuest account is ready.'
              )}
            </p>
            {plan && (
              <span className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/30 text-xs font-semibold text-gold-400">
                {planLabels[plan]}
              </span>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-7 backdrop-blur-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-white/40 mb-5">
              What happens next
            </h2>
            <ol className="space-y-5">
              {steps.map((step, index) => (
                <li key={step.title} className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 shrink-0">
                    <step.icon className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">
                      <span className="text-white/30 mr-1.5">{index + 1}.</span>
                      {step.title}
                    </p>
                    <p className="text-sm text-white/50 mt-0.5 leading-relaxed">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-7 flex justify-center">
            <Link href="/" className="btn-ghost-light">
              Back to CampusQuest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
