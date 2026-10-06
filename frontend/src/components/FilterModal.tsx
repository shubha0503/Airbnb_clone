'use client';

import React, { useEffect, useState } from 'react';
import { 
  X, 
  Check, 
  Zap, 
  Key, 
  Dog, 
  Award, 
  Crown, 
  Utensils, 
  Car, 
  Shirt, 
  Plus, 
  Minus, 
  ChevronDown 
} from 'lucide-react';
import { SearchFilters } from '@/types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApplyFilters: (newFilters: SearchFilters) => void;
  onClearFilters: () => void;
  listingCount?: number;
}

const RECOMMENDED_CARDS = [
  { id: 'Kitchen', label: 'Kitchen', icon: Utensils, color: 'text-amber-500 bg-amber-50' },
  { id: 'Free parking', label: 'Free parking', icon: Car, color: 'text-emerald-500 bg-emerald-50' },
  { id: 'Washer', label: 'Washer', icon: Shirt, color: 'text-sky-500 bg-sky-50' },
  { id: 'Pet friendly', label: 'Pet friendly', icon: Dog, color: 'text-amber-700 bg-amber-100' },
];

const PROPERTY_TYPES = [
  { id: 'Any type', label: 'Any type' },
  { id: 'House', label: 'House' },
  { id: 'Apartment', label: 'Apartment' },
  { id: 'Villa', label: 'Villa' },
  { id: 'Cabin', label: 'Cabin' },
  { id: 'Cottage', label: 'Cottage' },
  { id: 'Guesthouse', label: 'Guesthouse' },
  { id: 'Heritage home', label: 'Heritage home' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onClearFilters,
  listingCount = 701,
}) => {
  const [minPrice, setMinPrice] = useState<number | undefined>(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(filters.maxPrice);
  const [propertyType, setPropertyType] = useState<string>(filters.propertyType || 'Any type');
  const [roomType, setRoomType] = useState<string>(filters.roomType || 'Any type');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(filters.amenities || []);
  
  // Steppers
  const [bedrooms, setBedrooms] = useState<number | 'Any'>(filters.bedrooms ?? 'Any');
  const [beds, setBeds] = useState<number | 'Any'>(filters.beds ?? 'Any');

  // Booking options
  const [instantBook, setInstantBook] = useState(filters.instantBook ?? false);
  const [selfCheckIn, setSelfCheckIn] = useState(filters.selfCheckIn ?? false);
  const [allowsPets, setAllowsPets] = useState(filters.allowsPets ?? false);

  // Standout stays
  const [isGuestFavourite, setIsGuestFavourite] = useState(filters.guestFavourite ?? false);
  const [isLuxe, setIsLuxe] = useState(filters.luxe ?? false);

  useEffect(() => {
    if (!isOpen) return;
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
    setPropertyType(filters.propertyType || 'Any type');
    setRoomType(filters.roomType || 'Any type');
    setSelectedAmenities(filters.amenities || []);
    setBedrooms(filters.bedrooms ?? 'Any');
    setBeds(filters.beds ?? 'Any');
    setInstantBook(filters.instantBook ?? false);
    setSelfCheckIn(filters.selfCheckIn ?? false);
    setAllowsPets(filters.allowsPets ?? false);
    setIsGuestFavourite(filters.guestFavourite ?? false);
    setIsLuxe(filters.luxe ?? false);
  }, [isOpen, filters]);

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleApply = () => {
    onApplyFilters({
      ...filters,
      minPrice,
      maxPrice,
      propertyType: propertyType !== 'Any type' ? propertyType : undefined,
      roomType: roomType !== 'Any type' ? roomType : undefined,
      instantBook,
      selfCheckIn,
      allowsPets,
      guestFavourite: isGuestFavourite,
      luxe: isLuxe,
      bedrooms: typeof bedrooms === 'number' ? bedrooms : undefined,
      beds: typeof beds === 'number' ? beds : undefined,
      amenities: selectedAmenities,
    });
    onClose();
  };

  // Mock price distribution histogram bars (Image 2)
  const histogramHeights = [15, 30, 45, 80, 60, 40, 55, 70, 90, 65, 50, 40, 35, 25, 40, 50, 60, 30, 20, 15, 10, 5];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <button onClick={onClose} aria-label="Close filters" className="p-2 rounded-full hover:bg-gray-100 transition">
            <X size={18} />
          </button>
          <h2 className="text-base font-bold text-gray-900">Filters</h2>
          <div className="w-8" />
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-8 divide-y divide-gray-200">
          
          {/* Recommended for you (Image 3) */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended for you</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {RECOMMENDED_CARDS.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedAmenities.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleAmenity(item.id)}
                    className={`border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition ${
                      isSelected
                        ? 'border-gray-900 bg-gray-50 ring-1 ring-black'
                        : 'border-gray-200 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <div className={`p-3 rounded-2xl ${item.color}`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-xs font-semibold text-gray-800">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Room type</h3>
            <div className="flex flex-wrap gap-2">
              {['Any type', 'Entire place', 'Private room', 'Shared room'].map((type) => <button key={type} type="button" aria-pressed={roomType === type} onClick={() => setRoomType(type)} className={`rounded-full border px-4 py-2.5 text-xs font-semibold ${roomType === type ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-700 hover:border-gray-900'}`}>{type}</button>)}
            </div>
          </div>

          {/* Type of place (Image 3) */}
          <div className="pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Type of place</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-gray-100 p-1 rounded-2xl border border-gray-200">
              {PROPERTY_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPropertyType(t.id)}
                  className={`py-3 px-2 text-xs font-bold rounded-xl transition ${
                    propertyType === t.id
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Histogram (Image 2) */}
          <div className="pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Price range</h3>
            <p className="text-xs text-gray-500 mb-6">Trip price, includes all fees</p>
            
            {/* Histogram Graphic */}
            <div className="h-20 flex items-end justify-between gap-1 px-4 mb-4">
              {histogramHeights.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-airbnb rounded-t-xs opacity-85 hover:opacity-100 transition"
                />
              ))}
            </div>

            {/* Price Range Inputs */}
            <div className="flex items-center gap-4">
              <div className="flex-1 border border-gray-300 rounded-2xl p-3 focus-within:border-black">
                <label className="text-[10px] text-gray-500 font-semibold block uppercase">Minimum</label>
                <div className="flex items-center">
                  <span className="text-sm font-semibold mr-1">₹</span>
                  <input
                    type="number"
                    value={minPrice || ''}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="4800"
                    className="w-full text-sm font-semibold focus:outline-none"
                  />
                </div>
              </div>
              <span className="text-gray-400 font-bold">-</span>
              <div className="flex-1 border border-gray-300 rounded-2xl p-3 focus-within:border-black">
                <label className="text-[10px] text-gray-500 font-semibold block uppercase">Maximum</label>
                <div className="flex items-center">
                  <span className="text-sm font-semibold mr-1">₹</span>
                  <input
                    type="number"
                    value={maxPrice || ''}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="40000+"
                    className="w-full text-sm font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rooms and Beds Stepper (Image 2) */}
          <div className="pt-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Rooms and beds</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">Bedrooms</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setBedrooms(typeof bedrooms === 'number' && bedrooms > 1 ? bedrooms - 1 : 'Any')}
                  className="p-2 rounded-full border border-gray-300 hover:border-black text-gray-600 transition"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-bold w-10 text-center">{bedrooms}</span>
                <button
                  onClick={() => setBedrooms(typeof bedrooms === 'number' ? bedrooms + 1 : 1)}
                  className="p-2 rounded-full border border-gray-300 hover:border-black text-gray-600 transition"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">Beds</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setBeds(typeof beds === 'number' && beds > 1 ? beds - 1 : 'Any')}
                  className="p-2 rounded-full border border-gray-300 hover:border-black text-gray-600 transition"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-bold w-10 text-center">{beds}</span>
                <button
                  onClick={() => setBeds(typeof beds === 'number' ? beds + 1 : 1)}
                  className="p-2 rounded-full border border-gray-300 hover:border-black text-gray-600 transition"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Booking Options (Image 1) */}
          <div className="pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Booking options</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setInstantBook(!instantBook)}
                className={`flex items-center gap-2 border rounded-full px-5 py-3 text-xs font-semibold transition ${
                  instantBook ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-800 hover:border-gray-900'
                }`}
              >
                <Zap size={16} /> Instant Book
              </button>

              <button
                onClick={() => setSelfCheckIn(!selfCheckIn)}
                className={`flex items-center gap-2 border rounded-full px-5 py-3 text-xs font-semibold transition ${
                  selfCheckIn ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-800 hover:border-gray-900'
                }`}
              >
                <Key size={16} /> Self check-in
              </button>

              <button
                onClick={() => setAllowsPets(!allowsPets)}
                className={`flex items-center gap-2 border rounded-full px-5 py-3 text-xs font-semibold transition ${
                  allowsPets ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-800 hover:border-gray-900'
                }`}
              >
                <Dog size={16} /> Allows pets
              </button>
            </div>
          </div>

          {/* Standout Stays (Image 1) */}
          <div className="pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Standout stays</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <button
                onClick={() => setIsGuestFavourite(!isGuestFavourite)}
                className={`border rounded-2xl p-4 flex items-start gap-4 text-left transition ${
                  isGuestFavourite ? 'border-gray-900 bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="p-3 bg-rose-50 text-airbnb rounded-2xl"><Award size={24} /></div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Guest favourite</h4>
                  <p className="text-xs text-gray-500 mt-1">The most loved homes on Airbnb</p>
                </div>
              </button>

              <button
                onClick={() => setIsLuxe(!isLuxe)}
                className={`border rounded-2xl p-4 flex items-start gap-4 text-left transition ${
                  isLuxe ? 'border-gray-900 bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Crown size={24} /></div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Luxe</h4>
                  <p className="text-xs text-gray-500 mt-1">Luxury homes with elevated design</p>
                </div>
              </button>

            </div>
          </div>

        </div>

        {/* Footer Actions (Image 1) */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
          <button
            onClick={() => {
              setMinPrice(undefined);
              setMaxPrice(undefined);
              setPropertyType('Any type');
              setRoomType('Any type');
              setSelectedAmenities([]);
              setBedrooms('Any');
              setBeds('Any');
              setInstantBook(false);
              setSelfCheckIn(false);
              setAllowsPets(false);
              setIsGuestFavourite(false);
              setIsLuxe(false);
              setRoomType('Any type');
              onClearFilters();
            }}
            className="text-sm font-semibold text-gray-900 underline hover:bg-gray-100 py-2 px-3 rounded-lg transition"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="bg-gray-900 hover:bg-black text-white text-sm font-bold py-3 px-6 rounded-xl transition shadow-md"
          >
            Show {listingCount} places
          </button>
        </div>

      </div>
    </div>
  );
};
