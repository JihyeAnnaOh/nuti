'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentSeasonalData } from '../utils/seasonalData';

/**
 * Slim banner that cycles through upcoming seasonal festivals with CTA links.
 */
export default function SeasonalBanner() {
  const [upcomingFestivals, setUpcomingFestivals] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const festivals = getCurrentSeasonalData();
    setUpcomingFestivals(festivals);
  }, []);

  useEffect(() => {
    if (upcomingFestivals.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % upcomingFestivals.length);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [upcomingFestivals.length]);

  if (upcomingFestivals.length === 0) return null;

  const currentFestival = upcomingFestivals[currentIndex];
  if (!currentFestival) return null;

  // NUTI palette status pill colors (no blue)

  const getFestivalIcon = (key) => {
    switch (key) {
      case 'moonFestival':
        return '🌕';
      case 'lunarNewYear':
        return '🧨';
      case 'diwali':
        return '🪔';
      case 'christmas':
        return '🎄';
      default:
        return '🎊';
    }
  };

  const daysUntil = currentFestival.daysUntil || 0;
  const isToday = currentFestival.isToday || false;
  const isPast = currentFestival.isPast || false;

  const getStatusText = () => {
    if (isToday) return 'Today!';
    if (isPast) return `${Math.abs(daysUntil)} days ago`;
    return `${daysUntil} days away`;
  };

  const getStatusColor = () => {
    if (isToday) return 'bg-[#B48C8C] text-white';
    if (isPast) return 'bg-gray-300 text-[#3B3B3B]';
    return 'bg-[var(--primary)] text-[#3B3B3B]';
  };

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-sm border border-[#EECFD4] rounded-2xl shadow-sm px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getFestivalIcon(currentFestival.key)}</span>
              <div>
                <h3 className="text-sm font-semibold text-[#B48C8C]">
                  {currentFestival.name}
                  {currentFestival.chineseName && (
                    <span className="text-[#7C6A6A] ml-2">({currentFestival.chineseName})</span>
                  )}
                  {currentFestival.hindiName && (
                    <span className="text-[#7C6A6A] ml-2">({currentFestival.hindiName})</span>
                  )}
                </h3>
                <p className="text-xs text-[#7C6A6A]">{currentFestival.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
                {getStatusText()}
              </span>
              <Link
                href={`/what-can-i-cook?season=autumn&festival=${currentFestival.key}`}
                className="text-xs px-3 py-1 rounded-full bg-[var(--primary)] text-[#3B3B3B] font-semibold shadow hover:bg-[var(--accent)] transition"
              >
                View Recipes →
              </Link>
            </div>
          </div>

          {/* Progress dots removed per branding preference */}
        </div>
      </div>
    </div>
  );
} 