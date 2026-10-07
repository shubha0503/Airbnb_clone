'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Globe } from 'lucide-react';

const inspiration = {
  Popular: [['Dallas','House rentals'],['Portland','Flat rentals'],['Gulf Shores','Holiday rentals'],['Kauai','Holiday rentals'],['Brooklyn','Holiday rentals'],['Honolulu','Apartment rentals'],['Cincinnati','House rentals'],['Richmond','House rentals'],['Pocono Mountains','House rentals'],['Tokyo','House rentals'],['Wilmington','Villa rentals'],['Key West','Monthly rentals'],['Galveston','Cottage rentals'],['Pittsburgh','Holiday rentals'],['San Jose','House rentals'],['Philadelphia','Apartment rentals'],['Orange Beach','Monthly rentals'],['Rishikesh','Holiday rentals'],['Bhopal','Holiday rentals'],['Jaipur','Heritage stays'],['Goa','Beach stays'],['Manali','Mountain stays'],['Kochi','Cultural stays'],['Mumbai','Apartment rentals']],
  'Arts & culture': [['Jaipur','Heritage stays'],['Kochi','Art stays'],['Varanasi','Cultural stays'],['Udaipur','Palace stays'],['Delhi','Museum stays'],['Mysuru','Heritage stays'],['Pondicherry','Art stays'],['Ahmedabad','Cultural stays'],['Hampi','Historic stays'],['Kolkata','Culture stays'],['Bhopal','Museum stays'],['Amritsar','Heritage stays']],
  Beach: [['Goa','Beach stays'],['Alibaug','Beach stays'],['Kovalam','Holiday rentals'],['Gokarna','Beach stays'],['Varkala','Holiday rentals'],['Puri','Beach stays'],['Pondicherry','Beach stays'],['Kochi','Holiday rentals'],['Diu','Beach stays'],['Chennai','Beach stays'],['Mangalore','Holiday rentals'],['Andaman Islands','Beach stays']],
  Mountains: [['Manali','Cabin stays'],['Shimla','Holiday rentals'],['Mussoorie','Mountain stays'],['Nainital','Lake stays'],['Srinagar','Holiday rentals'],['Dharamshala','Mountain stays'],['Rishikesh','Mountain stays'],['Darjeeling','Holiday rentals'],['Ooty','Cottage stays'],['Gangtok','Mountain stays'],['Lonavala','Villa stays'],['Coorg','Cottage stays']],
  Outdoors: [['Jim Corbett','Nature stays'],['Wayanad','Nature stays'],['Coorg','Cabin stays'],['Ranthambore','Nature stays'],['Kaziranga','Nature stays'],['Kanha','Nature stays'],['Pench','Nature stays'],['Munnar','Nature stays'],['Tadoba','Nature stays'],['Sundarbans','Nature stays'],['Pachmarhi','Nature stays'],['Chikmagalur','Nature stays']],
  'Things to do': [['Jaipur','Local experiences'],['Mumbai','Food experiences'],['Delhi','Cultural experiences'],['Goa','Water activities'],['Kochi','Art experiences'],['Rishikesh','Outdoor activities'],['Varanasi','Cultural experiences'],['Bengaluru','Food experiences'],['Pune','Outdoor activities'],['Udaipur','Local experiences'],['Chennai','Food experiences'],['Bhopal','Local experiences']],
} as const;
type Category = keyof typeof inspiration;

const groups = [
  { title: 'Support', links: [['Help Centre','/help'],['Get help with a safety issue','/help'],['AirCover','/help'],['Anti-discrimination','/help'],['Disability support','/help'],['Cancellation options','/trips'],['Report neighbourhood concern','/help']] },
  { title: 'Hosting', links: [['Airbnb your home','/host'],['Airbnb your experience','/host'],['Airbnb your service','/host'],['AirCover for Hosts','/host'],['Hosting resources','/host'],['Community forum','/host'],['Hosting responsibly','/host'],['Join a free hosting class','/host'],['Find a co-host','/host']] },
  { title: 'Airbnb', links: [['2026 Summer Release','/'],['Newsroom','/'],['Careers','/'],['Investors','/'],['Airbnb.org emergency stays','/']] },
];

export const Footer: React.FC = () => {
  const [active, setActive] = useState<Category>('Popular');
  const [showAll, setShowAll] = useState(false);
  const destinations = inspiration[active];
  return <footer className="mt-16 border-t border-gray-200 bg-[#f7f7f7] text-sm text-gray-800">
    <div className="mx-auto max-w-[1800px] px-5 py-8 sm:px-8 lg:px-14">
      <section aria-labelledby="inspiration-title">
        <h2 id="inspiration-title" className="text-xl font-semibold tracking-tight">Inspiration for future getaways</h2>
        <div className="mt-4 flex gap-6 overflow-x-auto border-b border-gray-300 text-sm [scrollbar-width:none]">
          {(Object.keys(inspiration) as Category[]).map((category) => <button key={category} onClick={() => { setActive(category); setShowAll(false); }} className={`relative shrink-0 pb-3 ${active === category ? 'font-semibold text-gray-900 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>{category}</button>)}
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-5 py-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {(showAll ? destinations : destinations.slice(0, 18)).map(([city, kind], index) => <Link key={`${city}-${index}`} href={`/?location=${encodeURIComponent(city)}`} className="min-w-0 leading-5 hover:underline"><span className="block truncate font-medium text-gray-900">{city}</span><span className="block truncate text-gray-500">{kind}</span></Link>)}
        </div>
        <button onClick={() => setShowAll((value) => !value)} className="inline-flex items-center gap-1 font-semibold hover:underline">{showAll ? 'Show less' : 'Show more'} <ChevronDown size={15} className={showAll ? 'rotate-180' : ''} /></button>
      </section>
      <section className="mt-12 grid grid-cols-1 gap-8 border-b border-gray-300 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => <div key={group.title}><h3 className="mb-4 font-semibold text-gray-900">{group.title}</h3><ul className="space-y-3">{group.links.map(([label, href]) => <li key={label}><Link href={href} className="text-gray-800 hover:underline">{label}</Link></li>)}</ul></div>)}
      </section>
      <div className="flex flex-col gap-4 py-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2"><span>© 2026 Airbnb, Inc.</span><span aria-hidden="true">·</span><Link href="/help" className="hover:underline">Privacy</Link><span aria-hidden="true">·</span><Link href="/help" className="hover:underline">Terms</Link><span aria-hidden="true">·</span><Link href="/" className="hover:underline">Sitemap</Link></div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 font-semibold text-gray-900"><button className="inline-flex items-center gap-2 hover:underline"><Globe size={16}/> English (IN)</button><button className="hover:underline">₹ INR</button><div className="flex items-center gap-4" aria-label="Social media"> <a href="https://www.facebook.com/airbnb" target="_blank" rel="noreferrer" aria-label="Facebook" className="text-base">f</a><a href="https://www.instagram.com/airbnb" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-base">◎</a></div></div>
      </div>
    </div>
  </footer>;
};
