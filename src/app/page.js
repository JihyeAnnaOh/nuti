'use client';

/**
 * Landing page for Nuti.
 *
 * Responsibilities
 * - Presents the marketing/overview sections (hero, features, carousel, CTA)
 * - Shows seasonal banner and popup content
 * - Persists simple client-side history of scanned/selected foods in localStorage
 * - Integrates with global `useTranslation()` for i18n copy
 */

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import UploadBox from "../../components/UploadBox";
import FoodResultCard from "../../components/FoodResultCard";
import NearbyResults from "../../components/NearbyResults";
import SeasonalPopup from "../../components/SeasonalPopup";
import SeasonalBanner from "../../components/SeasonalBanner";
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from "./contexts/TranslationContext";

/**
 * Home route component.
 * @returns {JSX.Element}
 */
export default function Home() {
  const [result, setResult] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [history, setHistory] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    // Load history from localStorage on mount
    const savedHistory = localStorage.getItem('foodSearchHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    if (result) {
      // Add new result to history, ensure no duplicates by name+calories pair
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

  /**
   * Restore a previous result from the local history UI.
   * @param {any} item
   */
  const handleHistoryClick = (item) => {
    setResult(item);
  };

  // Section background images
  const bgImages = [
    '/images/landpage/katie-smith-uQs1802D0CQ-unsplash.jpg',
    '/images/landpage/sara-cervera-0X6sEvSJxas-unsplash.jpg',
    '/images/landpage/mia-moessinger-n6eDkvb4mg8-unsplash.jpg',
    '/images/landpage/boxed-water-is-better-6WrKKQcEnXk-unsplash.jpg',
    '/images/landpage/middle.jpg',
    '/images/landpage/kevin-mccutcheon-APDMfLHZiRA-unsplash.jpg',
    '/images/landpage/rumman-amin-LNn6O_Mt730-unsplash.jpg',
    '/images/landpage/jon-tyson-YNNtKJKDjCI-unsplash.jpg',
  ];

  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }} className="min-h-screen">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="pt-38 relative transition-all duration-300 ease-in-out">
        <Sidebar open={sidebarOpen} />
        <main className={`transition-all duration-300 ease-in-out flex flex-col items-center min-h-[calc(100vh-5rem)] bg-[#F8F4F2]`}>

          {/* Seasonal Banner: highlights current festival/seasonal content */}
          <SeasonalBanner />

          {/* 1. Hero Section */}
          <section className="w-full flex flex-col items-center justify-center mt-0 min-h-[85vh] relative overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0"
              style={{ minHeight: '85vh' }}
            >
              <source src="/images/landpage/home.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-[#F8F4F2]/30 z-10" />
            <div className="relative z-20 flex flex-col items-center justify-center py-24">
              <h1
                className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold italic tracking-widest uppercase text-center text-[#B48C8C] mb-8 drop-shadow-lg font-sans"
                style={{ WebkitTextStroke: '2px #fff', textShadow: '0 2px 16px #fff, 0 1px 0 #EECFD4' }}
              >
                {t('home.title')}
              </h1>
            </div>
          </section>

          {/* 2. Feature Highlights */}
          <section className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-5 py-10">
            {[
              {
                title: 'Photo Upload',
                subtitle: 'Snap your meal',
                highlight: 'Fast & Easy',
                bg: '/images/landpage/Highlight1.jpg',
              },
              {
                title: 'Cultural Dishes',
                subtitle: 'Find local favorites',
                highlight: 'Near You',
                bg: '/images/landpage/Highlight2.jpg',
              },
              {
                title: 'Quick Nutrition',
                subtitle: 'Instant facts',
                highlight: 'AI Powered',
                bg: '/images/landpage/Highlight3.jpg',
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.7 }}
                className="flex-1 min-w-[320px] max-w-lg rounded-3xl shadow-lg bg-white flex flex-col justify-between items-center border border-[#EECFD4] h-[520px] relative overflow-hidden"
                style={{ backgroundImage: `url(${f.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className="absolute inset-0 bg-white/70 z-0" />
                <div className="relative z-10 flex flex-col items-start w-full p-8">
                  <span className="text-5xl font-extrabold lowercase text-[#7C7C7C] mb-4 tracking-tight" style={{ fontFamily: 'Montserrat, Helvetica Neue, Arial, sans-serif', letterSpacing: '-0.04em' }}>{f.title}</span>
                </div>
                <div className="relative z-10 flex flex-col items-start w-full p-8 pt-0 mt-auto">
                  <span className="text-2xl font-semibold text-[#3B3B3B] mb-2">{f.subtitle}</span>
                  <span className="text-lg font-bold text-[#B48C8C]">{f.highlight}</span>
                </div>
              </motion.div>
            ))}
          </section>

          {/* 3. Location-aware Section */}
          <section className="w-full max-w-4xl mx-auto py-16 flex flex-col items-center min-h-[600px] relative" style={{background: `url(${bgImages[4]}) center/cover no-repeat`}}>
            <div className="absolute inset-0 bg-white/20 pointer-events-none" />
          </section>

          {/* 4. Cultural Food Carousel */}
          <section className="w-full max-w-5xl mx-auto py-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-[#B48C8C]">World Flavors</h2>
            <div className="flex overflow-x-auto gap-8 pb-4 px-2">
              {[
                { flag: '🇰🇷', name: 'Korean' },
                { flag: '🇨🇳', name: 'Chinese' },
                { flag: '🇯🇵', name: 'Japanese' },
                { flag: '🇻🇳', name: 'Vietnamese' },
                { flag: '🇱🇧', name: 'Lebanese' },
                { flag: '🇮🇳', name: 'Indian' },
                { flag: '🇲🇾', name: 'Malaysian' },
                { flag: '🇮🇹', name: 'Italian' },
              ].map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.7 }}
                  className="min-w-[180px] rounded-3xl shadow-lg bg-white/60 backdrop-blur-md p-6 flex flex-col items-center border border-[#EECFD4]"
                >
                  <span className="text-3xl mb-2">{c.flag}</span>
                  <h4 className="text-lg font-bold mb-2 text-[#B48C8C]">{c.name}</h4>
                  <Link 
                    href={`/meal-planner?cuisine=${encodeURIComponent(c.name)}`}
                    className="px-5 py-2 rounded-full bg-[#EECFD4] text-[#3B3B3B] font-semibold shadow hover:bg-[#DDB7AB] transition text-sm block text-center"
                  >
                    Find Near Me
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* 5. AI Demo Preview */}
          <section id="ai-demo" className="w-full max-w-4xl mx-auto py-16 flex flex-col items-center min-h-[600px]" style={{background: `url(${bgImages[3]}) center/cover no-repeat`}}>
            <div className="bg-white/60 rounded-2xl shadow-lg p-8 w-full flex flex-col items-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#B48C8C]">Try AI Food Scan</h2>
              <a
                href="/calorie"
                className="mt-6 px-8 py-3 rounded-full bg-[var(--primary)] text-[var(--text-light)] font-bold text-lg shadow hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition"
              >
                Go to Calorie Finder
              </a>
            </div>
          </section>

          {/* 6. Quote/Testimonial */}
          <section className="w-full py-16 flex flex-col items-center bg-[#F8F4F2]">
            <div className="max-w-2xl mx-auto bg-[#F8F4F2] rounded-2xl p-8 text-center shadow-none">
              <blockquote className="italic text-2xl md:text-3xl text-[#B48C8C] font-serif mb-4 whitespace-nowrap overflow-x-auto">&apos;Eating well shouldnt mean eating the same.&apos;</blockquote>
              <span className="text-[#7C6A6A] font-medium">— Founder, Anna Oh</span>
            </div>
          </section>

        </main>
      </div>
      
      {/* Seasonal Festival Popup */}
      <SeasonalPopup />
    </div>
  );
}
