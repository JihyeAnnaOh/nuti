'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentSeasonalData } from '../utils/seasonalData';

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

  const getThemeColors = (theme) => {
    switch (theme) {
      case 'purple-blue':
        return 'from-purple-500 to-blue-500';
      case 'red-gold':
        return 'from-red-500 to-yellow-500';
      case 'orange-yellow':
        return 'from-orange-500 to-yellow-500';
      case 'red-green':
        return 'from-red-500 to-green-500';
      default:
        return 'from-purple-500 to-blue-500';
    }
  };

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
    if (isToday) return 'bg-green-500 text-white';
    if (isPast) return 'bg-gray-500 text-white';
    return 'bg-blue-500 text-white';
  };

  return (
    <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getFestivalIcon(currentFestival.key)}</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                {currentFestival.name}
                {currentFestival.chineseName && (
                  <span className="text-gray-600 ml-2">({currentFestival.chineseName})</span>
                )}
                {currentFestival.hindiName && (
                  <span className="text-gray-600 ml-2">({currentFestival.hindiName})</span>
                )}
              </h3>
              <p className="text-xs text-gray-600">{currentFestival.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            
            <Link
              href={`/what-can-i-cook?season=autumn&festival=${currentFestival.key}`}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              View Recipes →
            </Link>
          </div>
        </div>

        {/* Progress dots for multiple festivals */}
        {upcomingFestivals.length > 1 && (
          <div className="flex justify-center gap-1 mt-2">
            {upcomingFestivals.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 