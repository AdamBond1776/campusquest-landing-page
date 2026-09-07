import Link from 'next/link';
import {
  Globe,
  CalendarRange,
  FileText,
  Image,
  Ticket,
  MessageSquare,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Custom club page with your URL',
    body: 'A clean, shareable page that showcases your club\'s mission, members, and events. No website to build, no social media to manage.',
  },
  {
    icon: CalendarRange,
    title: 'Log events for a week, month, or semester',
    body: 'Post events in seconds. Schedule them for the entire week, month, or full semester at once. Update your page anytime.',
  },
  {
    icon: FileText,
    title: 'Membership application templates',
    body: 'Customizable, ready-to-use templates let clubs collect applications, display rules, and provide key info — all on your page.',
  },
  {
    icon: Image,
    title: 'Video & photo scrapbook',
    body: 'Upload videos and pictures to keep a scrapbook of your club\'s activities and events throughout the year. Build your story.',
  },
  {
    icon: Ticket,
    title: 'Sell or offer tickets with reminders',
    body: 'Create tickets — free or paid — and send automatic reminders so members and viewers actually show up to your events.',
  },
  {
    icon: MessageSquare,
    title: 'Attendee feedback collection',
    body: 'After each event, attendees can leave feedback right on your page. Learn what worked and make the next one even better.',
  },
  {
    icon: BarChart3,
    title: 'Analytics on views & engagement',
    body: 'Track page views, event interest, ticket sales, and attendance. Know what resonates so you can plan smarter.',
  },
];

export default function ForOrganizations() {
  return (
    <section
      id="organizations"
      className="py-20 lg:py-28 bg-brand-950 text-white relative overflow-hidden"
    >
      {/* Background accents */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-600/20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gold-500/10 blur-[100px]" />
      </div>

      <div className="relative max-w-content mx-auto px-5 sm:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-gold-400">
            For Clubs & Local Businesses
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-balance">
            Everything your club needs, for $49/month
          </h2>
          <p className="mt-5 text-lg text-white/70 leading-relaxed">
            A full club page with event management, membership templates,
            ticketing, a media scrapbook, and attendee feedback. Everything in
            one place — no website, no flyers, no hassle.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:-translate-y-1"
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gold-500 text-brand-950 transition-transform group-hover:scale-110">
                <f.icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="mt-5 text-base font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 justify-center">
          <Link href="/signup" className="btn-gold">
            Claim your club page — $49/month
            <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-sm text-white/50">
            Set up in minutes. Cancel anytime.
          </span>
        </div>
      </div>
    </section>
  );
}
