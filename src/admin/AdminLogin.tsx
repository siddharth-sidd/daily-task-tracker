import React, { useState } from 'react';
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AdminLoginProps {
  onReturnToApp: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onReturnToApp }) => {
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await loginAdmin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Administrator sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
      <section className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-7 shadow-2xl">
        <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-300 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-center text-xl font-bold text-white">Admin sign in</h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Use the administrator credentials configured for this deployment.
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
            {error}
          </p>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-teal-500"
            />
          </label>
          <label className="block text-sm font-medium text-slate-300">
            Password
            <span className="relative mt-1.5 block">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-white outline-none focus:border-teal-500"
              />
            </span>
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-teal-600 py-2.5 font-bold text-white transition hover:bg-teal-500 disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in securely'}
          </button>
        </form>

        <button
          type="button"
          onClick={onReturnToApp}
          className="mt-5 flex w-full items-center justify-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to phone app
        </button>
      </section>
    </main>
  );
};
