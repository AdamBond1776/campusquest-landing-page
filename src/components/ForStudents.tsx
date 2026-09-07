import Link from 'next/link';
import {
  Search,
  Bookmark,
  Filter,
  Bell,
  CalendarDays,
  Users,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Browse everything on campus',
    body: 'See all the clubs, events, and activities happening around you. No account needed to start exploring.',
    tier: 'Free',
  },
  {
    icon: Bookmark,
    title: 'Save events for later',
    body: 'Bookmark events you\'re interested in and come back to them. Never lose track of that thing you wanted to go to.',
    tier: '$3/mo',
  },
  {
    icon: Filter,
    title: 'Filter by what you love',
    body: 'Music, sports, volunteering, gaming, academics, and more. Zero noise — only the things that fit you.',
    tier: '$3/mo',
  },
  {
    icon: Bell,
    title: 'Smart weekly notifications',
    body: 'We only ping you for things that match your interests. No spam, no noise — just the good stuff, right on your phone.',
    tier: '$5/mo',
  },
  {
    icon: CalendarDays,
    title: 'Your week at a glance',
    body: 'A clean calendar view shows everything happening this week that fits your interests. Plan ahead or be spontaneous.',
    tier: '$5/mo',
  },
  {
    icon: Users,
    title: 'Bring your friends',
    body: 'Mass-invite your friends list via text or email to any event. Because showing up is better together.',
    tier: '$5/mo',
  },
];

const tierColors: Record<string, string> = {
  Free: 'bg-cream-200 text-ink/60',
  '$3/mo': 'bg-brand-100 text-brand-700',
  '$5/mo': 'bg-gold-500/20 text-gold-600',
};

export default function ForStudents() {
  return (
    <section id="students" className="py-20 lg:py-28 bg-white">
      <div className="max-w-content mx-auto px-5 sm:px-8">
        <div className="max-w-2xl">
          <span className="eyebrow">For Students</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink text-balance">
            Stop scrolling. Start showing up.
          </h2>
          <p className="mt-5 text-lg text-ink/60 leading-relaxed">
            Browse for free. Upgrade to keep a profile, save events, get smart
            notifications, and bring your friends along. No more FOMO, no more
            digging through flyers and Instagram stories.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl bg-cream-50 border border-cream-200 transition-all duration-200 hover:bg-white hover:shadow-lift hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-brand-600 text-white transition-transform group-hover:scale-110">
                  <f.icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${tierColors[f.tier]}`}
                >
                  {f.tier}
                </span>
              </div>
              <h3 className="mt-5 text-base font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ink/60 leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 justify-center">
          <Link href="/signup" className="btn-primary">
            Start browsing free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-sm text-ink/50">
            Upgrade anytime. Cancel anytime.
          </span>
        </div>
      </div>
    </section>
  );
}
