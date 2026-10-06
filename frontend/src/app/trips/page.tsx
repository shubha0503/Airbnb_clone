'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Booking } from '@/types';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { getListingImageUrl, useImageFallback } from '@/lib/images';

export default function MyTripsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const userId = Number(localStorage.getItem('airbnb-user-id')) || 4;
      const data = await api.getUserTrips(userId);
      setBookings(data);
    } catch (err) {
      toast.error('Could not load your trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      fetchTrips();
    } catch (err: any) {
      toast.error(err.message || 'Could not cancel booking');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trips</h1>
        <p className="text-sm text-gray-500">Manage your past, current, and upcoming stay reservations.</p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl w-full" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-200">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No trips booked... yet!</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            Time to dust off your bags and start planning your next adventure.
          </p>
          <Link
            href="/"
            className="bg-airbnb hover:bg-airbnb-dark text-white font-bold py-3 px-6 rounded-xl transition text-xs inline-flex items-center gap-2"
          >
            Explore Airbnb <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const listing = booking.listing;
            const isConfirmed = booking.status === 'confirmed';

            return (
              <div
                key={booking.id}
                className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <img
                    src={getListingImageUrl(listing?.images?.[0], 500)}
                    alt={listing?.title || 'Listing'}
                    onError={useImageFallback}
                    className="w-24 h-24 rounded-2xl object-cover shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isConfirmed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {isConfirmed ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {booking.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">Ref: #{booking.id}</span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900">
                      {listing?.title || 'Stay Reservation'}
                    </h3>

                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <MapPin size={12} className="text-gray-400" />
                      {listing?.location || 'Location'}
                    </p>

                    <p className="text-xs font-semibold text-gray-800">
                      📅 {booking.check_in} → {booking.check_out} ({booking.guests} guest{booking.guests > 1 ? 's' : ''})
                    </p>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 gap-4">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-gray-500">Total Price</p>
                    <p className="text-lg font-bold text-gray-900">₹{booking.total_price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {listing?.id && (
                      <Link
                        href={`/listings/${listing.id}`}
                        className="text-xs font-bold text-gray-900 border border-gray-300 hover:border-gray-900 py-2 px-4 rounded-xl transition"
                      >
                        View Details
                      </Link>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-xs font-bold text-rose-600 hover:bg-rose-50 py-2 px-3 rounded-xl transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
