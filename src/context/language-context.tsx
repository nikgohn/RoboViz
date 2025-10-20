
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '@/lib/i18n';

type TranslationFunction = (
  key: keyof (typeof translations)['en'],
  vars?: Record<string, string>
) => string;

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationFunction;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'robot-language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedLanguage = localStorage.getItem(LOCAL_STORAGE_KEY) as Language | null;
      if (storedLanguage && translations[storedLanguage]) {
        setLanguage(storedLanguage);
      } else {
        setLanguage('en');
      }
    } catch (error) {
      console.error("Failed to parse language from localStorage", error);
      setLanguage('en');
    }
    setIsLoaded(true);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if (isLoaded) {
        localStorage.setItem(LOCAL_STORAGE_KEY, lang);
    }
  }
  
  useEffect(() => {
    if(isLoaded){
        localStorage.setItem(LOCAL_STORAGE_KEY, language);
    }
  }, [language, isLoaded])

  const t: TranslationFunction = (key, vars) => {
    let translation = translations[language][key] || translations['en'][key];
    if (vars) {
      Object.entries(vars).forEach(([varKey, value]) => {
        translation = translation.replace(new RegExp(`{${varKey}}`, 'g'), value);
      });
    }
    return translation;
  };

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
