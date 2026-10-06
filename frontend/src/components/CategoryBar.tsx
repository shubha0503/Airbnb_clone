'use client';

import React from 'react';
import { 
  Sparkles, 
  Waves, 
  Trees, 
  Building2, 
  Zap, 
  Compass, 
  Palmtree, 
  Sailboat, 
  Castle, 
  Home, 
  SlidersHorizontal 
} from 'lucide-react';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenFilter: () => void;
  activeFilterCount?: number;
}

const CATEGORIES = [
  { id: 'All', label: 'All homes', icon: Sparkles },
  { id: 'Villa', label: 'Villas', icon: Waves },
  { id: 'House', label: 'Houses', icon: Home },
  { id: 'Apartment', label: 'Apartments', icon: Building2 },
  { id: 'Cabin', label: 'Cabins', icon: Trees },
  { id: 'Cottage', label: 'Cottages', icon: Sailboat },
  { id: 'Guesthouse', label: 'Guesthouses', icon: Palmtree },
  { id: 'Heritage home', label: 'Heritage homes', icon: Castle },
  { id: 'Home', label: 'Homes', icon: Compass },
];

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  onOpenFilter,
  activeFilterCount = 0,
}) => {
  return (
    <div className="bg-white sticky top-[116px] md:top-[170px] z-30 border-b border-gray-200 py-3 shadow-xs">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
        
        {/* Horizontal Category List */}
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth py-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center gap-1.5 min-w-max pb-1 text-xs font-semibold cursor-pointer group border-b-2 transition-all duration-150 ${
                  isSelected
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon
                  size={24}
                  className={`transition duration-150 ${
                    isSelected ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'
                  }`}
                />
                <span className="whitespace-nowrap">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filters Trigger Button */}
        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
          <button
            onClick={onOpenFilter}
            className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-800 hover:border-gray-900 transition bg-white shadow-xs"
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-airbnb text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
