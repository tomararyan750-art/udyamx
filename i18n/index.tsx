import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Locale } from '../types';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('en');
  const [translations, setTranslations] = useState<Record<Locale, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        // Use fetch to load the JSON files. Paths are absolute from the web root.
        const [en, hi, mr] = await Promise.all([
          fetch('/i18n/locales/en.json').then(res => res.json()),
          fetch('/i18n/locales/hi.json').then(res => res.json()),
          fetch('/i18n/locales/mr.json').then(res => res.json()),
        ]);
        setTranslations({ en, hi, mr });
      } catch (error) {
        console.error("Failed to load translation files:", error);
        // Fallback to empty objects to prevent app from crashing
        setTranslations({ en: {}, hi: {}, mr: {} });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTranslations();
  }, []);

  const t = useCallback((key: string): string => {
    if (!translations) return key;

    const keys = key.split('.');
    let result = translations[locale];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if key not found in current locale
        let fallbackResult = translations['en'];
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
        }
        return fallbackResult || key;
      }
    }
    return result || key;
  }, [locale, translations]);
  
  if (isLoading) {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <p className="text-gray-800 dark:text-gray-200">Loading App...</p>
        </div>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};