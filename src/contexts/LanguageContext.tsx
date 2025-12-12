import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Language, getTranslation } from '@/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Detect system language and map to supported languages
const detectSystemLanguage = (): Language => {
  const browserLang = navigator.language.toLowerCase();
  
  // Check for Hindi
  if (browserLang.startsWith('hi')) {
    return 'hi';
  }
  
  // Default to English for all other languages
  return 'en';
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    if (saved && ['en', 'hi', 'hinglish'].includes(saved)) {
      return saved as Language;
    }
    // Auto-detect system language on first visit
    return detectSystemLanguage();
  });

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string): string => {
    return getTranslation(language, key);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
