'use client';

import React, { useState, useEffect } from 'react';
import { ListingCard } from '@/components/ListingCard';
import { Wishlist } from '@/types';
import { api } from '@/services/api';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const userId = Number(localStorage.getItem('airbnb-user-id')) || 4;
      const data = await api.getWishlist(userId);
      setWishlists(data);
    } catch (err) {
      toast.error('Could not load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleToggleWishlist = async (listingId: number) => {
    try {
      const userId = Number(localStorage.getItem('airbnb-user-id')) || 4;
      await api.toggleWishlist(userId, listingId);
      toast.success('Wishlist updated');
      fetchWishlist();
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Wishlists</h1>
        <p className="text-sm text-gray-500">Your saved dream stays and saved property listings.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-2xl w-full" />
          ))}
        </div>
      ) : wishlists.length === 0 ? (
        <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-200">
          <Heart size={48} className="mx-auto text-gray-400 mb-4 stroke-1" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            As you search, tap the heart icon on any stay to save your favorite spots.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlists.map((w) => (
            <ListingCard
              key={w.id}
              listing={w.listing}
              isFavorite={true}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
