'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Admin layout: protects all /admin/* routes.
 * Requires Member (signed in) with Admin role (users/{uid}.role === 'admin').
 * Non-members and non-admin Members are redirected to home.
 */
export default function AdminLayout({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus('denied');
        router.replace('/');
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/admin/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.isAdmin) {
          setStatus('allowed');
        } else {
          setStatus('denied');
          router.replace('/');
        }
      } catch {
        setStatus('denied');
        router.replace('/');
      }
    });
    return () => unsub();
  }, [router]);

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (status !== 'allowed') {
    return null; // Redirect is in progress
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/admin" className="text-lg font-semibold text-gray-900">
              Admin
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to app
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
