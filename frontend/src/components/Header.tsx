'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, 
  Globe, 
  Menu, 
  User as UserIcon, 
  Heart, 
  Calendar as CalendarIcon, 
  Home as HomeIcon, 
  MapPin, 
  Plus, 
  Minus, 
  Building, 
  Sparkles,
  Compass,
  Bell,
  Palmtree,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { User, SearchFilters } from '@/types';

interface HeaderProps {
  onOpenSearch?: () => void;
  currentUser?: User | null;
  onApplyFilters?: (filters: SearchFilters) => void;
}

const SUGGESTED_DESTINATIONS = [
  { name: 'North Goa, Goa', desc: 'Popular beach destination', query: 'Goa', icon: Palmtree, color: 'text-amber-500 bg-amber-50' },
  { name: 'New Delhi, Delhi', desc: 'For sights like India Gate', query: 'Delhi', icon: Building, color: 'text-emerald-500 bg-emerald-50' },
  { name: 'Pune, Maharashtra', desc: 'A hidden gem', query: 'Pune', icon: Compass, color: 'text-sky-500 bg-sky-50' },
  { name: 'Bhopal, Madhya Pradesh', desc: 'Known for its lakes', query: 'Bhopal', icon: Sparkles, color: 'text-rose-500 bg-rose-50' },
  { name: 'Varanasi, Uttar Pradesh', desc: 'Off the beaten path', query: 'Varanasi', icon: MapPin, color: 'text-purple-500 bg-purple-50' },
  { name: 'Mumbai, Maharashtra', desc: 'For sights like Gateway of India', query: 'Mumbai', icon: Building, color: 'text-indigo-500 bg-indigo-50' },
];

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, currentUser, onApplyFilters }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const activeHeaderTab = pathname === '/experiences' ? 'experiences' : pathname === '/services' ? 'services' : 'homes';

  // Search Bar Expansion State
  const [isExpandedSearch, setIsExpandedSearch] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState<'where' | 'when' | 'who'>('where');

  // Search Inputs
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCheckIn, setSearchCheckIn] = useState('');
  const [searchCheckOut, setSearchCheckOut] = useState('');
  const [guestAdults, setGuestAdults] = useState(1);
  const [guestChildren, setGuestChildren] = useState(0);
  const [guestInfants, setGuestInfants] = useState(0);
  const [guestPets, setGuestPets] = useState(0);

  const totalGuests = guestAdults + guestChildren;

  useEffect(() => {
    const syncSearchFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setSearchLocation(params.get('location') || '');
      setSearchCheckIn(params.get('checkIn') || '');
      setSearchCheckOut(params.get('checkOut') || '');
      setGuestAdults(Number(params.get('guests')) || 1);
      setSearchSubmitted(params.get('search') === '1' || params.has('location') || params.has('checkIn'));
    };
    syncSearchFromUrl();
    window.addEventListener('popstate', syncSearchFromUrl);
    window.addEventListener('airbnb-search-clear', syncSearchFromUrl);
    return () => {
      window.removeEventListener('popstate', syncSearchFromUrl);
      window.removeEventListener('airbnb-search-clear', syncSearchFromUrl);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('airbnb-user-id');
    window.dispatchEvent(new Event('airbnb-user-change'));
    setIsMenuOpen(false);
    router.push('/');
  };

  const handleExecuteSearch = () => {
    const filters: SearchFilters = {
      location: searchLocation.trim() || undefined,
      checkIn: searchCheckIn || undefined,
      checkOut: searchCheckOut || undefined,
      guests: totalGuests > 0 ? totalGuests : undefined,
    };
    setSearchSubmitted(true);
    window.dispatchEvent(new CustomEvent('airbnb-search-submit', { detail: filters }));

    if (onApplyFilters) onApplyFilters(filters);
    else {
      const params = new URLSearchParams();
      params.set('search', '1');
      if (filters.location) params.set('location', filters.location);
      if (filters.checkIn) params.set('checkIn', filters.checkIn);
      if (filters.checkOut) params.set('checkOut', filters.checkOut);
      if (filters.guests) params.set('guests', String(filters.guests));
      router.push(`/?${params.toString()}`);
    }
    setIsExpandedSearch(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs transition-all duration-300">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between min-h-20">
          
          {/* Logo */}
            <Link href="/" onClick={() => { setSearchSubmitted(false); window.dispatchEvent(new Event('airbnb-search-clear')); }} className="flex items-center gap-2 cursor-pointer group shrink-0">
            <svg
              className="h-8 w-auto text-airbnb transition-transform group-hover:scale-105"
              viewBox="0 0 32 32"
              fill="currentColor"
            >
              <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.011.315c0 4.008-3.261 7.806-7.5 7.806-2.585 0-4.84-1.353-6.529-3.535l-.471-.628-.471.628c-1.688 2.182-3.944 3.535-6.529 3.535-4.239 0-7.5-3.798-7.5-7.806 0-1.074.256-2.097.896-3.578l.22-.486c.974-2.26 5.148-10.993 7.106-14.85l.527-1.011C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.282.607-3.374 2.584l-.442.852c-1.921 3.774-6.027 12.383-6.993 14.631l-.206.455c-.562 1.302-.785 2.133-.785 2.978 0 3.013 2.378 5.806 5.5 5.806 2.062 0 3.935-1.127 5.4-3.153l.9-1.246.9 1.246c1.465 2.026 3.338 3.153 5.4 3.153 3.122 0 5.5-2.793 5.5-5.806 0-.74-.184-1.5-.678-2.73l-.134-.326c-.958-2.215-5.061-10.821-6.988-14.593l-.447-.859C18.282 3.607 17.239 3 16 3zm0 11c1.933 0 3.5 1.567 3.5 3.5 0 2.21-2.01 4.5-3.5 5.864C14.51 22 12.5 19.71 12.5 17.5c0-1.933 1.567-3.5 3.5-3.5zm0 2c-.828 0-1.5.672-1.5 1.5 0 .973.996 2.368 1.5 3.01.504-.642 1.5-2.037 1.5-3.01 0-.828-.672-1.5-1.5-1.5z" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-airbnb hidden sm:inline">
              airbnb
            </span>
          </Link>

          {/* Desktop category navigation */}
          <nav aria-label="Explore" className="hidden md:flex items-center gap-5 lg:gap-8 text-sm font-semibold">
            <Link href="/" onClick={() => { setSearchSubmitted(false); window.dispatchEvent(new Event('airbnb-search-clear')); }} className={`flex items-center gap-2 pb-1 border-b-2 transition ${pathname === '/' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}>
              <span aria-hidden="true" className="text-[27px] leading-none drop-shadow-sm">🌍</span>
              <span>All</span>
            </Link>
            <Link href="/homes" className={`flex items-center gap-2 pb-1 border-b-2 transition ${pathname === '/homes' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}>
              <span aria-hidden="true" className="text-[27px] leading-none drop-shadow-sm">🏡</span>
              <span>Homes</span>
            </Link>
            <Link href="/experiences" className={`flex items-center gap-2 pb-1 border-b-2 transition ${activeHeaderTab === 'experiences' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}>
              <span aria-hidden="true" className="text-[27px] leading-none drop-shadow-sm">🎈</span>
              <span>Experiences</span>
            </Link>
            <Link href="/services" className={`flex items-center gap-2 pb-1 border-b-2 transition ${activeHeaderTab === 'services' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}>
              <span aria-hidden="true" className="text-[27px] leading-none drop-shadow-sm">🛎️</span>
              <span>Services</span>
            </Link>
          </nav>

          {/* Compact Pill Search Button (When not expanded) */}
          {!isExpandedSearch && (pathname !== '/' || searchSubmitted) && (
            <div
              onClick={() => setIsExpandedSearch(true)}
              className="flex min-w-0 max-w-[46vw] sm:max-w-none items-center border border-gray-300 rounded-full py-2 px-2 sm:px-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 gap-2 sm:gap-3 bg-white"
            >
              <button className="text-xs sm:text-sm font-semibold text-gray-900 border-r border-gray-300 pr-3 hover:text-black flex items-center gap-1.5">
                <HomeIcon size={14} className="text-gray-500" />
                <span className="max-w-[24vw] truncate">{searchLocation || 'Homes nearby'}</span>
              </button>
              <button className="text-xs sm:text-sm font-semibold text-gray-900 border-r border-gray-300 pr-3 hover:text-black hidden sm:inline">
                {searchCheckIn && searchCheckOut ? `${searchCheckIn} - ${searchCheckOut}` : 'Any week'}
              </button>
              <button className="text-xs sm:text-sm font-normal text-gray-500 hover:text-black hidden md:inline">
                {totalGuests > 0 ? `${totalGuests} guest(s)` : 'Add guests'}
              </button>
              <div className="bg-airbnb text-white p-2 rounded-full flex items-center justify-center hover:bg-airbnb-dark transition">
                <Search size={14} className="stroke-[3]" />
              </div>
            </div>
          )}

          {/* Account menu */}
          <div className="flex items-center gap-2">
            <Link
              href="/host"
              className="hidden sm:inline-flex text-xs sm:text-sm font-semibold py-2 px-3.5 rounded-full hover:bg-gray-100 transition duration-150"
            >
              {currentUser?.is_host ? 'Host Dashboard' : 'Become a host'}
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 border border-gray-300 rounded-full py-1.5 px-3 hover:shadow-md transition bg-white"
              >
                <Menu size={18} className="text-gray-600" />
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="bg-gray-500 text-white rounded-full p-1">
                    <UserIcon size={16} />
                  </div>
                )}
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  {currentUser ? <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                    <p className="mt-1 text-xs text-airbnb font-medium">{currentUser.is_host ? 'Host account' : 'Guest account'}</p>
                  </div> : <div className="py-1 border-b border-gray-100">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50">Log in</Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-airbnb hover:bg-gray-50">Sign up</Link>
                  </div>}

                  <div className="py-1 border-b border-gray-100">
                    <Link
                      href="/trips"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <CalendarIcon size={16} className="text-gray-500" />
                      My Trips
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Heart size={16} className="text-gray-500" />
                      Wishlists & Favorites
                    </Link>
                    <Link
                      href="/host"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <HomeIcon size={16} className="text-gray-500" />
                      Manage Listings (Host)
                    </Link>
                  </div>

                  <div className="px-4 pt-2 pb-1">
                    {currentUser ? <button onClick={handleSignOut} className="w-full rounded-lg px-2 py-2 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100">Log out</button> : <Link href="/register" onClick={() => setIsMenuOpen(false)} className="block rounded-lg px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">Create an account</Link>}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {pathname === '/' && !searchSubmitted && !isExpandedSearch && (
          <div className="hidden md:flex justify-center pb-7 pt-1">
            <div className="flex w-full max-w-[740px] items-center rounded-full border border-gray-300 bg-white py-2 pl-7 pr-2 shadow-sm transition hover:shadow-md">
              <button onClick={() => { setIsExpandedSearch(true); setActiveSearchTab('where'); }} className="min-w-0 flex-1 border-r border-gray-200 pr-6 text-left">
                <span className="block text-sm font-semibold text-gray-900">Where</span><span className="block truncate text-sm text-gray-500">{searchLocation || 'Search destinations'}</span>
              </button>
              <button onClick={() => { setIsExpandedSearch(true); setActiveSearchTab('when'); }} className="w-[30%] border-r border-gray-200 px-7 text-left">
                <span className="block text-sm font-semibold text-gray-900">When</span><span className="block truncate text-sm text-gray-500">{searchCheckIn && searchCheckOut ? `${searchCheckIn} – ${searchCheckOut}` : 'Add dates'}</span>
              </button>
              <button onClick={() => { setIsExpandedSearch(true); setActiveSearchTab('who'); }} className="w-[25%] px-7 text-left">
                <span className="block text-sm font-semibold text-gray-900">Who</span><span className="block truncate text-sm text-gray-500">{totalGuests > 0 ? `${totalGuests} guests` : 'Add guests'}</span>
              </button>
              <button onClick={handleExecuteSearch} aria-label="Search stays" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-airbnb text-white transition hover:bg-airbnb-dark"><Search size={19}/></button>
            </div>
          </div>
        )}

        {pathname === '/' && !searchSubmitted && !isExpandedSearch && (
          <div className="px-4 pb-3 md:hidden">
            <button onClick={() => { setIsExpandedSearch(true); setActiveSearchTab('where'); }} className="flex w-full items-center gap-3 rounded-full border border-gray-300 bg-white px-4 py-3 text-left shadow-sm">
              <Search size={18} className="shrink-0 text-gray-700" />
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-gray-900">Where to?</span><span className="block truncate text-xs text-gray-500">{searchLocation || 'Anywhere'} · {searchCheckIn && searchCheckOut ? `${searchCheckIn} – ${searchCheckOut}` : 'Any week'} · {totalGuests} guest(s)</span></span>
            </button>
          </div>
        )}

        {/* Expanded Top Search Bar Overlay (Exact Airbnb UI from Image 5, 9, 10) */}
        {isExpandedSearch && (
          <div className="py-4 border-t border-gray-100 bg-white animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-4xl mx-auto bg-gray-100 rounded-full p-2 border border-gray-200 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-1 relative">
              
              {/* Where Button */}
              <div className="relative">
                <button
                  onClick={() => setActiveSearchTab('where')}
                  className={`w-full p-3 px-6 rounded-full text-left transition ${
                    activeSearchTab === 'where' ? 'bg-white shadow-md' : 'hover:bg-gray-200/60'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Where</span>
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Search destinations"
                    className="w-full text-xs font-semibold text-gray-900 bg-transparent focus:outline-none placeholder-gray-500"
                  />
                </button>

                {/* Suggested Destinations Popover (Image 10) */}
                {activeSearchTab === 'where' && (
                  <div className="absolute top-16 left-0 w-[min(20rem,calc(100vw-2rem))] bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 z-50">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Suggested destinations</p>
                    <div className="space-y-1">
                      {SUGGESTED_DESTINATIONS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.name}
                            onClick={() => {
                              setSearchLocation(item.query);
                              setActiveSearchTab('when');
                            }}
                            className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gray-50 text-left transition"
                          >
                            <div className={`p-2.5 rounded-xl ${item.color}`}>
                              <Icon size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">{item.name}</p>
                              <p className="text-[11px] text-gray-500">{item.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* When Button */}
              <div className="relative">
                <button
                  onClick={() => setActiveSearchTab('when')}
                  className={`w-full p-3 px-6 rounded-full text-left transition ${
                    activeSearchTab === 'when' ? 'bg-white shadow-md' : 'hover:bg-gray-200/60'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">When</span>
                  <span className="text-xs font-semibold text-gray-900 block truncate">
                    {searchCheckIn && searchCheckOut ? `${searchCheckIn} to ${searchCheckOut}` : 'Add dates'}
                  </span>
                </button>

                {/* Dual Month Calendar Popover (Image 9) */}
                {activeSearchTab === 'when' && (
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[min(520px,calc(100vw-2rem))] bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 sm:p-6 z-50">
                    <p className="mb-4 text-center text-xs font-semibold text-gray-500">Choose your trip dates</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Check-in</label>
                        <input
                          type="date"
                          value={searchCheckIn}
                          onChange={(e) => setSearchCheckIn(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Checkout</label>
                        <input
                          type="date"
                          value={searchCheckOut}
                          onChange={(e) => setSearchCheckOut(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Who Button */}
              <div className="relative flex items-center justify-between">
                <button
                  onClick={() => setActiveSearchTab('who')}
                  className={`w-full p-3 px-6 rounded-full text-left transition ${
                    activeSearchTab === 'who' ? 'bg-white shadow-md' : 'hover:bg-gray-200/60'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Who</span>
                  <span className="text-xs font-semibold text-gray-900 block truncate">
                    {totalGuests > 0 ? `${totalGuests} guest(s)` : 'Add guests'}
                  </span>
                </button>

                <button
                  onClick={handleExecuteSearch}
                  className="bg-airbnb hover:bg-airbnb-dark text-white p-3.5 px-6 rounded-full flex items-center gap-2 font-bold text-xs shadow-md transition transform active:scale-95 shrink-0 mr-1"
                >
                  <Search size={16} className="stroke-[3]" />
                  <span>Search</span>
                </button>

                {/* Guest Counter Popover Dropdown (Image 5) */}
                {activeSearchTab === 'who' && (
                  <div className="absolute top-16 right-0 w-[min(20rem,calc(100vw-2rem))] bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 sm:p-6 space-y-6 z-50">
                    
                    {/* Adults */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div>
                        <p className="text-xs font-bold text-gray-900">Adults</p>
                        <p className="text-[11px] text-gray-500">Ages 13 or above</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setGuestAdults(Math.max(1, guestAdults - 1))}
                          disabled={guestAdults <= 1}
                          className="p-1.5 rounded-full border border-gray-300 disabled:opacity-40 hover:border-gray-900 transition"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{guestAdults}</span>
                        <button
                          onClick={() => setGuestAdults(guestAdults + 1)}
                          className="p-1.5 rounded-full border border-gray-300 hover:border-gray-900 transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div>
                        <p className="text-xs font-bold text-gray-900">Children</p>
                        <p className="text-[11px] text-gray-500">Ages 2-12</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setGuestChildren(Math.max(0, guestChildren - 1))}
                          disabled={guestChildren <= 0}
                          className="p-1.5 rounded-full border border-gray-300 disabled:opacity-40 hover:border-gray-900 transition"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{guestChildren}</span>
                        <button
                          onClick={() => setGuestChildren(guestChildren + 1)}
                          className="p-1.5 rounded-full border border-gray-300 hover:border-gray-900 transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Infants */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div>
                        <p className="text-xs font-bold text-gray-900">Infants</p>
                        <p className="text-[11px] text-gray-500">Under 2</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setGuestInfants(Math.max(0, guestInfants - 1))}
                          disabled={guestInfants <= 0}
                          className="p-1.5 rounded-full border border-gray-300 disabled:opacity-40 hover:border-gray-900 transition"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{guestInfants}</span>
                        <button
                          onClick={() => setGuestInfants(guestInfants + 1)}
                          className="p-1.5 rounded-full border border-gray-300 hover:border-gray-900 transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Pets */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900">Pets</p>
                        <p className="text-[11px] text-gray-500 underline cursor-pointer">Bringing a service animal?</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setGuestPets(Math.max(0, guestPets - 1))}
                          disabled={guestPets <= 0}
                          className="p-1.5 rounded-full border border-gray-300 disabled:opacity-40 hover:border-gray-900 transition"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{guestPets}</span>
                        <button
                          onClick={() => setGuestPets(guestPets + 1)}
                          className="p-1.5 rounded-full border border-gray-300 hover:border-gray-900 transition"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Touch-friendly category navigation remains available on phones. */}
      <nav aria-label="Explore" className="md:hidden flex items-center justify-start gap-5 overflow-x-auto border-t border-gray-100 px-4 py-2.5 text-xs font-semibold sm:justify-center sm:gap-7">
        <Link href="/" className={`flex shrink-0 items-center gap-1.5 ${pathname === '/' ? 'text-gray-900' : 'text-gray-500'}`}><Globe size={16} />All</Link>
        <Link href="/homes" className={`flex shrink-0 items-center gap-1.5 ${pathname === '/homes' ? 'text-gray-900' : 'text-gray-500'}`}><HomeIcon size={16} />Homes</Link>
        <Link href="/experiences" className={`flex shrink-0 items-center gap-1.5 ${activeHeaderTab === 'experiences' ? 'text-gray-900' : 'text-gray-500'}`}><Sparkles size={16} />Experiences</Link>
        <Link href="/services" className={`flex shrink-0 items-center gap-1.5 ${activeHeaderTab === 'services' ? 'text-gray-900' : 'text-gray-500'}`}><Bell size={16} />Services</Link>
      </nav>
    </header>
  );
};
