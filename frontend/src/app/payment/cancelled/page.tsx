'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';

export default function PaymentCancelledPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const bookingId = Number(new URLSearchParams(window.location.search).get('booking_id'));
    if (bookingId) api.cancelPendingCheckout(bookingId).catch(() => undefined).finally(() => setReady(true));
    else setReady(true);
  }, []);
  return <main className="grid min-h-[65vh] place-items-center bg-gray-50 px-4 py-12"><section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gray-100 text-2xl text-gray-600">×</div><h1 className="mt-5 text-2xl font-bold">Checkout cancelled</h1><p className="mt-3 text-sm leading-6 text-gray-600">No payment was taken. Your selected dates are available again.</p><div className="mt-7 flex justify-center gap-3"><Link href="/" className="rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white">Find another stay</Link><Link href="/trips" className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold">My trips</Link></div>{!ready && <p className="mt-4 text-xs text-gray-400">Updating your reservation…</p>}</section></main>;
}
