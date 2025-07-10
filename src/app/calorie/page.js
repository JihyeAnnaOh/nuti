'use client';

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
      // Add new result to history, ensure no duplicates based on name/calories combination
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

  const handleHistoryClick = (item) => {
    setResult(item);
  };

  const handleDeleteHistory = (indexToDelete) => {
    const updatedHistory = history.filter((_, index) => index !== indexToDelete);
    setHistory(updatedHistory);
    localStorage.setItem('foodSearchHistory', JSON.stringify(updatedHistory));
  };

  return (
    <div
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
      className="min-h-screen"
    >
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="pt-20 relative transition-all duration-300 ease-in-out">
        <Sidebar open={sidebarOpen} />
        <main
          className={`transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          } pt-16 pb-6 px-6 flex flex-wrap lg:flex-nowrap lg:gap-8`}
        >
          {/* Main content area: Upload, Result, Nearby */}
          <div className="w-full lg:flex-1 mb-8 lg:mb-0">
            <div className={`space-y-6 ${result ? '' : 'max-w-md w-full text-center mx-auto'}`}>
              <UploadBox onResult={setResult} />
              <FoodResultCard result={result} />
              {result?.name && <NearbyResults keyword={result.name} />}
            </div>
          </div>

          {/* History Section */}
          <div className="w-full lg:flex-1">
            <h2 className="text-2xl font-bold mb-4 lg:mt-0">Recent Searches</h2>
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
                      className="absolute top-2 right-2 w-7 h-7 bg-pink-200 hover:bg-pink-300 text-red-500 hover:text-red-700 text-lg font-bold transition-colors rounded flex items-center justify-center"
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