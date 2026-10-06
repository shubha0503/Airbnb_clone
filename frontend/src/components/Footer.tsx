'use client';

import React from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-16 text-xs text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Footer Grid Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-200">
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Support</h4>
            <ul className="space-y-2">
              <li>Help Center</li>
              <li>AirCover</li>
              <li>Anti-discrimination</li>
              <li>Disability support</li>
              <li>Cancellation options</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Hosting</h4>
            <ul className="space-y-2">
              <li><Link href="/host" className="hover:underline">Airbnb your home</Link></li>
              <li>AirCover for Hosts</li>
              <li>Hosting resources</li>
              <li>Community forum</li>
              <li>Hosting responsibly</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Airbnb</h4>
            <ul className="space-y-2">
              <li>Newsroom</li>
              <li>New features</li>
              <li>Careers</li>
              <li>Investors</li>
              <li>Gift cards</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Tech Stack</h4>
            <p className="text-gray-500 leading-relaxed">
              Fullstack Airbnb Clone built with Next.js 14 (TypeScript), Tailwind CSS, Python FastAPI, SQLAlchemy & SQLite.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span>© 2026 Airbnb Clone, Inc.</span>
            <span>·</span>
            <span>Privacy</span>
            <span>·</span>
            <span>Terms</span>
            <span>·</span>
            <span>Sitemap</span>
          </div>

          <div className="flex items-center gap-6 font-semibold text-gray-900">
            <span className="flex items-center gap-1.5">
              <Globe size={16} />
              <span>English (IN)</span>
            </span>
            <span>₹ INR</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
