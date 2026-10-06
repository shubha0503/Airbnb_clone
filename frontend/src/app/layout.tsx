'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import { User } from '@/types';
import { api } from '@/services/api';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const savedId = Number(localStorage.getItem('airbnb-user-id')) || 4;
    api.getUser(savedId).catch(() => api.getAllUsers().then((users) => {
      if (users[0]) localStorage.setItem('airbnb-user-id', String(users[0].id));
      return users[0];
    })).then((user) => {
      if (user) setCurrentUser(user);
    }).catch(console.error);
    const syncUser = () => api.getUser(Number(localStorage.getItem('airbnb-user-id'))).then(setCurrentUser).catch(console.error);
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
          onUserSwitch={(newUser) => setCurrentUser(newUser)}
        />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
