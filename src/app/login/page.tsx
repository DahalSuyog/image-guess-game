'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    await signIn(email.trim(), password);
    router.push('/');
  };

  const inputClass =
    'w-full h-11 bg-surface-container-low border border-outline-variant rounded-md px-3 ' +
    'font-body-md text-body-md text-on-surface placeholder:text-outline/60 ' +
    'focus:border-primary focus:outline-none transition-colors';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-[320px] space-y-8">
        <div className="space-y-1 text-center">
          <Link href="/" className="font-headline-lg text-headline-lg text-primary lowercase">
            pixelpeel
          </Link>
          <p className="font-label-sm text-label-sm text-outline">sign in to save your results</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            autoComplete="email"
            className={inputClass}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoComplete="current-password"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={!email.trim() || submitting}
            className="w-full h-11 bg-primary text-on-primary rounded-md font-label-sm text-label-sm uppercase tracking-wider
              hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {submitting ? 'signing in…' : 'sign in'}
          </button>
        </form>

        <div className="text-center space-y-2">
          <p className="font-label-sm text-label-sm text-outline">
            demo only — any email and password works
          </p>
          <Link
            href="/"
            className="inline-block font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            continue as guest →
          </Link>
        </div>
      </div>
    </main>
  );
}
