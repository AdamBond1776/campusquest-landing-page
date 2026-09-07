import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Instagram, Linkedin, Twitter } from '@/components/BrandIcons';

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-white pt-16 pb-8">
      <div className="max-w-content mx-auto px-5 sm:px-8">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 text-white">
                <Compass className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <span className="font-extrabold text-xl">
                Campus<span className="text-brand-400">Quest</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-white/50 max-w-xs leading-relaxed">
              The personalized discovery layer for college life. Students find
              their people. Clubs find their members.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Social link"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-white/40 mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/#students" className="text-sm text-white/60 hover:text-white transition-colors">
                  For Students
                </Link>
              </li>
              <li>
                <Link href="/#organizations" className="text-sm text-white/60 hover:text-white transition-colors">
                  For Organizations
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-sm text-white/60 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/institutions" className="text-sm text-white/60 hover:text-white transition-colors">
                  For Schools
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-white/40 mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/signup" className="text-sm text-white/60 hover:text-white transition-colors">
                  Sign up
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">
                  Log in
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © 2026 CampusQuest. Built by students, for students.
          </p>
          <p className="text-xs text-white/40">
            Level Up Rhode Island — selecting three founding partners
          </p>
        </div>
      </div>
    </footer>
  );
}
