'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiMenu, HiX } from 'react-icons/hi';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

/**
 * Responsive top navigation bar that collapses to a hamburger menu on mobile.
 * Mirrors header scroll behavior and highlights the active route.
 */
export default function Sidebar({ open }) {
  const [visible, setVisible] = useState(open);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  // Animate in/out
  useEffect(() => {
    if (open) setVisible(true);
    else {
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  // Scroll detection (same as header)
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auth state for conditional My Page link
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  if (!visible) return null;

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <nav
      className={`
        fixed top-28 w-full px-6 space-y-0
        transition-all duration-300 ease-in-out
        z-40 ${open ? 'opacity-100' : 'opacity-0'}
        bg-transparent md:bg-transparent
      `}
      style={{
        backgroundColor: scrolled ? 'var(--primary)' : 'transparent',
        color: scrolled ? 'var(--text-light)' : '#B48C8C',
      }}
    >
      {/* Hamburger for mobile */}
      <div className="flex md:hidden justify-end items-center w-full">
        <button
          onClick={() => setMobileMenuOpen(v => !v)}
          className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          aria-label="Open navigation menu"
        >
          {mobileMenuOpen ? <HiX size={28} /> : <HiMenu size={28} />}
        </button>
      </div>
      {/* Nav links */}
      <ul
        className={`
          ${mobileMenuOpen ? 'flex' : 'hidden'}
          flex-col md:flex md:flex-row md:justify-center md:items-center md:space-x-12
          mt-2 md:mt-0
          bg-white md:bg-transparent
          rounded-2xl md:rounded-none
          shadow-lg md:shadow-none
          p-6 md:p-0
          absolute md:static left-0 right-0 top-14 md:top-0 z-50
        `}
      >
        <li>
          <Link
            href="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base italic transition-all duration-200
                ${isActive('/')
                  ? 'bg-[var(--primary)] text-[var(--text-light)] shadow-lg scale-105'
                  : 'hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'}
              `}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span role="img" aria-label="Home" className="text-lg"></span> HOME
          </Link>
        </li>
        <li>
          <Link
            href="/meal-planner"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base italic transition-all duration-200
                ${isActive('/meal-planner')
                  ? 'bg-[var(--primary)] text-[var(--text-light)] shadow-lg scale-105'
                  : 'hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'}
              `}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span role="img" aria-label="Meal Planner" className="text-lg"></span>MEAL PLANNER
          </Link>
        </li>
        <li>
          <Link
            href="/calorie"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base italic transition-all duration-200
                ${isActive('/calorie')
                  ? 'bg-[var(--primary)] text-[var(--text-light)] shadow-lg scale-105'
                  : 'hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'}
              `}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span role="img" aria-label="Calorie Finder" className="text-lg"></span>CALORIE FINDER
          </Link>
        </li>
        <li>
          <Link
            href="/what-can-i-cook"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base italic transition-all duration-200
                ${isActive('/what-can-i-cook')
                  ? 'bg-[var(--primary)] text-[var(--text-light)] shadow-lg scale-105'
                  : 'hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'}
              `}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span role="img" aria-label="Recipe Discovery" className="text-lg"></span>RECIPE DISCOVERY
          </Link>
        </li>
        {user && (
          <li>
            <Link
              href="/my"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base italic transition-all duration-200
                ${isActive('/my')
                  ? 'bg-[var(--primary)] text-[var(--text-light)] shadow-lg scale-105'
                  : 'hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'}
              `}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span role="img" aria-label="My Page" className="text-lg"></span>MY PAGE
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
