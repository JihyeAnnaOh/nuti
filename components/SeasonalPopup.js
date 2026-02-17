'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCurrentSeasonalData, getFestivalByKey } from '../utils/seasonalData';

/**
 * Rich seasonal popup highlighting an upcoming festival, suggested dishes,
 * and quick actions. Optionally queries nearby places for festival foods.
 */
export default function SeasonalPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentFestival, setCurrentFestival] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState(null);
  const [nearbyResults, setNearbyResults] = useState([]);

  useEffect(() => {
    // Check if user has dismissed this popup
    const hidePopup = localStorage.getItem('hideSeasonalPopup');
    if (hidePopup === 'true') {
      return;
    }

    // Get current seasonal data
    const upcomingFestivals = getCurrentSeasonalData();
    if (upcomingFestivals.length > 0) {
      const festival = upcomingFestivals[0];
      setCurrentFestival(festival);
      
      // Show popup after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('hideSeasonalPopup', 'true');
    handleClose();
  };

  if (!isVisible || !currentFestival) return null;

  const getThemeColors = (theme) => {
    switch (theme) {
      case 'purple-blue':
        return {
          primary: 'from-purple-600 to-blue-600',
          secondary: 'from-purple-50 to-blue-50',
          accent: 'purple',
          button: 'bg-purple-600 hover:bg-purple-700'
        };
      case 'red-gold':
        return {
          primary: 'from-red-600 to-yellow-600',
          secondary: 'from-red-50 to-yellow-50',
          accent: 'red',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'orange-yellow':
        return {
          primary: 'from-orange-600 to-yellow-600',
          secondary: 'from-orange-50 to-yellow-50',
          accent: 'orange',
          button: 'bg-orange-600 hover:bg-orange-700'
        };
      case 'red-green':
        return {
          primary: 'from-red-600 to-green-600',
          secondary: 'from-red-50 to-green-50',
          accent: 'red',
          button: 'bg-red-600 hover:bg-red-700'
        };
      default:
        return {
          primary: 'from-purple-600 to-blue-600',
          secondary: 'from-purple-50 to-blue-50',
          accent: 'purple',
          button: 'bg-purple-600 hover:bg-purple-700'
        };
    }
  };

  const theme = getThemeColors(currentFestival.theme);
  const daysUntil = currentFestival.daysUntil || 0;
  const isToday = currentFestival.isToday || false;
  const isPast = currentFestival.isPast || false;

  const getStatusText = () => {
    if (isToday) return 'Today!';
    if (isPast) return `${Math.abs(daysUntil)} days ago`;
    return `${daysUntil} days away`;
  };

  const getStatusColor = () => {
    if (isToday) return 'text-green-600 bg-green-100';
    if (isPast) return 'text-gray-600 bg-gray-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getFestivalKeywords = (festivalKey) => {
    if (festivalKey === 'moonFestival') {
      return ['mooncake', 'lantern', 'osmanthus', 'pomelo', 'tea egg'];
    }
    if (festivalKey === 'lunarNewYear') {
      return ['dumpling', 'spring roll', 'lantern'];
    }
    if (festivalKey === 'ramadan') {
      return ['dates', 'samosa', 'lentil soup', 'kebab'];
    }
    if (festivalKey === 'easter') {
      return ['hot cross bun', 'roast lamb', 'chocolate egg'];
    }
    if (festivalKey === 'diwali') {
      return ['gulab jamun', 'samosa', 'diya'];
    }
    if (festivalKey === 'christmas') {
      return ['christmas pudding', 'roast turkey'];
    }
    return [];
  };

  const findNearbyFestivalFoods = async () => {
    if (!navigator.geolocation) {
      setNearbyError('Geolocation not supported.');
      return;
    }

    setNearbyLoading(true);
    setNearbyError(null);
    setNearbyResults([]);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
      });

      const { latitude, longitude } = position.coords;
      const keywords = getFestivalKeywords(currentFestival.key);

      // Query multiple keywords and merge results
      const allResults = [];
      for (const keyword of keywords) {
        const res = await fetch(`/api/nearby?query=${encodeURIComponent(keyword)}&lat=${latitude}&lng=${longitude}`);
        const data = await res.json();
        if (data.results) {
          allResults.push(...data.results);
        }
      }

      // De-dupe by place_id and sort by distance
      const unique = new Map();
      allResults.forEach((pl) => {
        if (!unique.has(pl.place_id)) unique.set(pl.place_id, pl);
      });
      const merged = Array.from(unique.values()).sort((a, b) => a.distance - b.distance).slice(0, 8);
      setNearbyResults(merged);
    } catch (err) {
      console.error('Nearby search failed', err);
      setNearbyError('Failed to fetch nearby places.');
    } finally {
      setNearbyLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div 
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden">
          {/* Header - align with NUTI brand palette */}
          <div className={`relative bg-gradient-to-r from-[#EECFD4] to-[#DDB7AB] text-white p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {currentFestival.key === 'moonFestival' ? '🌕' : 
                   currentFestival.key === 'lunarNewYear' ? '🧨' :
                   currentFestival.key === 'diwali' ? '🪔' :
                   currentFestival.key === 'christmas' ? '🎄' : '🎊'}
                </span>
                <div>
                  <h2 className="text-2xl font-bold">{currentFestival.name}</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-white/80">{currentFestival.date}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
                      {getStatusText()}
                    </span>
                  </div>
                  {currentFestival.chineseName && (
                    <p className="text-white/80 text-sm">{currentFestival.chineseName}</p>
                  )}
                  {currentFestival.hindiName && (
                    <p className="text-white/80 text-sm">{currentFestival.hindiName}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Festival Info */}
            <div className={`mb-6 p-4 bg-white/70 rounded-lg border border-[#EECFD4]`}>
              <h3 className={`text-lg font-semibold text-[#B48C8C] mb-2`}>🎊 Festival Celebration</h3>
              <p className={`text-[#7C6A6A] text-sm leading-relaxed`}>
                {currentFestival.description}
              </p>
            </div>

            {/* Seasonal Dishes */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🍽️</span>
                Seasonal Festival Dishes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentFestival.dishes.map((dish, index) => (
                  <div key={index} className={`bg-white/70 rounded-lg p-4 border border-[#EECFD4] hover:border-[#DDB7AB] transition-colors`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-24 h-24 rounded-lg flex items-center justify-center text-2xl`}>
                        {dish.image ? (
                          <Image 
                            src={dish.image} 
                            alt={dish.name}
                            width={96}
                            height={96}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <span>🍰</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800">{dish.name}</h4>
                          <span className={`text-xs bg-[#EECFD4] text-[#7C6A6A] px-2 py-1 rounded-full`}>
                            {dish.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{dish.description}</p>
                        {dish.culturalSignificance && (
                          <p className="text-xs text-gray-500 mb-2 italic">{dish.culturalSignificance}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">~{dish.calories} cal</span>
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(dish.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs text-[#B48C8C] hover:text-[#8f6f6f] font-medium`}
                          >
                            Learn More →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Festival Activities */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎭</span>
                Festival Traditions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentFestival.activities.map((activity, index) => (
                  <div key={index} className={`text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-[#EECFD4]`}>
                    <span className="text-3xl mb-2 block">{activity.icon}</span>
                    <h4 className="font-semibold text-gray-800 mb-1">{activity.title}</h4>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className={`text-center p-6 bg-white/70 backdrop-blur-sm rounded-lg border border-[#EECFD4]`}>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/meal-planner"
                  className={`px-6 py-3 bg-[var(--primary)] text-[#3B3B3B] rounded-lg font-semibold transition-colors hover:bg-[var(--accent)]`}
                >
                  Quick Meal Planner
                </Link>
                <Link
                  href="/calorie"
                  className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-semibold hover:opacity-90 transition-colors"
                >
                  Calorie Calculator
                </Link>
                <Link
                  href="/what-can-i-cook"
                  className="px-6 py-3 border border-[#EECFD4] text-[#7C6A6A] rounded-lg font-semibold hover:bg-[#EECFD4] hover:text-[#3B3B3B] transition-colors"
                >
                  Recipe Explorer
                </Link>
              </div>
            </div>

            {/* Nearby Festival Foods */}
            {(nearbyLoading || nearbyError || nearbyResults.length > 0) && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📍</span>
                  Places Nearby
                </h3>
                {nearbyLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-pulse">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-3 border border-[#EECFD4] rounded-lg bg-white/80">
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                )}
                {nearbyError && (
                  <div className="text-sm text-red-600">
                    {nearbyError}
                    <div className="mt-2">
                      <button
                        onClick={findNearbyFestivalFoods}
                        className="text-xs px-3 py-1 rounded-full bg-white text-[var(--primary)] border border-[var(--primary)] hover:bg-[var(--primary-light)] transition"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}
                {!nearbyLoading && !nearbyError && nearbyResults.length === 0 && (
                  <p className="text-sm text-gray-500">No nearby places found yet.</p>
                )}
                {nearbyResults.length > 0 && (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {nearbyResults.map((place) => (
                      <li key={place.place_id} className="p-3 border border-[#EECFD4] rounded-lg bg-white/80 backdrop-blur-sm shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-semibold text-gray-800">{place.name}</h4>
                            <p className="text-xs text-gray-600">{place.address}</p>
                            {typeof place.distance === 'number' && (
                              <p className="text-xs text-gray-400 mt-1">{place.distance.toFixed(1)} km away</p>
                            )}
                          </div>
                          <a
                            href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 bg-[#EECFD4] text-[#3B3B3B] rounded hover:bg-[var(--accent)] hover:text-white transition"
                          >
                            Map
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-white/70 backdrop-blur-sm px-6 py-4 border-t border-[#EECFD4]">
            <div className="flex items-center justify-between">
              <button
                onClick={handleDontShowAgain}
                className="text-xs px-3 py-1.5 rounded-full border border-[#EECFD4] text-[#7C6A6A] hover:bg-[#EECFD4] hover:text-[#3B3B3B] transition"
              >
                Don’t show again
              </button>
              <div className="text-xs text-gray-400">
                {currentFestival.chineseName ? `${currentFestival.chineseName} • ` : ''}
                {currentFestival.hindiName ? `${currentFestival.hindiName} • ` : ''}
                {currentFestival.date}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 