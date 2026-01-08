'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { auth } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { db } from '../../../lib/firebase';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

export default function MyPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [usageRemaining, setUsageRemaining] = useState(null);
  const [saved, setSaved] = useState([]);
  const [savedLoading, setSavedLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const loadPlan = async () => {
      if (!user) {
        setPlan(null);
        setPlanLoading(false);
        return;
      }
      setPlanLoading(true);
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          // Seed a default plan for new users
          await setDoc(ref, {
            plan: 'free',
            createdAt: serverTimestamp(),
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            email: user.email || '',
          }, { merge: true });
          setPlan('free');
        } else {
          setPlan(snap.data()?.plan || 'free');
        }
      } catch {
        setPlan('free');
      } finally {
        setPlanLoading(false);
      }
    };
    loadPlan();
  }, [user]);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) {
        setUsageRemaining(null);
        return;
      }
      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/usage', {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsageRemaining(data.remaining);
        }
      } catch {
        setUsageRemaining(null);
      }
    };
    fetchUsage();
  }, [user]);

  useEffect(() => {
    const fetchSaved = async () => {
      if (!user) {
        setSaved([]);
        setSavedLoading(false);
        return;
      }
      setSavedLoading(true);
      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/saved-recipes', {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSaved(Array.isArray(data.items) ? data.items : []);
        } else {
          setSaved([]);
        }
      } catch {
        setSaved([]);
      } finally {
        setSavedLoading(false);
      }
    };
    fetchSaved();
  }, [user]);

  const handleRemoveSaved = async (id) => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/saved-recipes?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (res.ok) {
        setSaved(cur => cur.filter(r => String(r.recipeId || r.id) !== String(id)));
      }
    } catch {}
  };

  // Gate: only show when logged in
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F4F2] flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F4F2] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 text-center border">
          <h2 className="text-xl font-bold mb-2">Sign in required</h2>
          <p className="text-gray-600 mb-4">My Page is only available to signed-in users.</p>
          <a
            href="/"
            className="inline-block px-4 py-2 rounded-full bg-[var(--primary)] text-white font-semibold hover:bg-[var(--accent)] transition"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }} className="min-h-screen bg-[#F8F4F2]">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="pt-40 relative transition-all duration-300e-in-out">
        <Sidebar open={sidebarOpen} />
        <main className="transition-all duration-300e-in-out flex flex-col items-center justify-start min-h-calc(100h-5rem)]">
          <div className="container mx-auto mt-10 p-6 sm:p-8 md:p-12 bg-white/80 rounded-3xl shadow-lg w-full max-w-2xl">
            <h1 className="text-3xl font-extrabold italic text-[#B48C8C] mb-6">My Page</h1>
            <div className="flex items-center gap-4 mb-6">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="avatar" className="w-14 h-14 rounded-full border" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                  {user.displayName?.[0] || user.email?.[0] || 'U'}
                </div>
              )}
              <div>
                <div className="text-lg font-semibold">{user.displayName || user.email}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4 mb-4">
              <div className="text-sm text-gray-500 mb-1">Current plan</div>
              <div className="text-xl font-bold">
                {planLoading ? 'Loading...' : plan === 'member' ? 'Member (Unlimited searches)' : 'Free (2 per day)'}
              </div>
              {plan !== 'member' && (
                <div className="mt-2 text-sm text-gray-600">
                  Remaining searches today: {usageRemaining == null ? '—' : `${usageRemaining}/2`}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border p-4 mb-4">
              <div className="text-sm text-gray-500 mb-2">Quick links</div>
              <div className="flex gap-2 flex-wrap">
                <a href="/what-can-i-cook" className="px-3 py-2 rounded-lg bg-[var(--primary)] text-white text-sm hover:bg-[var(--accent)] transition">
                  Recipe Discovery
                </a>
                <a href="/meal-planner" className="px-3 py-2 rounded-lg bg-[var(--primary)] text-white text-sm hover:bg-[var(--accent)] transition">
                  Meal Planner
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4">
              <div className="text-sm text-gray-500 mb-3">Saved recipes</div>
              {savedLoading ? (
                <div className="text-gray-500 text-sm">Loading...</div>
              ) : saved.length === 0 ? (
                <div className="text-gray-500 text-sm">No saved recipes yet.</div>
              ) : (
                <ul className="space-y-3">
                  {saved.map(item => (
                    <li key={String(item.recipeId || item.id)} className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image || '/images/logo.png'} alt={item.title} className="w-14 h-14 rounded object-cover border" />
                      <div className="flex-1">
                        <div className="font-semibold">{item.title}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveSaved(item.recipeId || item.id)}
                        className="px-3 py-1 rounded text-xs bg-white text-[var(--primary)] border border-[var(--primary)] hover:bg-[var(--primary-light)] transition"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


