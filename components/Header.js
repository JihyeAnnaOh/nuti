'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
        h-25 px-4 flex items-center justify-between overflow-visible`}
    >
      {/* Left: Sidebar toggle */}
      <div className="flex items-center min-w-[48px]">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center h-10 w-10 border rounded shadow bg-white text-black hover:bg-gray-100"
          style={{ fontSize: 24, lineHeight: '1' }}
        >
          {sidebarOpen ? '←' : '→'}
        </button>
      </div>

      {/* Center: Logo */}
      <div className="flex-1 flex justify-center items-center h-full">
        <Link href="/" className="hover:opacity-80 transition-opacity h-full flex items-center">
          <Image
            src="/images/logo.png"
            alt="Nuti Logo"
            width={150}
            height={0}
            className="w-[200px]"
            style={{ maxHeight: 220, marginTop: '10px' }}
            priority
          />
        </Link>
      </div>

      {/* Right: Language button */}
      <div className="flex items-center min-w-[120px] justify-end">
        <button
          className="text-sm border px-3 py-1 rounded bg-white text-black hover:bg-gray-100"
          style={{ fontSize: 16, height: 36 }}
        >
          🌐 Language
        </button>
      </div>
    </header>
  );
}
