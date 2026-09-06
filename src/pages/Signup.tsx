import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Check } from 'lucide-react';

export default function Signup() {
  return (
    <div className="min-h-screen bg-brand-950 text-white flex flex-col">
      {/* Mini nav */}
      <header className="px-5 sm:px-8 py-5">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 pb-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-5">
              <Compass className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-extrabold">Join CampusQuest</h1>
            <p className="mt-3 text-white/60">
              Browse free. Upgrade from $3/month. Takes 30 seconds.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-7 backdrop-blur-sm">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  School email
                </label>
                <input
                  type="email"
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
                  placeholder="Create a password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm font-medium text-white/80 hover:bg-white/10 hover:border-brand-400 transition-all"
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm font-medium text-white/80 hover:bg-white/10 hover:border-brand-400 transition-all"
                  >
                    Organization
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-gold w-full mt-2">
                Create my account
              </button>
            </form>

            <div className="mt-5 space-y-2">
              {['Browse free, upgrade anytime', 'No credit card to start', '30-second setup'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-white/50">
                  <Check className="w-4 h-4 text-gold-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-400 font-semibold hover:text-gold-500 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
