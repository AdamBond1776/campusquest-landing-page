import Link from 'next/link';
import { ArrowRight, Sparkles, MapPin, Calendar, Users, Trophy } from 'lucide-react';
import { PLANS, formatPrice } from '@/lib/pricing';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-950 text-white pt-28 lg:pt-36 pb-20 lg:pb-28">
      {/* Background gradient mesh */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full bg-brand-600/30 blur-[120px]" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-brand-500/20 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-gold-500/10 blur-[100px]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative max-w-content mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="text-center lg:text-left animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span className="text-xs font-semibold tracking-wide text-white/90">
                Level Up Rhode Island — pilot opening this year
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-balance">
              Discover more of{' '}
              <span className="relative inline-block">
                <span className="relative z-10">college.</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-gold-500/40 -z-0 rounded" />
              </span>
            </h1>

            <p className="mt-6 text-lg lg:text-xl text-white/70 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Your personalized guide to campus life. We surface the clubs,
              events, and opportunities that match your interests — every week,
              automatically.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/signup" className="btn-gold">
                Start browsing free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#how-it-works" className="btn-ghost-light">
                See how it works
              </a>
            </div>

            <p className="mt-5 text-sm text-white/50">
              Browse free. Basic {formatPrice(PLANS.basic.price)}/mo. Premium{' '}
              {formatPrice(PLANS.premium.price)}/mo with Genius Mining.
            </p>
          </div>

          {/* Right: Phone mockup */}
          <div className="relative animate-fade-up [animation-delay:150ms]">
            <PhoneMockup />
          </div>
        </div>
      </div>

      {/* Bottom wave transition */}
      <div className="absolute bottom-0 inset-x-0">
        <svg viewBox="0 0 1440 80" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0,80 L0,40 C240,0 480,0 720,20 C960,40 1200,60 1440,30 L1440,80 Z" fill="#fbfcfd" />
        </svg>
      </div>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto max-w-[320px]">
      {/* Glow behind phone */}
      <div className="absolute -inset-8 bg-brand-400/20 blur-3xl rounded-full" />

      {/* Phone frame */}
      <div className="relative bg-brand-900 rounded-[2.5rem] p-3 shadow-2xl border border-white/10">
        <div className="bg-cream-50 rounded-[2rem] overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 py-3 text-[10px] font-semibold text-ink">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1.5 rounded-sm bg-ink/40" />
              <div className="w-3 h-1.5 rounded-sm bg-ink/60" />
              <div className="w-4 h-2 rounded-sm bg-ink/80" />
            </div>
          </div>

          {/* App header */}
          <div className="px-5 py-4 bg-brand-600 text-white">
            <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">
              This Week
            </p>
            <p className="text-lg font-bold mt-0.5">Your Quest</p>
          </div>

          {/* Feed cards */}
          <div className="p-4 space-y-3">
            <FeedCard
              icon={<Users className="w-4 h-4" />}
              tag="Club"
              tagColor="bg-brand-100 text-brand-700"
              title="Photography Club Meetup"
              meta="Tue 6pm · Memorial Union"
            />
            <FeedCard
              icon={<Trophy className="w-4 h-4" />}
              tag="Event"
              tagColor="bg-gold-500/20 text-gold-600"
              title="Intramural Basketball Finals"
              meta="Thu 7pm · Ryan Center"
            />
            <FeedCard
              icon={<Calendar className="w-4 h-4" />}
              tag="Activity"
              tagColor="bg-brand-100 text-brand-700"
              title="Free Yoga on the Quad"
              meta="Fri 8am · Quad Lawn"
            />
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-around px-6 py-3 border-t border-cream-200">
            <div className="flex flex-col items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />
              <span className="text-[9px] font-bold text-brand-600">Feed</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cream-400" />
              <span className="text-[9px] font-medium text-cream-400">Clubs</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cream-400" />
              <span className="text-[9px] font-medium text-cream-400">Map</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cream-400" />
              <span className="text-[9px] font-medium text-cream-400">Me</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification badge */}
      <div className="absolute -right-4 top-1/3 bg-white rounded-2xl shadow-lift p-3 flex items-center gap-2.5 animate-fade-in [animation-delay:600ms]">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-100">
          <MapPin className="w-4 h-4 text-brand-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-ink">3 events near you</p>
          <p className="text-[10px] text-ink/50">Within 5 min walk</p>
        </div>
      </div>
    </div>
  );
}

function FeedCard({
  icon,
  tag,
  tagColor,
  title,
  meta,
}: {
  icon: React.ReactNode;
  tag: string;
  tagColor: string;
  title: string;
  meta: string;
}) {
  return (
    <div className="bg-white rounded-xl p-3.5 shadow-soft border border-cream-200">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cream-100 text-brand-600 shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <span
            className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${tagColor}`}
          >
            {tag}
          </span>
          <p className="text-sm font-bold text-ink mt-1 leading-snug">{title}</p>
          <p className="text-[11px] text-ink/50 mt-0.5">{meta}</p>
        </div>
      </div>
    </div>
  );
}
