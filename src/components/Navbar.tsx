'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Compass } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'For Students', href: '#students' },
    { label: 'For Organizations', href: '#organizations' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'For Schools', href: '/institutions' },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-cream-50/90 backdrop-blur-md shadow-soft'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-content mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 text-white transition-transform group-hover:scale-105">
              <Compass className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-xl text-ink">
              Campus<span className="text-brand-600">Quest</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-ink/70 hover:text-brand-600 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-ink/80 hover:text-brand-600 transition-colors px-4 py-2"
            >
              Log in
            </Link>
            <Link href="/signup" className="btn-primary">
              Get the app
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden p-2 -mr-2 text-ink"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden pb-6 animate-fade-in">
            <div className="flex flex-col gap-1 pt-2">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-lg text-base font-medium text-ink/80 hover:bg-cream-100 hover:text-brand-600 transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 mt-4 px-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="btn-secondary w-full"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full"
                >
                  Get the app
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
