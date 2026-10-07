'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'guest' | 'host'>('guest');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [nextPath, setNextPath] = useState('');
  const isRegister = mode === 'register';

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get('next') || '';
    if (next.startsWith('/') && !next.startsWith('//')) setNextPath(next);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (isRegister && name.trim().length < 2) { setError('Enter your name (at least 2 characters).'); return; }
    if (isRegister && password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    setBusy(true);
    setError('');
    try {
      const user = isRegister
        ? await api.register({ name: name.trim(), email: email.trim(), password, role })
        : await api.login({ email: email.trim(), password });
      localStorage.setItem('airbnb-user-id', String(user.id));
      window.dispatchEvent(new Event('airbnb-user-change'));
      const next = new URLSearchParams(window.location.search).get('next');
      router.replace(next?.startsWith('/') && !next.startsWith('//') ? next : '/');
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
          {isRegister && <label className="block text-sm font-medium text-gray-700">Account type<select value={role} onChange={(e) => setRole(e.target.value as 'guest' | 'host')} className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white p-3 focus:border-gray-900 focus:outline-none"><option value="guest">Guest</option><option value="host">Host</option></select><span className="mt-1 block text-xs text-gray-500">You can change to host mode later from the host dashboard.</span></label>}
          <label className="block text-sm font-medium text-gray-700">Email<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 p-3 focus:border-gray-900 focus:outline-none" /></label>
          <label className="block text-sm font-medium text-gray-700">Password<input type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={isRegister ? 8 : 1} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-300 p-3 focus:border-gray-900 focus:outline-none" />{isRegister && <span className="mt-1 block text-xs text-gray-500">Use at least 8 characters.</span>}</label>
          {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-airbnb px-4 py-3 font-semibold text-white transition hover:bg-airbnb-dark disabled:opacity-60">{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Continue'}</button>
          <p className="text-center text-sm text-gray-600">{isRegister ? 'Already have an account?' : 'New to Airbnb?'}{' '}<Link className="font-semibold text-gray-900 underline" href={`${isRegister ? '/login' : '/register'}${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ''}`}>{isRegister ? 'Log in' : 'Sign up'}</Link></p>
          {isRegister ? <p className="text-xs leading-5 text-gray-400">Demo authentication for this assignment. Use test data only.</p> : <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600"><p className="font-semibold text-gray-800">Demo accounts</p><button type="button" onClick={() => { setEmail('ashi@example.com'); setPassword('Guest1234!'); }} className="mt-2 block text-left underline">Guest: ashi@example.com · Guest1234!</button><button type="button" onClick={() => { setEmail('aarav.host@example.com'); setPassword('Host1234!'); }} className="mt-1 block text-left underline">Host: aarav.host@example.com · Host1234!</button></div>}
        </form>
      </section>
    </main>
  );
}
