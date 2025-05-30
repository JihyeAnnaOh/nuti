'use client';

import { useState } from 'react';

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <>
      {open && (
        <aside className="w-64 bg-white border-r p-4 space-y-6">
          <div>
            <h2 className="font-bold mb-2">🍽️ Food Types</h2>
            <ul className="space-y-1 text-sm">
              <li>Pizza</li>
              <li>Chicken</li>
              <li>Hamburger</li>
              <li>Bibimbap</li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold mb-2">🌏 Country</h2>
            <ul className="space-y-1 text-sm">
              <li>Korean</li>
              <li>Chinese</li>
              <li>Japanese</li>
              <li>Italian</li>
            </ul>
          </div>
        </aside>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="absolute top-20 left-0 z-40 p-2 bg-white border border-r-0 rounded-r shadow"
      >
        {open ? "←" : "→"}
      </button>
    </>
  );
}
