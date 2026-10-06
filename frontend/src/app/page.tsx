'use client';

import React, { useState, useEffect } from 'react';
import { CategoryBar } from '@/components/CategoryBar';
import { ListingCard } from '@/components/ListingCard';
import { FilterModal } from '@/components/FilterModal';
import { SearchModal } from '@/components/SearchModal';
import { Listing, SearchFilters } from '@/types';
import { api } from '@/services/api';
import { 
  SlidersHorizontal, 
  ChevronRight,
  ChevronLeft,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

const QUICK_FILTERS = [
  'Kitchen',
  'Free parking',
  'WiFi',
  'Washer',
  'Air conditioning',
  'Pet friendly',
];

const FUTURE_GETAWAYS = [
  { city: 'Nashville', type: 'Monthly Rentals' },
  { city: 'Madrid', type: 'Monthly Rentals' },
  { city: 'Portland', type: 'Monthly Rentals' },
  { city: 'Minneapolis', type: 'Monthly Rentals' },
  { city: 'Ocean City', type: 'House rentals' },
  { city: 'Charlotte', type: 'Monthly Rentals' },
  { city: 'Destin', type: 'Holiday rentals' },
  { city: 'Dublin', type: 'Apartment rentals' },
  { city: 'San Jose', type: 'House rentals' },
  { city: 'Dallas', type: 'Flat rentals' },
  { city: 'Cincinnati', type: 'Cabin rentals' },
  { city: 'Cleveland', type: 'Villa rentals' },
];

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingTotal, setListingTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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
    const urlFilters: SearchFilters = {
      location: params.get('location') || undefined,
      checkIn: params.get('checkIn') || undefined,
      checkOut: params.get('checkOut') || undefined,
      guests: Number(params.get('guests')) || undefined,
    };
    setFilters(urlFilters);
    fetchListings({ ...urlFilters, propertyType: selectedCategory === 'All' ? undefined : selectedCategory });
    fetchWishlist();
  }, []);

  const handleToggleQuickFilter = (amenity: string) => {
    let updated: string[];
    if (quickActiveFilters.includes(amenity)) {
      updated = quickActiveFilters.filter((a) => a !== amenity);
    } else {
      updated = [...quickActiveFilters, amenity];
    }
    setQuickActiveFilters(updated);
    const newFilters = { ...filters, amenities: updated };
    setFilters(newFilters);
    setCurrentPage(1);
    fetchListings({ ...newFilters, propertyType: selectedCategory === 'All' ? newFilters.propertyType : selectedCategory }, 1);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchListings({ ...filters, propertyType: category === 'All' ? filters.propertyType : category }, 1);
  };

  const handleApplyFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchListings({ ...newFilters, propertyType: selectedCategory === 'All' ? newFilters.propertyType : selectedCategory }, 1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setQuickActiveFilters([]);
    setSelectedCategory('All');
    setCurrentPage(1);
    window.history.replaceState(null, '', '/');
    fetchListings({}, 1);
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
      
      {/* Category Bar */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        onOpenFilter={() => setIsFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Quick Amenity Filter Pills (Image 4) */}
      <div className="bg-white border-b border-gray-100 py-2.5 px-4 sm:px-6 lg:px-10 max-w-[1800px] mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
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
      </div>

      {/* Main Content Layout */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 pt-6">
        
          <div className="space-y-12">
            
            <section aria-labelledby="stays-heading">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 id="stays-heading" className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
                    {filters.location ? `Stays in ${filters.location}` : selectedCategory === 'All' ? 'Explore stays' : `${selectedCategory} stays`}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">{listingTotal} {listingTotal === 1 ? 'place' : 'places'} to stay</p>
                </div>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-5 gap-y-8 animate-pulse">
                  {[...Array(8)].map((_, i) => <div key={i}><div className="aspect-[1.05] bg-gray-200 rounded-2xl" /><div className="mt-3 h-4 w-3/4 bg-gray-200 rounded" /><div className="mt-2 h-3 w-1/2 bg-gray-100 rounded" /></div>)}
                </div>
              ) : listings.length === 0 ? (
                <div className="rounded-3xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">
                  <h3 className="text-lg font-semibold text-gray-900">No stays match those filters</h3>
                  <p className="mt-2 text-sm text-gray-500">Try another destination or clear some filters.</p>
                  <button onClick={handleClearFilters} className="mt-5 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black">Clear filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-5 gap-y-8">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} isFavorite={wishlistIds.includes(listing.id)} onToggleWishlist={handleToggleWishlist} />
                  ))}
                </div>
              )}
              {totalPages > 1 && (
                <nav aria-label="Listings pages" className="mt-10 flex items-center justify-center gap-5">
                  <button onClick={() => fetchListings({ ...filters, propertyType: selectedCategory === 'All' ? filters.propertyType : selectedCategory }, currentPage - 1)} disabled={currentPage <= 1 || loading} className="rounded-full border border-gray-300 p-2.5 text-gray-800 hover:border-gray-900 disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={18} /></button>
                  <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                  <button onClick={() => fetchListings({ ...filters, propertyType: selectedCategory === 'All' ? filters.propertyType : selectedCategory }, currentPage + 1)} disabled={currentPage >= totalPages || loading} className="rounded-full border border-gray-300 p-2.5 text-gray-800 hover:border-gray-900 disabled:opacity-40" aria-label="Next page"><ChevronRight size={18} /></button>
                </nav>
              )}
            </section>
            {/* "Inspiration for future getaways" Tabbed Section (Image 8) */}
            <div className="pt-12 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Inspiration for future getaways</h3>
              <div className="flex border-b border-gray-200 gap-8 text-xs font-bold text-gray-600 mb-6 overflow-x-auto no-scrollbar">
                <span className="text-black border-b-2 border-black pb-3 cursor-pointer">Popular</span>
                <span className="hover:text-black pb-3 cursor-pointer">Arts & culture</span>
                <span className="hover:text-black pb-3 cursor-pointer">Beach</span>
                <span className="hover:text-black pb-3 cursor-pointer">Mountains</span>
                <span className="hover:text-black pb-3 cursor-pointer">Outdoors</span>
                <span className="hover:text-black pb-3 cursor-pointer">Things to do</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-xs">
                {FUTURE_GETAWAYS.map((dest) => (
                  <div key={dest.city}>
                    <p className="font-bold text-gray-900 hover:underline cursor-pointer">{dest.city}</p>
                    <p className="text-[11px] text-gray-500">{dest.type}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

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

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSearch={handleApplyFilters}
        initialFilters={filters}
      />

    </div>
  );
}

