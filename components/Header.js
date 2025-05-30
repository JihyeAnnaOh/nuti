'use client';

import { useState, useEffect } from 'react';

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-colors duration-300
        ${scrolled ? 'bg-[var(--primary)] text-[var(--text-light)] shadow-md'
                   : 'bg-transparent text-[var(--foreground)]'}
        p-4 flex justify-between items-center`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 border rounded shadow bg-white text-black hover:bg-gray-100"
        >
          {sidebarOpen ? '←' : '→'}
        </button>
        <h1 className="text-xl font-bold">Nuti</h1>
      </div>
      <div className="flex gap-3 items-center">
        <button className="text-sm border px-3 py-1 rounded bg-white text-black hover:bg-gray-100">
          🌐 Language
        </button>
      </div>
    </header>
  );
}
