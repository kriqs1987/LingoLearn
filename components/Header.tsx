
import React from 'react';
import { BookOpenIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <BookOpenIcon className="w-8 h-8 text-sky-500 mr-3" />
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          LingoLearn
        </h1>
      </div>
    </header>
  );
};

export default Header;
