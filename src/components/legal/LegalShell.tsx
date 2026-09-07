import type { ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';
import { LEGAL_EFFECTIVE_DATE, formatLegalDate, legalReviewPending } from '@/lib/legal';

type Props = {
  title: string;
  summary: string;
  version: string;
  children: ReactNode;
};

/**
 * Shared frame for the policy documents.
 *
 * Long-form legal text is the one place on the site where a narrow measure and
 * generous line height matter more than visual interest, so the shell keeps the
 * column around 68 characters and gets out of the way.
 */
export default function LegalShell({ title, summary, version, children }: Props) {
  const provisional = legalReviewPending();

  return (
    <>
      <main className="bg-white">
        <header className="border-b border-slate-200 bg-slate-50">
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to CampusQuest
            </Link>
            <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">{summary}</p>
            <p className="mt-6 text-xs uppercase tracking-wide font-semibold text-slate-400">
              Version {version} · Effective {formatLegalDate(LEGAL_EFFECTIVE_DATE)}
            </p>
          </div>
        </header>

        {provisional ? (
          <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-8">
            <div className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 sm:p-5">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-900 leading-relaxed">
                <span className="font-bold">This document is provisional.</span> The operating
                entity has not been named yet and this text has not been reviewed by an attorney.
                It is published because an accurate description of what the software does is better
                than no notice at all, and because we would rather show you the gap than hide it. It
                is not a substitute for the reviewed version, which lands before the service charges
                anyone.
              </p>
            </div>
          </div>
        ) : null}

        <article className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16 legal-prose">
          {children}
        </article>
      </main>
      <Footer />
    </>
  );
}
