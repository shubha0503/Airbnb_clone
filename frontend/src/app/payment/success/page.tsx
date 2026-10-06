'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { api } from '@/services/api';

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<'checking' | 'paid' | 'pending' | 'error'>('checking');
  const router = useRouter();
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (!sessionId) { setStatus('error'); return; }
    api.getPaymentSession(sessionId).then((result) => {
      if (result.paid && result.status === 'confirmed') {
        setStatus('paid');
        window.setTimeout(() => router.replace('/trips'), 1800);
      } else setStatus('pending');
    }).catch(() => setStatus('error'));
  }, [router]);
  return <main className="grid min-h-[65vh] place-items-center bg-gray-50 px-4 py-12"><section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">{status === 'checking' ? <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-airbnb" /> : status === 'paid' ? <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" /> : <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-50 text-amber-700">!</div>}<h1 className="mt-5 text-2xl font-bold">{status === 'checking' ? 'Confirming your payment…' : status === 'paid' ? 'Your stay is booked!' : status === 'pending' ? 'Payment is still processing' : 'We could not verify this payment'}</h1><p className="mt-3 text-sm leading-6 text-gray-600">{status === 'paid' ? 'Your payment was verified securely with Stripe. Taking you to your trips…' : status === 'checking' ? 'We are checking the secure Stripe checkout result.' : status === 'pending' ? 'Your booking will appear in My Trips once Stripe confirms payment. Refresh this page in a moment.' : 'Open My Trips to check your booking, or return to browsing.'}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/trips" className="rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white">View my trips</Link><Link href="/" className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold">Browse stays</Link></div></section></main>;
}
