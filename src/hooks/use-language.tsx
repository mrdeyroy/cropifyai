'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import mr from '@/locales/mr.json';
import bn from '@/locales/bn.json';

type Language = 'en' | 'hi' | 'mr' | 'bn';

const translations = { en, hi, mr, bn };

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, values?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getNestedTranslation(obj: any, key: string): string {
    return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj) || key;
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') as Language | null;
    if (storedLanguage && ['en', 'hi', 'mr', 'bn'].includes(storedLanguage)) {
      setLanguageState(storedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };
  
  const t = (key: string, values: Record<string, string> = {}): string => {
    const translationSet = translations[language] || translations.en;
    let translation = getNestedTranslation(translationSet, key);

    if (translation) {
      Object.keys(values).forEach(valueKey => {
        const regex = new RegExp(`{${valueKey}}`, 'g');
        translation = translation.replace(regex, values[valueKey]);
      });
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
