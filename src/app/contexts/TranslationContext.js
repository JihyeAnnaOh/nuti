'use client';

/**
 * Lightweight i18n context for client components.
 *
 * - Loads translations for supported languages (en, ko)
 * - Persists the selected language in localStorage
 * - Exposes `t(key)` to lookup nested translation keys like `home.title`
 * - Exposes `changeLanguage(code)` and `availableLanguages`
 */

import { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../locales/en/translations.json';
import koTranslations from '../locales/ko/translations.json';

// Import all translation files
const translations = {
  en: enTranslations,
  ko: koTranslations,
};

const TranslationContext = createContext();

/**
 * Provider component to make i18n utilities available via context.
 * @param {{ children: React.ReactNode }} props
 */
export function TranslationProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('nuti-language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('nuti-language', currentLanguage);
  }, [currentLanguage]);

  /**
   * Resolve a dot-delimited translation key for the current language,
   * falling back to English or the key itself if missing.
   * @param {string} key
   * @returns {string}
   */
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return the key if translation not found
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  /**
   * Update the active language if it is supported.
   * @param {string} languageCode
   */
  const changeLanguage = (languageCode) => {
    if (translations[languageCode]) {
      setCurrentLanguage(languageCode);
    }
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: Object.keys(translations),
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * Convenience hook to read the translation context.
 * Must be used under a `TranslationProvider`.
 */
export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
} 