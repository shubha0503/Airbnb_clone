'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Star, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { Listing } from '@/types';
import { FALLBACK_STAY_IMAGE, getListingImageUrl, useImageFallback } from '@/lib/images';

interface ListingCardProps {
  listing: Listing;
  isFavorite?: boolean;
  onToggleWishlist?: (listingId: number) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorite = false,
  onToggleWishlist,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : [FALLBACK_STAY_IMAGE];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) onToggleWishlist(listing.id);
  };

  return (
    <div className="group flex flex-col gap-2 cursor-pointer relative">
      
      {/* Image Carousel Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-200 shadow-xs">
        <Link href={`/listings/${listing.id}`} aria-label={`Open ${listing.title}`} className="absolute inset-0 z-0 block">
          <img
            src={getListingImageUrl(images[currentImageIndex], 900)}
            alt={listing.title}
            onError={useImageFallback}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleHeartClick}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:scale-110 active:scale-95 transition z-10"
        >
          <Heart
            size={22}
            className={`${
              isFavorite
                ? 'fill-airbnb text-airbnb'
                : 'fill-black/40 text-white stroke-[2]'
            } drop-shadow-md transition-colors`}
          />
        </button>

        {/* Guest Favourite Badge (Image 4, 5, 20) */}
        {listing.rating >= 4.8 && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-gray-900 shadow-md border border-gray-200 z-10">
            <Award size={14} className="text-airbnb" />
            <span>Guest favourite</span>
          </div>
        )}

        {/* Carousel Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronRight size={16} />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {images.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Listing Content Details */}
      <Link href={`/listings/${listing.id}`} className="flex flex-col gap-1 text-sm pt-1">
        <div className="flex items-center justify-between font-semibold text-gray-900">
          <h3 className="truncate max-w-[210px] font-bold">{listing.title}</h3>
          <div className="flex items-center gap-1 font-normal text-xs text-gray-900 shrink-0">
            <Star size={12} className="fill-gray-900 text-gray-900" />
            <span className="font-semibold">{listing.rating.toFixed(2)}</span>
            {listing.review_count > 0 && (
              <span className="text-gray-500">({listing.review_count})</span>
            )}
          </div>
        </div>

        <p className="text-gray-500 text-xs truncate">{listing.city}, {listing.country}</p>
        <p className="text-gray-500 text-xs">{listing.bedrooms} bed{listing.bedrooms > 1 ? 's' : ''} · {listing.bathrooms} bathroom</p>
        
        <div className="mt-1 flex items-baseline gap-1 text-gray-900">
          <span className="font-bold text-sm">₹{listing.price_per_night.toLocaleString()}</span>
          <span className="text-xs text-gray-600 font-normal">night</span>
        </div>

        <p className="text-[11px] text-gray-500 underline font-normal mt-0.5">Free cancellation</p>
      </Link>

    </div>
  );
};
