'use client';

/**
 * Calorie Finder page.
 *
 * - Lets users upload a food photo via `UploadBox`
 * - Displays AI recognition results in `FoodResultCard`
 * - Shows nearby restaurants that serve the recognized dish
 * - Persists recent results in localStorage with simple de-duplication
 */

import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import UploadBox from "../../../components/UploadBox";
import FoodResultCard from "../../../components/FoodResultCard";
import NearbyResults from "../../../components/NearbyResults";
import Image from 'next/image';

export default function CaloriePage() {
  const [result, setResult] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Load history from localStorage on mount
    const savedHistory = localStorage.getItem('foodSearchHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    if (result) {
      // Add new result to history, ensure no duplicates based on name+calories combination
      setHistory(prevHistory => {
        const newHistory = [result, ...prevHistory.filter(item => 
          !(item.name === result.name && item.calories === result.calories)
        )];
        // Keep history to a reasonable length, e.g., 20 items
        const limitedHistory = newHistory.slice(0, 20);
        localStorage.setItem('foodSearchHistory', JSON.stringify(limitedHistory));
        return limitedHistory;
      });
    }
  }, [result]);

  // Restore a previous result from the local history UI
  const handleHistoryClick = (item) => {
    setResult(item);
  };

  // Remove an entry from history and persist the update
  const handleDeleteHistory = (indexToDelete) => {
    const updatedHistory = history.filter((_, index) => index !== indexToDelete);
    setHistory(updatedHistory);
    localStorage.setItem('foodSearchHistory', JSON.stringify(updatedHistory));
  };

  return (
    <div
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
      className="min-h-screen bg-[#F8F4F2]"
    >
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="pt-40 relative transition-all duration-300e-in-out">
        <Sidebar open={sidebarOpen} />
        <main className={`transition-all duration-300e-in-out flex flex-col items-center justify-center min-h-calc(100h-5rem)]`}>
          <div className="container mx-auto mt-10 p-6 sm:p-8 md:p-12 bg-white/80 rounded-3xl shadow-lg w-full max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold italic tracking-widest uppercase text-center text-[#B48C8C] mb-8 drop-shadow-lg font-sans" style={{ WebkitTextStroke: '2px #fff', textShadow: '0 2px 16px #fff, 0 1px 0 #EECFD4' }}>
              Calorie Finder
            </h1>
            <p className="text-md text-gray-500 text-center mb-8 opacity-70 italic">Ever wondered how many calories are in your meal? Instantly estimate calories and nutrition by uploading a photo of your meal.</p>
            <div className="space-y-6 max-w-xl mx-auto">
              <UploadBox onResult={setResult} />
              <div className="flex flex-col items-center">
                <FoodResultCard result={result} imgClassName="w-28 h-28 md:w-32 md:h-32 object-cover rounded-2xl shadow-lg mb-4" />
              </div>
              {result?.name && <NearbyResults keyword={result.name} />}
            </div>
          </div>

          {/* History Section */}
          <div className="container mx-auto mt-8 p-4 sm:p-6 md:p-8 bg-white rounded-2xl shadow w-full max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center text-[#B48C8C] italic tracking-widest uppercase">Recent Searches</h2>
            {history.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {history.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    style={{ backgroundColor: 'var(--card-bg)' }}
                    className="rounded shadow p-4 hover:shadow-lg transition cursor-pointer flex flex-col items-center text-center relative"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteHistory(index);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-[var(--primary)] hover:bg-[var(--accent)] text-white text-lg font-bold transition-colors rounded-full flex items-center justify-center"
                      style={{ width: '28px', height: '28px', minWidth: '28px', minHeight: '28px' }}
                      title="Delete from history"
                    >
                      ×
                    </button>
                    <h3 className="font-semibold text-base mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-600">Calories: {item.calories}</p>
                    <p className="text-xs text-gray-600">Vegetarian: {item.vegetarian}</p>
                    <p className="text-xs text-gray-600">Halal: {item.halal}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white text-center text-gray-500">
                <p>No recent searches yet. Identify a food to see your history here!</p>
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
} 