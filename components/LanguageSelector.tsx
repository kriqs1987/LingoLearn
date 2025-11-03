import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onLanguageChange }) => {
  return (
    <div>
      <label htmlFor="language-select" className="sr-only">Select language</label>
      <select
        id="language-select"
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="block w-full pl-3 pr-8 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 rounded-md bg-white dark:bg-slate-700"
      >
        {SUPPORTED_LANGUAGES.map(lang => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
