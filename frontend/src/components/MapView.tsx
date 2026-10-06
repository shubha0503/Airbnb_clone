'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Listing } from '@/types';

const LeafletMap = dynamic(() => import('./LeafletMapInternal'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[380px] bg-gray-100 rounded-3xl flex items-center justify-center text-gray-500 font-medium animate-pulse">
      Loading Airbnb Map...
    </div>
  ),
});

interface MapViewProps {
  listings: Listing[];
}

export const MapView: React.FC<MapViewProps> = ({ listings }) => {
  return <LeafletMap listings={listings} />;
};
