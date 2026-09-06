import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, Loader2 } from 'lucide-react';
import TextField from '@/components/TextField';
import FormAlert from '@/components/FormAlert';
import { signIn } from '@/lib/auth';
import { validateEmail, validatePassword } from '@/lib/validation';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const emailError = validateEmail(email);
    const passwordError = password ? null : validatePassword(password);

    if (emailError || passwordError) {
      setFieldErrors({ email: emailError ?? undefined, password: passwordError ?? undefined });
      setFormError(null);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setSubmitting(true);

    const result = await signIn({ email, password });

    if (!result.ok) {
      setFormError(result.message);
      setSubmitting(false);
      return;
    }

    navigate('/welcome', { state: { email: email.trim(), isNew: false } });
  };

  return (
    <div className="min-h-screen bg-brand-950 text-white flex flex-col">
      <header className="px-5 sm:px-8 py-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
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
            <p className="mt-3 text-white/60">Log in to see what's happening this week.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-7 backdrop-blur-sm">
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {formError && <FormAlert message={formError} />}

              <TextField
                label="School email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@uri.edu"
                autoComplete="email"
                error={fieldErrors.email}
                disabled={submitting}
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Your password"
                autoComplete="current-password"
                error={fieldErrors.password}
                disabled={submitting}
              />

              <button
                type="submit"
                disabled={submitting}
                className="btn-gold w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Logging in
                  </>
                ) : (
                  'Log in'
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-white/50">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              className="text-gold-400 font-semibold hover:text-gold-500 transition-colors"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
