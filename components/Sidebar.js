'use client';

import { useEffect, useState } from 'react';

export default function Sidebar({ open }) {
  const [visible, setVisible] = useState(open);

  // Animate in/out
  useEffect(() => {
    if (open) setVisible(true);
    else {
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  if (!visible) return null;

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
            <li
              key={item}
              className="px-2 py-1 rounded hover:bg-[var(--primary)] hover:text-[var(--text-light)] cursor-pointer transition-colors"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-semibold mb-2">🌏 Country</h2>
        <ul className="space-y-1 text-sm">
          {['Korean', 'Chinese', 'Japanese', 'Italian'].map((item) => (
            <li
              key={item}
              className="px-2 py-1 rounded hover:bg-[var(--primary)] hover:text-[var(--text-light)] cursor-pointer transition-colors"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
