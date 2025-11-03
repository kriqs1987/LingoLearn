
import React from 'react';
import { AppView } from '../types';
import { BrainCircuitIcon, ListBulletIcon } from './Icons';

interface NavBarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const NavButton: React.FC<{
  label: string;
  view: AppView;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  children: React.ReactNode;
}> = ({ label, view, currentView, onNavigate, children }) => {
  const isActive = currentView === view;
  const activeClasses = 'text-sky-500 dark:text-sky-400';
  const inactiveClasses = 'text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400';

  return (
    <button
      onClick={() => onNavigate(view)}
      className={`flex flex-col items-center justify-center gap-1 w-full transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};


const NavBar: React.FC<NavBarProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-t-lg z-10">
      <div className="container mx-auto px-4 h-16 flex justify-around items-center">
        <NavButton
          label="Learn"
          view={AppView.DASHBOARD}
          currentView={currentView}
          onNavigate={onNavigate}
        >
          <BrainCircuitIcon className="w-6 h-6" />
        </NavButton>
        <NavButton
          label="Word Bank"
          view={AppView.MANAGE_WORDS}
          currentView={currentView}
          onNavigate={onNavigate}
        >
          <ListBulletIcon className="w-6 h-6" />
        </NavButton>
      </div>
    </nav>
  );
};

export default NavBar;
