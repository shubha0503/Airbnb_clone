'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import { User } from '@/types';
import { api, getCurrentUserId } from '@/services/api';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (localStorage.getItem('airbnb-auth-version') !== '2') {
      localStorage.removeItem('airbnb-user-id');
      localStorage.setItem('airbnb-auth-version', '2');
    }
    const loadCurrentUser = () => {
      const savedId = getCurrentUserId();
      if (!savedId) { setCurrentUser(null); return; }
      api.getUser(savedId).then(setCurrentUser).catch(() => {
        localStorage.removeItem('airbnb-user-id');
        setCurrentUser(null);
      });
    };
    loadCurrentUser();
    const syncUser = () => loadCurrentUser();
    window.addEventListener('airbnb-user-change', syncUser);
    return () => window.removeEventListener('airbnb-user-change', syncUser);
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Airbnb | Vacation Rentals, Cabins, Beach Houses & More</title>
        <meta name="description" content="Clone of Airbnb web app replicating search, booking workflows, and host dashboard." />
        <link rel="icon" href="https://a0.muscache.com/airbnb/static/logotype_favicon-21001e2d745439a5880f8b0076512317.ico" />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 font-sans antialiased">
        <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
        
        <Header
          currentUser={currentUser}
        />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
