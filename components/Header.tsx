import React from 'react';
import { BookOpenIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
            <BookOpenIcon className="w-8 h-8 text-sky-500 mr-3" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            LingoLearn
            </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;