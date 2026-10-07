'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Star, 
  Heart, 
  Share2, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Check, 
  MapPin, 
  User as UserIcon, 
  X, 
  Grid,
  ChevronRight,
  ChevronLeft,
  Lock,
  Key,
  MessageSquare,
  SprayCan as Spray,
  Tag,
  CheckCircle,
  Home,
  Briefcase,
  GraduationCap,
  Search
} from 'lucide-react';
import { Listing, Review } from '@/types';
import { api, getCurrentUserId } from '@/services/api';
import toast from 'react-hot-toast';
import { FALLBACK_STAY_IMAGE, getListingImageUrl, useImageFallback } from '@/lib/images';
import { MapView } from '@/components/MapView';

const REGIONAL_DESTINATIONS = [
  { name: 'Lucknow', desc: 'Holiday rentals' },
  { name: 'Kathmandu', desc: 'Holiday rentals' },
  { name: 'Patna', desc: 'Holiday rentals' },
  { name: 'Pokhara', desc: 'Holiday rentals' },
  { name: 'Ranchi', desc: 'Holiday rentals' },
  { name: 'Allahabad', desc: 'Holiday rentals' },
  { name: 'Raipur', desc: 'Holiday rentals' },
  { name: 'Kanpur', desc: 'Holiday rentals' },
  { name: 'Faizabad', desc: 'Holiday rentals' },
];

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = Number(params?.id);

  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [nearbyListings, setNearbyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingLoadError, setListingLoadError] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<{check_in: string; check_out: string}[]>([]);

  // Sticky navbar visibility on scroll
  const [showStickyNav, setShowStickyNav] = useState(false);

  // Booking state
  const [checkIn, setCheckIn] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); });
  const [checkOut, setCheckOut] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 9); return d.toISOString().slice(0, 10); });
  const [guests, setGuests] = useState(1);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');

  // Modals
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyNav(window.scrollY > 450);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!listingId) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('checkIn')) setCheckIn(params.get('checkIn')!);
    if (params.get('checkOut')) setCheckOut(params.get('checkOut')!);
    if (params.get('guests')) setGuests(Math.max(1, Number(params.get('guests')) || 1));

    setLoading(true);
    api.getListingById(listingId)
      .then(async (listingData) => {
        setListing(listingData);
        const [reviewData, wishlistData, allListings, availability] = await Promise.all([
          api.getListingReviews(listingId).catch(() => []),
          getCurrentUserId() ? api.checkWishlist(getCurrentUserId()!, listingId).catch(() => ({ in_wishlist: false })) : Promise.resolve({ in_wishlist: false }),
          api.getListings().catch(() => ({ items: [] })),
          api.getAvailability(listingId).catch(() => ({ unavailable_dates: [] })),
        ]);
        setReviews(reviewData);
        setIsWishlist(wishlistData.in_wishlist);
        setNearbyListings(allListings.items.filter((l) => l.id !== listingId));
        setUnavailableDates(availability.unavailable_dates);
      })
      .catch((err) => {
        toast.error(err.message || 'Could not load this stay');
        setListingLoadError(true);
        setListing(null);
      })
      .finally(() => setLoading(false));
  }, [listingId]);

  const handleToggleWishlist = async () => {
    if (!listing) return;
    const userId = getCurrentUserId();
    if (!userId) { router.push(`/login?next=/listings/${listing.id}`); return; }
    try {
      const res = await api.toggleWishlist(userId, listing.id);
      setIsWishlist(res.in_wishlist);
      toast.success(res.in_wishlist ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Could not update wishlist');
    }
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 2;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 2;
  };

  const nights = calculateNights();
  const nightlySubtotal = listing ? listing.price_per_night * nights : 0;
  const cleaningFee = Math.round(nightlySubtotal * 0.05 * 100) / 100;
  const serviceFee = Math.round(nightlySubtotal * 0.10 * 100) / 100;
  const totalDue = nightlySubtotal + cleaningFee + serviceFee;

  const handleReserveClick = () => {
    if (!getCurrentUserId()) {
      router.push(`/login?next=/listings/${listing?.id}`);
      return;
    }
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      toast.error('Choose a check-out date after check-in');
      return;
    }
    if (unavailableDates.some((range) => checkIn < range.check_out && checkOut > range.check_in)) {
      toast.error('Those dates overlap an existing reservation. Choose different dates.');
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!listing) return;
    const guestId = getCurrentUserId();
    if (!guestId) { router.push(`/login?next=/listings/${listing.id}`); return; }
    setIsSubmittingBooking(true);
    try {
      const booking = await api.createDemoCheckout({ listing_id: listing.id, guest_id: guestId, check_in: checkIn, check_out: checkOut, guests, payment_method: paymentMethod });
      router.push(`/payment/success?booking_id=${booking.booking_id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not complete demo payment');
      setIsSubmittingBooking(false);
    }
  };

  const handleAddReview = async () => {
    if (!listing || !newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    const userId = getCurrentUserId();
    if (!userId) { router.push(`/login?next=/listings/${listing.id}`); return; }
    try {
      const createdReview = await api.createReview({
        listing_id: listing.id,
        user_id: userId,
        rating: newRating,
        comment: newComment,
      });
      toast.success('Review posted!');
      setReviews([createdReview, ...reviews]);
      setIsReviewModalOpen(false);
      setNewComment('');
    } catch (err: any) {
      toast.error(err.message || 'Could not submit review');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-96 bg-gray-200 rounded-3xl w-full mb-8" />
      </div>
    );
  }

  if (!listing) {
    return (
      <main className="mx-auto grid min-h-[50vh] max-w-xl place-items-center px-5 py-16 text-center">
        <div><h1 className="text-2xl font-bold text-gray-900">{listingLoadError ? 'This stay could not be loaded' : 'Stay not found'}</h1><p className="mt-2 text-sm text-gray-600">The listing may have been removed. Browse available stays and try another one.</p><Link href="/" className="mt-6 inline-flex rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white">Browse stays</Link></div>
      </main>
    );
  }

  const photos = listing.images && listing.images.length > 0 ? listing.images : [FALLBACK_STAY_IMAGE];

  return (
    <div className="min-h-screen bg-white">
      
      {/* Sticky Secondary Top Navbar (Image 6, 14) */}
      {showStickyNav && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-md py-3 px-6 transition-all duration-200 animate-in slide-in-from-top-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8 text-xs font-bold text-gray-900">
              <a href="#photos" className="hover:underline">Photos</a>
              <a href="#amenities" className="hover:underline">Amenities</a>
              <a href="#reviews" className="hover:underline">Reviews</a>
              <a href="#location" className="hover:underline">Location</a>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">₹{nightlySubtotal.toLocaleString()} <span className="text-xs font-normal text-gray-500">for {nights} nights</span></p>
                <p className="text-[11px] text-gray-600">★ {listing.rating.toFixed(2)} · {listing.review_count} reviews</p>
              </div>
              <button
                onClick={handleReserveClick}
                className="bg-airbnb hover:bg-airbnb-dark text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition"
              >
                Reserve
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Title Header (Image 18) */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              Welcome to {listing.title}
            </h1>
            <p className="text-xs text-gray-600">
              {listing.property_type} in {listing.city}, {listing.country}
            </p>
          </div>

          <div className="flex items-center gap-4 font-semibold text-xs text-gray-900">
            <button className="flex items-center gap-1.5 hover:bg-gray-100 py-1.5 px-3 rounded-lg transition">
              <Share2 size={16} /> <span className="underline">Share</span>
            </button>
            <button
              onClick={handleToggleWishlist}
              className="flex items-center gap-1.5 hover:bg-gray-100 py-1.5 px-3 rounded-lg transition"
            >
              <Heart size={16} className={isWishlist ? 'fill-airbnb text-airbnb' : ''} />
              <span className="underline">{isWishlist ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* 5 Photo Grid Gallery (Image 18) */}
        <div id="photos" className="relative rounded-3xl overflow-hidden mb-10 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 aspect-[1/1] md:aspect-[2/1] max-h-[480px]">
            <div className="md:col-span-2 h-full overflow-hidden">
              <img
                src={getListingImageUrl(photos[0], 1400)}
                alt={listing.title}
                onError={useImageFallback}
                className="w-full h-full object-cover hover:scale-105 transition duration-300 cursor-pointer"
                onClick={() => setIsPhotoModalOpen(true)}
              />
            </div>
            <div className="hidden md:grid col-span-2 grid-cols-2 gap-2 h-full">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="h-full overflow-hidden">
                  <img
                    src={getListingImageUrl(photos[idx] || photos[0], 900)}
                    alt={`${listing.title} ${idx}`}
                    onError={useImageFallback}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300 cursor-pointer"
                    onClick={() => setIsPhotoModalOpen(true)}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsPhotoModalOpen(true)}
            className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-gray-900 border border-gray-300 font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-2 shadow-md transition"
          >
            <Grid size={14} /> Show all photos
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Detail Column */}
          <div className="lg:col-span-2 space-y-8 divide-y divide-gray-200">
            
            {/* Overview */}
            <div className="pb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {listing.property_type} in {listing.city}, {listing.country}
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.bathrooms} bathrooms
              </p>
              <p className="text-xs font-semibold text-emerald-700 mt-2">Free cancellation</p>
            </div>

            {/* Feature Highlights (Image 14) */}
            <div className="pt-6 space-y-5">
              <div className="flex items-start gap-4">
                <Key size={22} className="text-airbnb shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Exceptional check-in experience</h4>
                  <p className="text-xs text-gray-500">Recent guests gave the check-in process a 5-star rating.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin size={22} className="text-airbnb shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Unbeatable location</h4>
                  <p className="text-xs text-gray-500">100% of guests in the past year gave this location a 5-star rating.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MessageSquare size={22} className="text-airbnb shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Exceptional host communication</h4>
                  <p className="text-xs text-gray-500">Recent guests gave the host a 5-star rating for communication.</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pt-6 space-y-3">
              <h3 className="text-lg font-bold text-gray-900">About this space</h3>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
              <p className="text-xs text-gray-700">{listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.bathrooms} bathrooms</p>
            </div>

            {/* Amenities Grid (Image 14) */}
            <div id="amenities" className="pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-4">
                {listing.amenities?.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 text-xs text-gray-800">
                    <Check size={16} className="text-airbnb" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dual Month Calendar Picker Section (Image 12) */}
            <div className="pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{nights} nights in {listing.city}</h3>
              <p className="text-xs text-gray-500 mb-6">{checkIn} - {checkOut}</p>

              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Check-in Date</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-3 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Checkout Date</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-3 text-xs font-semibold"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={() => { setCheckIn(''); setCheckOut(''); }} className="text-xs font-semibold text-gray-900 underline">Clear dates</button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Sticky Booking Box (Image 12, 14, 18) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              
              {/* Pink Banner */}
              <div className="bg-rose-50 border border-rose-200 text-airbnb p-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
                <span>🏷️ Prices include all fees</span>
              </div>

              {/* Booking Widget Box */}
              <div className="bg-white border border-gray-300 rounded-3xl p-6 shadow-xl space-y-6">
                
                <div className="border-b border-gray-100 pb-4">
                  <span className="text-2xl font-bold text-gray-900">₹{nightlySubtotal.toLocaleString()}</span>
                  <span className="text-xs text-gray-500 font-semibold"> for {nights} nights</span>
                  <p className="text-[11px] text-gray-500 mt-1">★ {listing.rating.toFixed(2)} · {listing.review_count} reviews</p>
                </div>

                <div className="border border-gray-300 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-2 border-b border-gray-300">
                    <div className="p-3 border-r border-gray-300">
                      <label className="text-[10px] uppercase font-bold text-gray-700 block">Check-in</label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="p-3">
                      <label className="text-[10px] uppercase font-bold text-gray-700 block">Checkout</label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3">
                    <label className="text-[10px] uppercase font-bold text-gray-700 block">Guests</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full text-xs font-semibold bg-transparent focus:outline-none"
                    >
                      {[...Array(listing.max_guests)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} guest{i + 1 > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-gray-100 p-2.5 rounded-xl text-center text-xs text-gray-600 font-semibold">
                  Free cancellation before 5 November
                </div>

                <button
                  onClick={handleReserveClick}
                  className="w-full bg-airbnb hover:bg-airbnb-dark text-white font-bold py-3.5 rounded-2xl shadow-md transition text-sm"
                >
                  Reserve
                </button>

                <p className="text-xs text-center text-gray-500 font-medium">You won't be charged yet</p>

                <div className="text-center">
                  <button className="text-xs text-gray-500 underline">Report this listing</button>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Giant Guest Favorite Rating Laurel Wreath Graphic Banner (Image 12) */}
        <div id="reviews" className="mt-16 py-12 border-t border-b border-gray-200 text-center space-y-4">
          <div className="flex items-center justify-center gap-4 text-gray-900">
            <span className="text-4xl">🌿</span>
            <span className="text-6xl font-extrabold tracking-tighter">5.0</span>
            <span className="text-4xl">🌿</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Guest favourite</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">One of the most loved homes on Airbnb based on ratings, reviews, and reliability</p>
        </div>

        {/* Detailed Category Rating Scores (Image 13) */}
        <div className="py-12 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-center">
            
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-900">Cleanliness</p>
              <p className="text-lg font-bold text-gray-900">5.0</p>
              <Spray size={20} className="mx-auto text-gray-700" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-900">Accuracy</p>
              <p className="text-lg font-bold text-gray-900">5.0</p>
              <CheckCircle size={20} className="mx-auto text-gray-700" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-900">Check-in</p>
              <p className="text-lg font-bold text-gray-900">5.0</p>
              <Key size={20} className="mx-auto text-gray-700" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-900">Communication</p>
              <p className="text-lg font-bold text-gray-900">5.0</p>
              <MessageSquare size={20} className="mx-auto text-gray-700" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-900">Location</p>
              <p className="text-lg font-bold text-gray-900">5.0</p>
              <MapPin size={20} className="mx-auto text-gray-700" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-900">Value</p>
              <p className="text-lg font-bold text-gray-900">4.8</p>
              <Tag size={20} className="mx-auto text-gray-700" />
            </div>

          </div>
        </div>

        {/* Reviews Grid */}
        <div className="py-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">{listing.review_count} Reviews</h3>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="border border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900 font-bold text-xs py-2.5 px-4 rounded-xl transition"
            >
              Write a review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((rev) => (
              <div key={rev.id} className="space-y-2">
                <div className="flex items-center gap-3">
                  {rev.user?.avatar ? (
                    <img src={rev.user.avatar} alt={rev.user.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="bg-gray-400 text-white rounded-full p-2"><UserIcon size={16} /></div>
                  )}
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">{rev.user?.name || 'Guest'}</h5>
                    <p className="text-[11px] text-gray-500">3 years on Airbnb · 1 week ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={i < Math.floor(rev.rating) ? 'fill-amber-500' : 'text-gray-300'} />
                  ))}
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* "Meet your host" Profile Card (Image 11) */}
        <div className="py-12 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Meet your host</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* Left Card Box */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-md text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={listing.host?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80'}
                  alt={listing.host?.name || 'Host'}
                  className="w-full h-full rounded-full object-cover border-2 border-white shadow-md"
                />
                <div className="absolute bottom-0 right-0 bg-airbnb text-white p-1 rounded-full border-2 border-white">
                  <Check size={12} />
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold text-gray-900">{listing.host?.name || 'Shivam'}</h4>
                <p className="text-xs text-gray-500 font-semibold">Host</p>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-gray-100 text-center">
                <div>
                  <p className="text-sm font-bold text-gray-900">6</p>
                  <p className="text-[10px] text-gray-500">Reviews</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">5.0 ★</p>
                  <p className="text-[10px] text-gray-500">Rating</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">1</p>
                  <p className="text-[10px] text-gray-500">Month hosting</p>
                </div>
              </div>

              <div className="space-y-2 text-left text-xs text-gray-700">
                <p className="flex items-center gap-2"><GraduationCap size={16} /> Where I went to school: Dps varanasi</p>
                <p className="flex items-center gap-2"><Briefcase size={16} /> My work: Business</p>
              </div>
            </div>

            {/* Right Details */}
            <div className="md:col-span-2 space-y-4 pt-2">
              <h4 className="text-base font-bold text-gray-900">Host details</h4>
              <p className="text-xs text-gray-700">Response rate: 100%</p>
              <p className="text-xs text-gray-700">Responds within an hour</p>

              <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs py-3 px-6 rounded-xl transition">
                Message host
              </button>

              <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 text-xs text-gray-600 flex items-start gap-3 mt-4">
                <Lock size={16} className="text-airbnb shrink-0 mt-0.5" />
                <p>To help protect your payment, always use Airbnb to send money and communicate with hosts.</p>
              </div>
            </div>

          </div>
        </div>

        {/* "Where you'll be" Map Section (Image 15) */}
        <div id="location" className="py-12 border-t border-gray-200 space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Where you'll be</h3>
          <p className="text-xs font-semibold text-gray-900">{listing.location}</p>
          <p className="text-xs text-gray-500">Explore the neighbourhood around this stay in {listing.city}, {listing.country}.</p>

          <div className="h-96 w-full rounded-3xl overflow-hidden border border-gray-200 relative">
            <MapView listings={[listing]} />
          </div>
        </div>

        {/* "Things to know" Section (Image 11, 20) */}
        <div className="py-12 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Things to know</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
            
            <div className="space-y-2">
              <p className="font-bold text-gray-900 flex items-center gap-2"><CalendarIcon size={16} /> Cancellation policy</p>
              <p className="text-gray-600 leading-relaxed">Free cancellation before 5 November. Cancel before check-in on 6 November for a partial refund.</p>
              <button className="font-semibold text-gray-900 underline">Learn more</button>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-gray-900 flex items-center gap-2"><Key size={16} /> House rules</p>
              <p className="text-gray-600">Check-in after 12:00 pm</p>
              <p className="text-gray-600">Checkout before 10:00 am</p>
              <p className="text-gray-600">{listing.max_guests} guests maximum</p>
              <button className="font-semibold text-gray-900 underline">Learn more</button>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-gray-900 flex items-center gap-2"><ShieldCheck size={16} /> Safety & property</p>
              <p className="text-gray-600">Carbon monoxide alarm not reported</p>
              <p className="text-gray-600">Smoke alarm not reported</p>
              <p className="text-gray-600">Exterior security cameras on property</p>
              <button className="font-semibold text-gray-900 underline">Learn more</button>
            </div>

          </div>
        </div>

        {/* "More stays nearby" Carousel (Image 20) */}
        <div className="py-12 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">More stays nearby</h3>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <span>1 / 2</span>
              <button className="p-2 border border-gray-300 rounded-full hover:border-black text-gray-700"><ChevronLeft size={14} /></button>
              <button className="p-2 border border-gray-300 rounded-full hover:border-black text-gray-700"><ChevronRight size={14} /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {nearbyListings.slice(0, 4).map((item) => (
              <Link key={item.id} href={`/listings/${item.id}`} className="space-y-2 group">
                <img src={getListingImageUrl(item.images[0], 800)} onError={useImageFallback} alt={item.title} className="w-full aspect-[4/3] rounded-2xl object-cover group-hover:scale-105 transition duration-200" />
                <h4 className="font-bold text-xs text-gray-900 truncate">{item.title}</h4>
                <p className="text-[11px] text-gray-500">₹{item.price_per_night.toLocaleString('en-IN')} per night · ★ {item.rating.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Regional Destinations Links Grid (Image 7) */}
        <div className="py-12 border-t border-gray-200">
          <h4 className="text-sm font-bold text-gray-900 mb-4">Explore other options in and around {listing.city}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            {REGIONAL_DESTINATIONS.map((dest) => (
              <div key={dest.name}>
                <p className="font-bold text-gray-900 hover:underline cursor-pointer">{dest.name}</p>
                <p className="text-[11px] text-gray-500">{dest.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Checkout Modal */}
      {isCheckoutModalOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/55 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white max-w-2xl w-full max-h-[92vh] rounded-3xl shadow-2xl overflow-y-auto border border-gray-100">
            <div className="sticky top-0 z-10 bg-white flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-7">
              <button onClick={() => setIsCheckoutModalOpen(false)} aria-label="Close checkout summary" className="p-2 -ml-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
              <h3 className="text-base font-bold text-gray-900">Confirm and pay</h3>
              <span className="w-9" />
            </div>
            <div className="grid md:grid-cols-[1.1fr_.9fr]">
              <div className="p-5 sm:p-7 space-y-5">
                <div className="flex items-center gap-3 rounded-2xl border border-gray-200 p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Lock size={16}/></span>
                  <div><p className="text-sm font-bold">Demo checkout</p><p className="mt-0.5 text-xs text-gray-500">Secure-looking preview · no real charge</p></div>
                </div>
                <section className="space-y-3">
                  <h4 className="text-lg font-bold">Payment details</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setPaymentMethod('card')} className={`rounded-xl border p-3 text-sm font-semibold ${paymentMethod === 'card' ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>▣ Credit or debit card</button>
                    <button type="button" onClick={() => setPaymentMethod('upi')} className={`rounded-xl border p-3 text-sm font-semibold ${paymentMethod === 'upi' ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>◉ UPI</button>
                  </div>
                  {paymentMethod === 'card' ? <div className="space-y-3">
                    <input aria-label="Cardholder name" placeholder="Name on card" autoComplete="cc-name" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm" />
                    <input aria-label="Card number" placeholder="1234  5678  9012  3456" inputMode="numeric" autoComplete="cc-number" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm" />
                    <div className="grid grid-cols-2 gap-3"><input aria-label="Expiry date" placeholder="MM / YY" autoComplete="cc-exp" className="min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-sm" /><input aria-label="Security code" placeholder="CVV" inputMode="numeric" autoComplete="cc-csc" className="min-w-0 rounded-xl border border-gray-300 px-4 py-3 text-sm" /></div>
                  </div> : <input aria-label="UPI ID" placeholder="yourname@bank" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm" />}
                  <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">This is a demo payment. No payment is processed and card or UPI details are never saved.</div>
                </section>
              </div>
              <div className="bg-gray-50 p-5 sm:p-7 md:border-l md:border-gray-200">
            <div className="space-y-4 text-xs">
              <div className="flex gap-4 items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <img src={getListingImageUrl(photos[0], 400)} onError={useImageFallback} alt={listing.title} className="w-16 h-16 rounded-xl object-cover" />
                <div>
                  <p className="font-bold text-gray-900 text-sm">{listing.title}</p>
                  <p className="text-gray-500">{listing.property_type} · {listing.city}</p>
                </div>
              </div>

              <div className="space-y-2 border-b border-gray-200 pb-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Dates:</span>
                  <span className="font-bold text-gray-900">{checkIn} to {checkOut} ({nights} nights)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Guests:</span>
                  <span className="font-bold text-gray-900">{guests} guest(s)</span>
                </div>
              </div>

              <div className="space-y-1 text-gray-600">
                <div className="flex justify-between"><span>Nightly total</span><span>₹{nightlySubtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Cleaning fee</span><span>₹{cleaningFee.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Service fee</span><span>₹{serviceFee.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-sm text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Due</span><span>₹{totalDue.toLocaleString()}</span>
                </div>
              </div>

            <button
              onClick={handleConfirmPayment}
              disabled={isSubmittingBooking}
              className="w-full bg-airbnb hover:bg-airbnb-dark text-white font-bold py-3.5 rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-xs"
            >
              {isSubmittingBooking ? 'Confirming demo payment…' : `Confirm demo payment · ₹${totalDue.toLocaleString('en-IN')}`}
            </button>
              </div>
            </div>
          </div>
          </div>
        </div>}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-6 space-y-4 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Leave a Review</h3>
              <button onClick={() => setIsReviewModalOpen(false)} aria-label="Close review form"><X size={18} /></button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setNewRating(star)} className="p-1 text-amber-500 hover:scale-110 transition">
                    <Star size={24} className={star <= newRating ? 'fill-amber-500' : 'text-gray-300'} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="How was your stay?"
                className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:outline-none focus:border-black"
              />
            </div>

            <button onClick={handleAddReview} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition text-xs">
              Post Review
            </button>
          </div>
        </div>
      )}

      {/* Full Photo Lightbox */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black text-white p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between sticky top-0 bg-black/80 py-4 backdrop-blur-md z-10">
              <span className="font-bold text-sm">{listing.title} Gallery</span>
              <button onClick={() => setIsPhotoModalOpen(false)} aria-label="Close photo gallery" className="p-2 bg-white/20 rounded-full hover:bg-white/40"><X size={20} /></button>
            </div>
            <div className="space-y-6">
              {photos.map((src, i) => (
                <img key={i} src={getListingImageUrl(src, 1400)} onError={useImageFallback} alt={`Photo ${i + 1}`} className="w-full rounded-2xl object-cover max-h-[80vh] mx-auto shadow-2xl" />
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
