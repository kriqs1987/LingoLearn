
import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, max }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-sky-700 dark:text-white">Overall Mastery</span>
        <span className="text-sm font-medium text-sky-700 dark:text-white">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-4 dark:bg-slate-700">
        <div 
          className="bg-sky-500 h-4 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
