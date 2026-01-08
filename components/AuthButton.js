'use client';

import { useEffect, useState } from 'react';
import { auth, GoogleAuthProvider, signInWithPopup, signOut } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

export default function AuthButton() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (loading) {
    return <div className="text-xs text-white/80">...</div>;
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        className="px-3 py-1 rounded-lg text-xs font-semibold bg-white text-[var(--primary)] hover:bg-gray-100 transition"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/my" className="hidden sm:inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-white/10 text-white border border-white/30 hover:bg-white/20 transition">
        My Page
      </Link>
      <span className="text-xs text-white/90 max-w-[120px] truncate">{user.displayName || user.email}</span>
      <button
        onClick={handleSignOut}
        className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/10 text-white border border-white/30 hover:bg-white/20 transition"
      >
        Sign out
      </button>
    </div>
  );
}


