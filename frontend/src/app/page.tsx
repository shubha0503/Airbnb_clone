'use client';

import React, { useState, useEffect } from 'react';
import { ListingCard } from '@/components/ListingCard';
import { MapView } from '@/components/MapView';
import { FilterModal } from '@/components/FilterModal';
import { Listing, SearchFilters } from '@/types';
import { api } from '@/services/api';
import { 
  SlidersHorizontal, 
  ChevronRight,
  ChevronLeft,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

const QUICK_FILTERS = ['Kitchen', 'Free parking', 'WiFi', 'Washer', 'Air conditioning', 'Allows pets', 'Instant Book', 'Self check-in'];

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingTotal, setListingTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSearchResults, setIsSearchResults] = useState(false);
  
  // Modals
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({});
  const [quickActiveFilters, setQuickActiveFilters] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  const fetchListings = async (currentFilters: SearchFilters, requestedPage = 1) => {
    setLoading(true);
    try {
      const data = await api.getListings({ ...currentFilters, page: requestedPage });
      setListings(data.items);
      setListingTotal(data.total);
      setTotalPages(data.total_pages);
      setCurrentPage(data.page);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const userId = Number(localStorage.getItem('airbnb-user-id')) || 4;
      const wishlists = await api.getWishlist(userId);
      setWishlistIds(wishlists.map((w) => w.listing_id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsSearchResults(params.get('search') === '1' || params.has('location') || params.has('checkIn'));
    const urlFilters: SearchFilters = {
      location: params.get('location') || undefined,
      checkIn: params.get('checkIn') || undefined,
      checkOut: params.get('checkOut') || undefined,
      guests: Number(params.get('guests')) || undefined,
    };
    setFilters(urlFilters);
    fetchListings(urlFilters);
    fetchWishlist();
    const onSearchSubmit = (event: Event) => {
      const submittedFilters = (event as CustomEvent<SearchFilters>).detail || {};
      setFilters(submittedFilters);
      setCurrentPage(1);
      setIsSearchResults(true);
      fetchListings(submittedFilters, 1);
    };
    const onSearchClear = () => {
      setIsSearchResults(false);
      setFilters({});
      setQuickActiveFilters([]);
      setCurrentPage(1);
      fetchListings({}, 1);
    };
    window.addEventListener('airbnb-search-submit', onSearchSubmit);
    window.addEventListener('airbnb-search-clear', onSearchClear);
    return () => {
      window.removeEventListener('airbnb-search-submit', onSearchSubmit);
      window.removeEventListener('airbnb-search-clear', onSearchClear);
    };
  }, []);

  const handleToggleQuickFilter = (pill: string) => {
    setIsSearchResults(true);
    let updated: string[];
    if (quickActiveFilters.includes(pill)) {
      updated = quickActiveFilters.filter((a) => a !== pill);
    } else {
      updated = [...quickActiveFilters, pill];
    }
    setQuickActiveFilters(updated);
    const amenities = updated.filter((item) => !['Allows pets', 'Instant Book', 'Self check-in'].includes(item));
    const newFilters: SearchFilters = {
      ...filters,
      amenities,
      allowsPets: updated.includes('Allows pets') || undefined,
      instantBook: updated.includes('Instant Book') || undefined,
      selfCheckIn: updated.includes('Self check-in') || undefined,
    };
    setFilters(newFilters);
    setCurrentPage(1);
    fetchListings(newFilters, 1);
  };

  const handleApplyFilters = (newFilters: SearchFilters) => {
    setIsSearchResults(true);
    setFilters(newFilters);
    setCurrentPage(1);
    fetchListings(newFilters, 1);
  };

  const handleClearFilters = () => {
    window.history.replaceState(null, '', '/');
    window.dispatchEvent(new Event('airbnb-search-clear'));
  };

  const handleToggleWishlist = async (listingId: number) => {
    try {
      const userId = Number(localStorage.getItem('airbnb-user-id')) || 4;
      const res = await api.toggleWishlist(userId, listingId);
      if (res.in_wishlist) {
        setWishlistIds([...wishlistIds, listingId]);
        toast.success('Saved to Wishlist');
      } else {
        setWishlistIds(wishlistIds.filter((id) => id !== listingId));
        toast.success('Removed from Wishlist');
      }
    } catch {
      toast.error('Could not update wishlist');
    }
  };

  const activeFilterCount =
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.propertyType ? 1 : 0) +
    (filters.roomType ? 1 : 0) +
    (filters.bedrooms !== undefined ? 1 : 0) +
    (filters.beds !== undefined ? 1 : 0) +
    (filters.instantBook ? 1 : 0) +
    (filters.selfCheckIn ? 1 : 0) +
    (filters.allowsPets ? 1 : 0) +
    (filters.guestFavourite ? 1 : 0) +
    (filters.luxe ? 1 : 0) +
    (filters.amenities?.length || 0);

  return (
    <div className="min-h-screen pb-20">
      
      {isSearchResults && <div className="bg-white border-b border-gray-100 py-2.5 px-4 sm:px-6 lg:px-10 max-w-[1800px] mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="flex items-center gap-1.5 border border-gray-300 rounded-full px-3.5 py-1.5 text-xs font-semibold text-gray-800 hover:border-black shrink-0"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>

        {QUICK_FILTERS.map((pill) => {
          const isActive = quickActiveFilters.includes(pill);
          return (
            <button
              key={pill}
              onClick={() => handleToggleQuickFilter(pill)}
              className={`border rounded-full px-3.5 py-1.5 text-xs font-semibold shrink-0 transition ${
                isActive
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-900'
              }`}
            >
              {pill}
            </button>
          );
        })}

        <div className="ml-auto shrink-0 hidden md:flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
          <Tag size={12} className="text-airbnb" /> Prices include all fees
        </div>
      </div>}

      {/* Main Content Layout */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 pt-6">
        {isSearchResults ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(520px,1fr)]">
            <section aria-labelledby="stays-heading" className="min-w-0">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 id="stays-heading" className="text-xl font-semibold tracking-tight text-gray-900">{loading ? 'Searching stays…' : `${listingTotal} homes`}</h2>
                  {filters.location && <p className="mt-1 text-sm text-gray-500">Stays in {filters.location}</p>}
                </div>
                <div className="hidden shrink-0 items-center gap-2 text-sm font-semibold text-gray-800 md:flex"><Tag size={19} className="fill-rose-500 text-rose-500"/> Prices include all fees</div>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 animate-pulse">{[...Array(4)].map((_, i) => <div key={i}><div className="aspect-square rounded-2xl bg-gray-200"/><div className="mt-3 h-4 w-3/4 rounded bg-gray-200"/><div className="mt-2 h-3 w-1/2 rounded bg-gray-100"/></div>)}</div>
              ) : listings.length === 0 ? (
                <div className="rounded-3xl border border-gray-200 bg-gray-50 px-6 py-16 text-center"><h3 className="text-lg font-semibold text-gray-900">No stays match those filters</h3><p className="mt-2 text-sm text-gray-500">Try another destination or clear some filters.</p><button onClick={handleClearFilters} className="mt-5 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black">Clear filters</button></div>
              ) : (
                <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} isFavorite={wishlistIds.includes(listing.id)} onToggleWishlist={handleToggleWishlist} />)}</div>
              )}
              {totalPages > 1 && <nav aria-label="Listings pages" className="mt-10 flex items-center justify-center gap-5"><button onClick={() => fetchListings(filters, currentPage - 1)} disabled={currentPage <= 1 || loading} className="rounded-full border border-gray-300 p-2.5 text-gray-800 hover:border-gray-900 disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={18} /></button><span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span><button onClick={() => fetchListings(filters, currentPage + 1)} disabled={currentPage >= totalPages || loading} className="rounded-full border border-gray-300 p-2.5 text-gray-800 hover:border-gray-900 disabled:opacity-40" aria-label="Next page"><ChevronRight size={18} /></button></nav>}
            </section>
            <aside aria-label="Map of available stays" className="sticky top-[190px] hidden h-[calc(100vh-210px)] min-h-[500px] overflow-hidden rounded-2xl xl:block"><MapView listings={listings}/></aside>
          </div>
        ) : (
          <div className="space-y-12 pb-10">
            <section aria-labelledby="popular-heading">
              <div className="mb-5 flex items-center justify-between"><h2 id="popular-heading" className="text-xl font-semibold tracking-tight text-gray-900">Popular homes in {listings[0]?.city || 'India'}</h2><div className="flex gap-2"><button aria-label="Previous homes" onClick={() => document.getElementById('popular-homes')?.scrollBy({left: -700, behavior: 'smooth'})} className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900"><ChevronLeft size={18}/></button><button aria-label="More homes" onClick={() => document.getElementById('popular-homes')?.scrollBy({left: 700, behavior: 'smooth'})} className="grid h-9 w-9 place-items-center rounded-full border border-gray-300 text-gray-900 hover:border-black"><ChevronRight size={18}/></button></div></div>
              {loading ? <div className="grid grid-flow-col auto-cols-[78%] gap-4 overflow-hidden sm:auto-cols-[38%] lg:auto-cols-[24%] 2xl:auto-cols-[19%]">{[...Array(5)].map((_,i)=><div key={i} className="aspect-[.82] animate-pulse rounded-2xl bg-gray-200"/>)}</div> : <div id="popular-homes" className="grid grid-flow-col auto-cols-[78%] gap-4 overflow-x-auto pb-2 no-scrollbar sm:auto-cols-[38%] lg:auto-cols-[24%] 2xl:auto-cols-[19%]">{listings.map((listing)=><ListingCard key={listing.id} listing={listing} isFavorite={wishlistIds.includes(listing.id)} onToggleWishlist={handleToggleWishlist}/>)}</div>}
            </section>
            <section aria-labelledby="favourite-heading"><h2 id="favourite-heading" className="mb-5 text-xl font-semibold tracking-tight text-gray-900">Guest favourite stays</h2><div className="grid grid-flow-col auto-cols-[78%] gap-4 overflow-x-auto pb-2 no-scrollbar sm:auto-cols-[38%] lg:auto-cols-[24%] 2xl:auto-cols-[19%]">{(listings.filter(l=>l.rating>=4.8).length ? listings.filter(l=>l.rating>=4.8) : listings).map((listing)=><ListingCard key={`favourite-${listing.id}`} listing={listing} isFavorite={wishlistIds.includes(listing.id)} onToggleWishlist={handleToggleWishlist}/>)}</div></section>
          </div>
        )}
      </div>

      {/* Modals */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        listingCount={listings.length}
      />

    </div>
  );
}

