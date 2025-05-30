'use client';

import { useState, useEffect } from 'react';

export default function Header() {
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
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        scrolled ? "bg-teal-700 text-white" : "bg-transparent text-black"
      } p-4 flex justify-between items-center shadow-sm`}
    >
      <h1 className="text-xl font-bold">Nuti</h1>
      <button className="text-sm border px-3 py-1 rounded">🌐 Language</button>
    </header>
  );
}
