'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [inputVal, setInputVal] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      toast.error('Enter your email address');
      return;
    }
    setIsSubmitting(true);
    try {
      const user = await (await import('@/services/api')).api.login({ email: inputVal.trim(), password });
      localStorage.setItem('airbnb-user-id', String(user.id));
      window.dispatchEvent(new Event('airbnb-user-change'));
      toast.success(`Welcome, ${user.name}`);
      onLoginSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load demo accounts');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6 border border-gray-100 relative">
        
        {/* Header with Close & Airbnb Red Logo */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <button onClick={onClose} aria-label="Close login" className="p-1.5 rounded-full hover:bg-gray-100 transition">
            <X size={18} />
          </button>
          <div className="w-8" />
        </div>

        <div className="text-center space-y-3">
          <svg className="h-10 w-auto text-airbnb mx-auto" viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.011.315c0 4.008-3.261 7.806-7.5 7.806-2.585 0-4.84-1.353-6.529-3.535l-.471-.628-.471.628c-1.688 2.182-3.944 3.535-6.529 3.535-4.239 0-7.5-3.798-7.5-7.806 0-1.074.256-2.097.896-3.578l.22-.486c.974-2.26 5.148-10.993 7.106-14.85l.527-1.011C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.282.607-3.374 2.584l-.442.852c-1.921 3.774-6.027 12.383-6.993 14.631l-.206.455c-.562 1.302-.785 2.133-.785 2.978 0 3.013 2.378 5.806 5.5 5.806 2.062 0 3.935-1.127 5.4-3.153l.9-1.246.9 1.246c1.465 2.026 3.338 3.153 5.4 3.153 3.122 0 5.5-2.793 5.5-5.806 0-.74-.184-1.5-.678-2.73l-.134-.326c-.958-2.215-5.061-10.821-6.988-14.593l-.447-.859C18.282 3.607 17.239 3 16 3zm0 11c1.933 0 3.5 1.567 3.5 3.5 0 2.21-2.01 4.5-3.5 5.864C14.51 22 12.5 19.71 12.5 17.5c0-1.933 1.567-3.5 3.5-3.5zm0 2c-.828 0-1.5.672-1.5 1.5 0 .973.996 2.368 1.5 3.01.504-.642 1.5-2.037 1.5-3.01 0-.828-.672-1.5-1.5-1.5z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900">Log in or sign up</h3>
          <p className="text-xs text-gray-500">Use your account email and password to continue.</p>
        </div>

        <form onSubmit={handleContinue} className="space-y-4">
          <input
            type="email"
            required
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Email address"
            className="w-full border border-gray-300 rounded-xl p-3.5 text-xs font-semibold focus:outline-none focus:border-black"
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-gray-300 rounded-xl p-3.5 text-xs font-semibold focus:outline-none focus:border-black"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-airbnb hover:bg-airbnb-dark disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-md transition text-xs"
          >
            {isSubmitting ? 'Logging in…' : 'Continue'}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400">New to Airbnb?</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/register" onClick={onClose} className="text-xs font-semibold text-gray-900 underline">Create an account</Link>
          <button type="button" onClick={onClose} className="text-xs font-semibold text-gray-600 underline">Browse listings</button>
          {/* Social sign-in is not configured by this backend. */}
          {/*
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          */}
          {/*
            <svg className="w-5 h-5 fill-gray-900" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-1 2.97 1.08.08 2.16-.57 2.81-1.37z" />
            </svg>
          */}
        </div>

      </div>
    </div>
  );
};
