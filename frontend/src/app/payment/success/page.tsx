'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { api } from '@/services/api';

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<'checking' | 'paid' | 'error'>('checking');
  useEffect(() => {
    const bookingId = Number(new URLSearchParams(window.location.search).get('booking_id'));
    if (!Number.isInteger(bookingId) || bookingId < 1) { setStatus('error'); return; }
    api.getDemoBooking(bookingId).then((result) => {
      setStatus(result.payment_status === 'paid' && result.status === 'confirmed' ? 'paid' : 'error');
    }).catch(() => setStatus('error'));
  }, []);
  return <main className="grid min-h-[65vh] place-items-center bg-gray-50 px-4 py-12"><section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
    {status === 'checking' ? <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-airbnb" /> : status === 'paid' ? <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" /> : <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-50 text-amber-700">!</div>}
    <h1 className="mt-5 text-2xl font-bold">{status === 'checking' ? 'Confirming your reservation…' : status === 'paid' ? 'Your stay is booked!' : 'We could not verify this reservation'}</h1>
    <p className="mt-3 text-sm leading-6 text-gray-600">{status === 'paid' ? 'Your demo payment is recorded and the confirmed booking is saved to your account. No money was charged.' : status === 'checking' ? 'Checking the booking record.' : 'Open My Trips to check your reservations, or return to browsing.'}</p>
    <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/trips" className="rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white">View my trips</Link><Link href="/" className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold">Browse stays</Link></div>
  </section></main>;
}
