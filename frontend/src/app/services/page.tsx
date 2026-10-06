import Link from 'next/link';

const services = [
  { title: 'A slower kind of morning', detail: 'Wellness and self-care', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85' },
  { title: 'A little help, wherever you are', detail: 'Local home services', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85' },
  { title: 'Celebrate the occasion', detail: 'Personal touches for your stay', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=85' },
];

export default function ServicesPage() {
  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"><p className="text-sm font-semibold text-airbnb">A stay with a little extra</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Services to make it special</h1><p className="mt-3 max-w-2xl text-gray-600">Browse ideas for wellness, local help, and thoughtful touches for your next getaway.</p><div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{services.map((item) => <article key={item.title} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"><img src={item.image} alt="" className="h-56 w-full object-cover"/><div className="p-5"><h2 className="text-lg font-bold">{item.title}</h2><p className="mt-1 text-sm text-gray-500">{item.detail}</p><p className="mt-4 text-sm text-gray-600">Service booking is coming soon. Browse available homes in the meantime.</p></div></article>)}</div><Link href="/" className="mt-8 inline-flex rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700">Explore homes</Link></main>;
}
