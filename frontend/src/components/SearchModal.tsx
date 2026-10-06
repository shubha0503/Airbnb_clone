'use client';

import React, { useState } from 'react';
import { Search, MapPin, X, Plus, Minus, Calendar } from 'lucide-react';
import { SearchFilters } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

const DESTINATION_SUGGESTIONS = [
  { name: 'Malibu, California', query: 'Malibu' },
  { name: 'Paris, France', query: 'Paris' },
  { name: 'Santorini, Greece', query: 'Santorini' },
  { name: 'Kyoto, Japan', query: 'Kyoto' },
  { name: 'Grindelwald, Switzerland', query: 'Grindelwald' },
  { name: 'New York, United States', query: 'New York' },
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  initialFilters,
}) => {
  if (!isOpen) return null;

  const [location, setLocation] = useState(initialFilters?.location || '');
  const [checkIn, setCheckIn] = useState(initialFilters?.checkIn || '');
  const [checkOut, setCheckOut] = useState(initialFilters?.checkOut || '');
  const [guests, setGuests] = useState(initialFilters?.guests || 1);
  const [activeTab, setActiveTab] = useState<'where' | 'dates' | 'who'>('where');

  const handleSearchSubmit = () => {
    onSearch({
      location: location.trim() || undefined,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests: guests > 0 ? guests : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/40 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white max-w-4xl w-full mx-auto rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-gray-200">
          <div className="flex items-center gap-6 text-sm font-bold">
            <span className="text-gray-900 border-b-2 border-gray-900 pb-1">Stays</span>
            <span className="text-gray-400 cursor-not-allowed">Experiences (Coming Soon)</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector Bar */}
        <div className="p-4 bg-gray-100/70 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white p-2 rounded-full shadow-inner border border-gray-200">
            
            {/* Where */}
            <button
              onClick={() => setActiveTab('where')}
              className={`p-3 rounded-full text-left px-5 transition ${
                activeTab === 'where' ? 'bg-white shadow-md' : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Where</span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search destinations"
                className="w-full text-xs font-semibold text-gray-900 bg-transparent focus:outline-none placeholder-gray-400"
              />
            </button>

            {/* Dates */}
            <button
              onClick={() => setActiveTab('dates')}
              className={`p-3 rounded-full text-left px-5 transition ${
                activeTab === 'dates' ? 'bg-white shadow-md' : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-gray-500 block">When</span>
              <span className="text-xs font-semibold text-gray-900 block truncate">
                {checkIn && checkOut ? `${checkIn} to ${checkOut}` : 'Add dates'}
              </span>
            </button>

            {/* Guests */}
            <div
              onClick={() => setActiveTab('who')}
              className={`p-2 rounded-full text-left px-5 flex items-center justify-between transition cursor-pointer ${
                activeTab === 'who' ? 'bg-white shadow-md' : 'hover:bg-gray-50'
              }`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Who</span>
                <span className="text-xs font-semibold text-gray-900">{guests} guest{guests > 1 ? 's' : ''}</span>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSearchSubmit();
                }}
                className="bg-airbnb hover:bg-airbnb-dark text-white p-3 rounded-full flex items-center gap-2 font-bold text-xs shadow-md transition transform active:scale-95"
              >
                <Search size={16} className="stroke-[3]" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

          </div>
        </div>

        {/* Tab Content Box */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          
          {/* Where Tab Suggestions */}
          {activeTab === 'where' && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Popular Destinations</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DESTINATION_SUGGESTIONS.map((dest) => (
                  <button
                    key={dest.query}
                    onClick={() => {
                      setLocation(dest.query);
                      setActiveTab('dates');
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200 hover:border-gray-900 hover:bg-gray-50 text-left transition"
                  >
                    <div className="bg-gray-100 p-2.5 rounded-xl text-gray-700">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{dest.name}</p>
                      <p className="text-xs text-gray-500">Popular travel hub</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dates Tab */}
          {activeTab === 'dates' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Stay Dates</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Check-in Date</label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-xl p-3">
                    <Calendar size={18} className="text-gray-400" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Check-out Date</label>
                  <div className="flex items-center gap-2 border border-gray-300 rounded-xl p-3">
                    <Calendar size={18} className="text-gray-400" />
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guests Tab */}
          {activeTab === 'who' && (
            <div className="space-y-6 max-w-md">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">Guests</p>
                  <p className="text-xs text-gray-500">Ages 13 or above</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    disabled={guests <= 1}
                    className="p-2 rounded-full border border-gray-300 disabled:opacity-40 hover:border-gray-900 transition"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold w-4 text-center">{guests}</span>
                  <button
                    onClick={() => setGuests(guests + 1)}
                    className="p-2 rounded-full border border-gray-300 hover:border-gray-900 transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
