'use client';

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import UploadBox from "../../components/UploadBox";
import FoodResultCard from "../../components/FoodResultCard";
import NearbyResults from "../../components/NearbyResults";
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
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

  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }} className="min-h-screen">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="pt-20 relative transition-all duration-300 ease-in-out">
        <Sidebar open={sidebarOpen} />
        <main className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'} flex flex-col items-center justify-center min-h-[calc(100vh-5rem)]`}> 
          <h1 className="text-4xl font-bold mb-8 mt-8 text-center">Welcome to Nuti!</h1>
          <p className="mb-8 text-lg text-center max-w-xl">Nuti helps you identify foods, get AI-powered nutrition info, and find nearby places tailored to your culture and health goals.</p>
        </main>
      </div>
    </div>
  );
}
