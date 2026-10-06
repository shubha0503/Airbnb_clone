'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { Listing } from '@/types';
import { Star } from 'lucide-react';
import { getListingImageUrl, useImageFallback } from '@/lib/images';

interface LeafletMapProps {
  listings: Listing[];
}

export const LeafletMapInternal: React.FC<LeafletMapProps> = ({ listings }) => {
  if (!listings || listings.length === 0) return null;

  const defaultCenter: [number, number] = [
    listings[0]?.latitude || 34.0259,
    listings[0]?.longitude || -118.7798,
  ];

  return (
    <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden shadow-inner border border-gray-200 z-0">
      <MapContainer
        center={defaultCenter}
        zoom={listings.length === 1 ? 13 : 8}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '380px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {listings.map((listing) => {
          const customPinIcon = L.divIcon({
            className: 'custom-map-pin-container',
            html: `<div class="custom-map-pin">₹${listing.price_per_night.toLocaleString('en-IN')}</div>`,
            iconSize: [60, 30],
            iconAnchor: [30, 15],
          });

          return (
            <Marker
              key={listing.id}
              position={[listing.latitude, listing.longitude]}
              icon={customPinIcon}
            >
              <Popup>
                <div className="flex flex-col gap-2 p-1">
                  <img
                    src={getListingImageUrl(listing.images[0], 600)}
                    alt={listing.title}
                    onError={useImageFallback}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                    <span className="truncate max-w-[150px]">{listing.city}, {listing.country}</span>
                    <span className="flex items-center gap-1"><Star size={10} className="fill-black" /> {listing.rating.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{listing.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-xs text-gray-900">₹{listing.price_per_night.toLocaleString('en-IN')} / night</span>
                    <Link
                      href={`/listings/${listing.id}`}
                      className="bg-airbnb text-white text-[10px] font-bold px-2.5 py-1 rounded-md hover:bg-airbnb-dark transition"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LeafletMapInternal;
