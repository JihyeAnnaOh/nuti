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
import { useRef } from 'react';
import { motion } from 'framer-motion';

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

  // Section background images
  const bgImages = [
    '/images/landpage/katie-smith-uQs1802D0CQ-unsplash.jpg',
    '/images/landpage/sara-cervera-0X6sEvSJxas-unsplash.jpg',
    '/images/landpage/mia-moessinger-n6eDkvb4mg8-unsplash.jpg',
    '/images/landpage/boxed-water-is-better-6WrKKQcEnXk-unsplash.jpg',
    '/images/landpage/jason-briscoe-KTrov7eujms-unsplash.jpg',
    '/images/landpage/kevin-mccutcheon-APDMfLHZiRA-unsplash.jpg',
    '/images/landpage/rumman-amin-LNn6O_Mt730-unsplash.jpg',
    '/images/landpage/jon-tyson-YNNtKJKDjCI-unsplash.jpg',
  ];

  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }} className="min-h-screen">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="pt-20 relative transition-all duration-300 ease-in-out">
        <Sidebar open={sidebarOpen} />
        <main className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'} flex flex-col items-center min-h-[calc(100vh-5rem)] bg-[#F8F4F2]`}>

          {/* 1. Hero Section */}
          <section className="w-full flex flex-col items-center justify-center mt-6 min-h-[70vh] relative overflow-hidden" style={{background: `url(${bgImages[0]}) center/cover no-repeat`}}>
            <div className="absolute inset-0 bg-[#F8F4F2]/30" />
            <div className="relative z-10 flex flex-col items-center justify-center py-24">
              <h1
                className="text-5xl md:text-6xl font-extrabold italic tracking-widest uppercase text-center text-[#B48C8C] mb-8 drop-shadow-lg font-sans"
                style={{ WebkitTextStroke: '2px #fff', textShadow: '0 2px 16px #fff, 0 1px 0 #EECFD4' }}
              >
                Wellness That Feels Like Home
              </h1>
            </div>
          </section>

          {/* 2. Feature Highlights */}
          <section className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 py-20">
            {[
              {
                title: 'Photo Upload',
                subtitle: 'Snap your meal',
                highlight: 'Fast & Easy',
              },
              {
                title: 'Cultural Dishes',
                subtitle: 'Find local favorites',
                highlight: 'Near You',
              },
              {
                title: 'Quick Nutrition',
                subtitle: 'Instant facts',
                highlight: 'AI Powered',
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.7 }}
                className="flex-1 min-w-[320px] max-w-lg rounded-3xl shadow-lg bg-white p-14 flex flex-col justify-between border border-[#EECFD4] h-[420px]"
              >
                <div className="flex flex-col items-start">
                  <span className="text-5xl font-extrabold lowercase text-[#7C7C7C] mb-4 tracking-tight" style={{ fontFamily: 'Montserrat, Helvetica Neue, Arial, sans-serif', letterSpacing: '-0.04em' }}>{f.title}</span>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <span className="text-2xl font-semibold text-[#3B3B3B] mb-2">{f.subtitle}</span>
                  <span className="text-lg font-bold text-[#B48C8C]">{f.highlight}</span>
                </div>
              </motion.div>
            ))}
          </section>

          {/* 3. Location-aware Section */}
          <section className="w-full max-w-4xl mx-auto py-16 flex flex-col items-center" style={{background: `url(${bgImages[4]}) center/cover no-repeat`}}>
            <div className="bg-white/60 rounded-2xl shadow-lg p-8 w-full flex flex-col items-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#B48C8C]">What's around you?</h2>
              <div className="w-full h-40 bg-[#F8F4F2] rounded-xl flex items-center justify-center text-[#B48C8C] text-lg font-semibold border border-[#EECFD4]">[Map]</div>
            </div>
          </section>

          {/* 4. Cultural Food Carousel */}
          <section className="w-full max-w-5xl mx-auto py-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-[#B48C8C]">World Flavors</h2>
            <div className="flex overflow-x-auto gap-8 pb-4 px-2">
              {[
                { flag: '🇰🇷', name: 'Korean', img: bgImages[5] },
                { flag: '🇮🇳', name: 'Indian', img: bgImages[6] },
                { flag: '🇨🇳', name: 'Chinese', img: bgImages[7] },
                { flag: '🇱🇧', name: 'Lebanese', img: bgImages[1] },
                { flag: '🇻🇳', name: 'Vietnamese', img: bgImages[2] },
              ].map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.7 }}
                  className="min-w-[180px] rounded-3xl shadow-lg bg-white/60 backdrop-blur-md p-6 flex flex-col items-center border border-[#EECFD4]"
                  style={{ backgroundImage: `url(${c.img})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'lighten' }}
                >
                  <span className="text-3xl mb-2">{c.flag}</span>
                  <h4 className="text-lg font-bold mb-2 text-[#B48C8C]">{c.name}</h4>
                  <button className="px-5 py-2 rounded-full bg-[#EECFD4] text-[#3B3B3B] font-semibold shadow hover:bg-[#DDB7AB] transition text-sm">Find Near Me</button>
                </motion.div>
              ))}
            </div>
          </section>

          {/* 5. AI Demo Preview */}
          <section id="ai-demo" className="w-full max-w-4xl mx-auto py-16 flex flex-col items-center" style={{background: `url(${bgImages[3]}) center/cover no-repeat`}}>
            <div className="bg-white/60 rounded-2xl shadow-lg p-8 w-full flex flex-col items-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#B48C8C]">Try AI Food Scan</h2>
              <div className="w-40 h-72 bg-[#F8F4F2] rounded-2xl flex items-center justify-center border border-[#EECFD4] mb-4 shadow-inner">
                <Image src="/images/landpage/kevin-mccutcheon-APDMfLHZiRA-unsplash.jpg" alt="AI Demo" width={120} height={240} className="rounded-xl object-cover" />
              </div>
            </div>
          </section>

          {/* 6. Quote/Testimonial */}
          <section className="w-full py-16 flex flex-col items-center bg-[#F8F4F2]">
            <div className="max-w-2xl mx-auto bg-[#F8F4F2] rounded-2xl p-8 text-center shadow-none">
              <blockquote className="italic text-2xl md:text-3xl text-[#B48C8C] font-serif mb-4">“Eating well shouldn't mean eating the same.”</blockquote>
              <span className="text-[#7C6A6A] font-medium">— Founder, [Your Name]</span>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
