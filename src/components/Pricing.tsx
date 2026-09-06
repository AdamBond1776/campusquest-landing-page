import { Link } from 'react-router-dom';
import {
  Check,
  Sparkles,
  User,
  Star,
  Building2,
  ArrowRight,
} from 'lucide-react';

type Tier = {
  name: string;
  icon: typeof Sparkles;
  price: string;
  period?: string;
  tagline: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  badge?: string;
  dark?: boolean;
};

const tiers: Tier[] = [
  {
    name: 'Free',
    icon: User,
    price: '$0',
    tagline: 'Browse and discover events, clubs, and activities on campus.',
    features: [
      'Browse all campus events',
      'View club pages and profiles',
      'Search by category or location',
      'See what\'s happening this week',
    ],
    cta: 'Start browsing',
  },
  {
    name: 'Basic',
    icon: Sparkles,
    price: '$3',
    period: '/month',
    tagline: 'Keep a profile, save events, and filter by what you love.',
    features: [
      'Everything in Free, plus:',
      'Personal user profile',
      'Save events for later',
      'Filter by your interests',
      'Follow clubs you love',
      'No ads, ever',
    ],
    cta: 'Go Basic',
  },
  {
    name: 'Premium',
    icon: Star,
    price: '$5',
    period: '/month',
    tagline: 'Smart notifications, personalized feeds, and bring your friends.',
    features: [
      'Everything in Basic, plus:',
      'Smart weekly notifications',
      'Personalized weekly feed',
      'Your week at a glance',
      'Mass invite friends via text or email',
      'Priority event recommendations',
    ],
    cta: 'Go Premium',
    highlight: true,
    badge: 'Most popular',
  },
  {
    name: 'Club & Business',
    icon: Building2,
    price: '$49',
    period: '/month',
    tagline: 'A full club page with event management, ticketing, templates, and more.',
    features: [
      'Custom club page with your URL',
      'Log events for a week, month, or full semester',
      'Membership application templates',
      'Club rules & info display sections',
      'Video & photo scrapbook gallery',
      'Sell or offer tickets with reminders',
      'Attendee feedback collection',
      'Analytics on views and engagement',
    ],
    cta: 'Claim your club page',
    dark: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-white">
      <div className="max-w-content mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <span className="eyebrow">Pricing</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink text-balance">
            Start free. Upgrade when you want more.
          </h2>
          <p className="mt-5 text-lg text-ink/60 leading-relaxed">
            Browse for free. Keep a profile for the price of a coffee. Go premium
            for less than a sandwich. Clubs get a full toolkit for $49/month.
          </p>
        </div>

        {/* Student tiers */}
        <div className="mt-14 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {tiers.slice(0, 3).map((t) => (
            <div
              key={t.name}
              className={`relative p-7 rounded-2xl transition-all duration-200 hover:-translate-y-1 ${
                t.highlight
                  ? 'bg-brand-950 text-white border border-brand-800 shadow-lift'
                  : 'bg-cream-50 border border-cream-200 shadow-soft'
              }`}
            >
              {t.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gold-500 text-brand-950 text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                  {t.badge}
                </div>
              )}

              <div
                className={`flex items-center justify-center w-11 h-11 rounded-xl mb-5 ${
                  t.highlight
                    ? 'bg-gold-500 text-brand-950'
                    : 'bg-brand-600 text-white'
                }`}
              >
                <t.icon className="w-5 h-5" />
              </div>

              <h3 className={`text-lg font-bold ${t.highlight ? 'text-white' : 'text-ink'}`}>
                {t.name}
              </h3>
              <div className="mt-2 mb-1">
                <span className={`text-4xl font-extrabold ${t.highlight ? 'text-white' : 'text-ink'}`}>
                  {t.price}
                </span>
                {t.period && (
                  <span className={`text-sm ml-1 ${t.highlight ? 'text-white/50' : 'text-ink/50'}`}>
                    {t.period}
                  </span>
                )}
              </div>
              <p className={`text-sm mb-5 ${t.highlight ? 'text-white/60' : 'text-ink/60'}`}>
                {t.tagline}
              </p>

              <ul className="space-y-2.5 mb-6">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        t.highlight ? 'text-gold-400' : 'text-brand-600'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        f.endsWith(':')
                          ? 'font-bold ' + (t.highlight ? 'text-white' : 'text-ink')
                          : t.highlight ? 'text-white/70' : 'text-ink/70'
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`w-full ${
                  t.highlight
                    ? 'btn-gold'
                    : 'btn-primary'
                }`}
              >
                {t.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Club tier — full width */}
        <div className="mt-6 max-w-4xl mx-auto">
          <div className="relative p-8 lg:p-10 rounded-2xl bg-brand-950 text-white border border-brand-800 shadow-lift overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[300px] rounded-full bg-gold-500/10 blur-[100px]" />

            <div className="relative grid lg:grid-cols-2 gap-8 items-start">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gold-500 text-brand-950">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{tiers[3].name}</h3>
                    <p className="text-xs text-white/50 font-medium">For clubs & local businesses</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-5xl font-extrabold text-white">$49</span>
                  <span className="text-sm text-white/50 ml-2">/month</span>
                </div>

                <p className="text-sm text-white/60 mb-6 max-w-md">
                  {tiers[3].tagline}
                </p>

                <Link to="/signup" className="btn-gold">
                  {tiers[3].cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {tiers[3].features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-white/70">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-ink/40">
          Pilot launching at the University of Rhode Island. More schools coming
          soon.
        </p>
      </div>
    </section>
  );
}
