import React from 'react';
import { BookOpenIcon } from './Icons';
import { User } from '../types';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
            <BookOpenIcon className="w-8 h-8 text-sky-500 mr-3" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            LingoLearn
            </h1>
        </div>
        {user && (
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium hidden sm:block">Welcome, {user.username}!</span>
                <button
                    onClick={onLogout}
                    className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg transition text-sm"
                >
                    Logout
                </button>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;