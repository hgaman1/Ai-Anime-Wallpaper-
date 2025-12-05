import React from 'react';
import { Language } from '../types';

interface HeaderProps {
  onHistoryClick: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const Header: React.FC<HeaderProps> = ({ onHistoryClick, language, setLanguage, t }) => {
  
  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
  };

  return (
    <header className="relative py-6 px-4 text-center">
      <button
        onClick={toggleLanguage}
        className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8 text-gray-400 hover:text-white transition-colors duration-300 bg-gray-800/50 hover:bg-gray-700/70 rounded-md px-3 py-1.5 font-bold text-sm"
        aria-label={`Switch to ${language === 'ar' ? 'English' : 'Arabic'}`}
      >
        {t('languageToggle')}
      </button>
      <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
        {t('headerTitle')}
      </h1>
      <p className="text-gray-400 mt-2">
        {t('headerSubtitle')}
      </p>
      <button
        onClick={onHistoryClick}
        className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 text-gray-400 hover:text-white transition-colors duration-300"
        aria-label={t('historyButtonLabel')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </header>
  );
};