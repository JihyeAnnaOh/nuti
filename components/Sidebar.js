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
        fixed top-20 left-0 z-40 h-[calc(100vh-5rem)] w-64 p-4 space-y-6
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
      <div>
        <h2 className="font-semibold mb-2">🍽️ Food Types</h2>
        <ul className="space-y-1 text-sm">
          {['Pizza', 'Chicken', 'Hamburger', 'Bibimbap'].map((item) => (
            <li key={item}>
              <Link
                href={`/food/${item.toLowerCase()}`}
                className={`block px-2 py-1 rounded transition-colors ${
                  isActive(`/food/${item.toLowerCase()}`)
                    ? 'bg-[var(--primary)] text-[var(--text-light)]'
                    : 'hover:bg-[var(--primary)] hover:text-[var(--text-light)]'
                }`}
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-semibold mb-2">🌏 Country</h2>
        <ul className="space-y-1 text-sm">
          {['Korean', 'Chinese', 'Japanese', 'Italian'].map((item) => (
            <li key={item}>
              <Link
                href={`/country/${item.toLowerCase()}`}
                className={`block px-2 py-1 rounded transition-colors ${
                  isActive(`/country/${item.toLowerCase()}`)
                    ? 'bg-[var(--primary)] text-[var(--text-light)]'
                    : 'hover:bg-[var(--primary)] hover:text-[var(--text-light)]'
                }`}
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
