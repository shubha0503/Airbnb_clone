'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isRegister = mode === 'register';

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = isRegister
        ? await api.register({ name, email, password })
        : await api.login({ email, password });
      localStorage.setItem('airbnb-user-id', String(user.id));
      window.dispatchEvent(new Event('airbnb-user-change'));
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect to the account service.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-10 sm:py-16">
      <section className="mx-auto max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
        <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
          <p className="text-sm font-semibold text-airbnb">Welcome to Airbnb</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{isRegister ? 'Create your account' : 'Log in'}</h1>
          <p className="mt-2 text-sm text-gray-500">Book stays, save favorites, and manage your trips.</p>
        </div>
        <form onSubmit={submit} className="space-y-4 p-6 sm:p-8">
          {isRegister && <label className="block text-sm font-medium text-gray-700">Full name<input autoComplete="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 p-3 focus:border-gray-900 focus:outline-none" /></label>}
          <label className="block text-sm font-medium text-gray-700">Email<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 p-3 focus:border-gray-900 focus:outline-none" /></label>
          <label className="block text-sm font-medium text-gray-700">Password<input type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={isRegister ? 8 : 1} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 p-3 focus:border-gray-900 focus:outline-none" />{isRegister && <span className="mt-1 block text-xs text-gray-500">Use at least 8 characters.</span>}</label>
          {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-airbnb px-4 py-3 font-semibold text-white transition hover:bg-airbnb-dark disabled:opacity-60">{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Continue'}</button>
          <p className="text-center text-sm text-gray-600">{isRegister ? 'Already have an account?' : 'New to Airbnb?'}{' '}<Link className="font-semibold text-gray-900 underline" href={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Sign up'}</Link></p>
          <p className="text-xs leading-5 text-gray-400">Demo authentication for this assignment. Use test data only.</p>
        </form>
      </section>
    </main>
  );
}
