'use client';

import React from 'react';
import { X } from 'lucide-react';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const PromoModal: React.FC<PromoModalProps> = ({ isOpen, onClose, onOpenAuth }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden text-center p-8 space-y-6 relative border border-gray-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close offer"
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
        >
          <X size={18} />
        </button>

        {/* 3D Villa Illustration */}
        <div className="pt-2">
          <img
            src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80"
            alt="Promo Villa"
            className="w-48 h-48 mx-auto rounded-3xl object-cover shadow-xl border-4 border-white transform hover:scale-105 transition"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">Take 10% off your next stay</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
            For new guests in selected countries only.{' '}
            <span className="underline font-semibold">Terms apply</span>
          </p>
        </div>

        <button
          onClick={() => {
            onClose();
            onOpenAuth();
          }}
          className="w-full bg-airbnb hover:bg-airbnb-dark text-white font-bold py-3.5 rounded-2xl shadow-lg transition text-xs tracking-wide"
        >
          Log in to claim offer
        </button>

      </div>
    </div>
  );
};
