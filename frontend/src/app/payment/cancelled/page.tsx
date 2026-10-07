import Link from 'next/link';

export default function PaymentCancelledPage() {
  return <main className="grid min-h-[65vh] place-items-center bg-gray-50 px-4 py-12"><section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gray-100 text-2xl text-gray-600">×</div><h1 className="mt-5 text-2xl font-bold">Checkout cancelled</h1><p className="mt-3 text-sm leading-6 text-gray-600">No booking was created and no payment was taken. Choose a stay whenever you are ready.</p><div className="mt-7 flex justify-center gap-3"><Link href="/" className="rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white">Browse stays</Link><Link href="/trips" className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold">My trips</Link></div></section></main>;
}
