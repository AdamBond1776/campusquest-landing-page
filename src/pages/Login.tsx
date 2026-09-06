import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen bg-brand-950 text-white flex flex-col">
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
            <h1 className="text-3xl font-extrabold">Welcome back</h1>
            <p className="mt-3 text-white/60">
              Log in to see what's happening this week.
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
                  placeholder="Your password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors"
                />
              </div>

              <button type="submit" className="btn-gold w-full mt-2">
                Log in
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-white/50">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-gold-400 font-semibold hover:text-gold-500 transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
