'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ open }) {
  const [visible, setVisible] = useState(open);
  const pathname = usePathname();

  // Animate in/out
  useEffect(() => {
    if (open) setVisible(true);
    else {
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  if (!visible) return null;

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <aside
      className={`
        fixed top-28 left-0 z-40 h-[calc(100vh-5rem)] w-56 p-4 space-y-6
        transition-transform duration-300 ease-in-out
        rounded-r-2xl shadow-md
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{
        backgroundColor: 'var(--card-bg)',
        color: 'var(--foreground)',
        borderRight: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <nav>
        <ul className="space-y-3 mt-2">
          <li>
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base shadow-sm transition-all duration-200
                ${isActive('/')
                  ? 'bg-[var(--primary)] text-[var(--text-light)] shadow-lg scale-105'
                  : 'hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'}
              `}
            >
              <span role="img" aria-label="Home">🏠</span> Home
            </Link>
          </li>
          <li>
            <Link
              href="/meal-planner"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base shadow-sm transition-all duration-200
                ${isActive('/meal-planner')
                  ? 'bg-[var(--primary)] text-[var(--text-light)] shadow-lg scale-105'
                  : 'hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'}
              `}
            >
              <span role="img" aria-label="Meal Planner">📝</span> Meal Planner
            </Link>
          </li>
          <li>
            <Link
              href="/calorie"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base shadow-sm transition-all duration-200
                ${isActive('/calorie')
                  ? 'bg-[var(--primary)] text-[var(--text-light)] shadow-lg scale-105'
                  : 'hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'}
              `}
            >
              <span role="img" aria-label="Calorie Finder">🔥</span> Calorie Finder
            </Link>
            </li>
          <li>
            <Link
              href="/what-can-i-cook"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base shadow-sm transition-all duration-200
                ${isActive('/what-can-i-cook')
                  ? 'bg-[var(--primary)] text-[var(--text-light)] shadow-lg scale-105'
                  : 'hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'}
              `}
            >
              <span role="img" aria-label="Recipe Discovery">🧠</span> Recipe Discovery
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
