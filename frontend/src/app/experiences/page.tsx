import Link from 'next/link';

const experiences = [
  { title: 'Taste the city with a local', place: 'Small-group food walks', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=85', tag: 'Food & drink' },
  { title: 'Find your next great view', place: 'Guided nature escapes', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=85', tag: 'Outdoor' },
  { title: 'Make something by hand', place: 'Creative workshops', image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1000&q=85', tag: 'Arts & culture' },
];

export default function ExperiencesPage() {
  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"><p className="text-sm font-semibold text-airbnb">Make the trip yours</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Experiences worth travelling for</h1><p className="mt-3 max-w-2xl text-gray-600">Discover local food, outdoor escapes, and creative activities. Explore homes while we grow the experience catalogue.</p><div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{experiences.map((item) => <article key={item.title} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"><img src={item.image} alt="" className="h-56 w-full object-cover"/><div className="p-5"><span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-airbnb">{item.tag}</span><h2 className="mt-3 text-lg font-bold">{item.title}</h2><p className="mt-1 text-sm text-gray-500">{item.place}</p><p className="mt-4 text-sm text-gray-600">Experience listings are being prepared for this demo.</p></div></article>)}</div><Link href="/" className="mt-8 inline-flex rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700">Explore homes</Link></main>;
}
