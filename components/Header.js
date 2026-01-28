'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../src/app/contexts/TranslationContext';
import dynamic from 'next/dynamic';

const AuthButton = dynamic(() => import('./AuthButton'), { ssr: false });
/**
 * Sticky header with brand logo and language selector.
 * Language changes are applied via context and the current route is reloaded
 * with a `/{lang}` prefix for user-friendly localized URLs.
 */
export default function Header({ sidebarOpen, setSidebarOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const router = useRouter();
  const { t, currentLanguage, changeLanguage } = useTranslation();
  
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ko', label: '한국어' },
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' },
    { code: 'vi', label: 'Tiếng Việt' },
    { code: 'ar', label: 'العربية' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ms', label: 'Bahasa Melayu' },
    { code: 'it', label: 'Italiano' },
  ];

  const handleLanguageChange = (code) => {
    setShowLangMenu(false);
    changeLanguage(code);
    
    // Remove existing locale prefix if present
    const path = window.location.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');
    router.push(`/${code}${path}`);
  };

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const next = window.scrollY > 30;
        setScrolled((prev) => (prev !== next ? next : prev));
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-colors duration-300
        ${scrolled ? 'bg-[var(--primary)] text-[var(--text-light)] shadow-md'
                   : 'bg-transparent text-[var(--foreground)]'}
        h-24 px-4 flex items-center justify-between overflow-visible`}
    >
      {/* Left: Sidebar toggle */}

      {/* Center: Logo */}
      <div className="flex-1 flex justify-center items-center h-full">
        <Link href="/" className="hover:opacity-80 transition-opacity h-full flex items-center">
          <Image
            src="/images/logo.png"
            alt="Nuti Logo"
            width={150}
            height={0}
            className="w-[200px]"
            style={{ maxHeight: 220, marginTop: '10px' }}
            priority
          />
        </Link>
      </div>

      {/* Right: Auth + Language */}
      <div className="flex items-center gap-3 min-w-[160px] justify-end relative">
        <div className="hidden sm:block">
          <AuthButton />
        </div>
        <button
          className={`px-2 py-1 rounded-lg font-bold italic text-xs transition-all duration-200 bg-transparent text-white hover:bg-[var(--primary-light)] hover:text-[var(--primary)] shadow-none border-none outline-none`}
          style={{ fontSize: 13, height: 28 }}
          onClick={() => setShowLangMenu(v => !v)}
        >
          <span className="text-white">🌐 {t('common.language')}</span>
        </button>
        {showLangMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg z-50 min-w-[180px] max-h-[320px] overflow-y-auto">
            {languages.map((lang, idx) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${idx !== languages.length - 1 ? 'border-b' : ''} ${currentLanguage === lang.code ? 'bg-blue-50 font-semibold' : ''}`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
