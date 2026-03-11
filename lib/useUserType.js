'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Hook to check user type per USER_MODEL.md:
 * - isMember: signed-in user
 * - isNonMember: not signed in
 * - user: Firebase user or null
 */
export function useUserType() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return {
    user,
    isMember: !!user,
    isNonMember: !user,
    loading,
  };
}
