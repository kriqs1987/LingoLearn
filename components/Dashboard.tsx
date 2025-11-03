import React from 'react';
import { Word } from '../types';
import ProgressBar from './ProgressBar';
import WordList from './WordList';
import { BrainCircuitIcon } from './Icons';
import { QUIZ_SESSION_LENGTH } from '../constants';

interface DashboardProps {
  words: Word[];
  totalMastery: number;
  maxPossibleMastery: number;
  onStartQuiz: () => void;
  username: string;
  currentLanguage: string;
}

const Dashboard: React.FC<DashboardProps> = ({
  words,
  totalMastery,
  maxPossibleMastery,
  onStartQuiz,
  username,
  currentLanguage,
}) => {
  const canStartQuiz = words.length >= QUIZ_SESSION_LENGTH;

  return (
    <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg space-y-4">
            <div className='mb-4'>
                <h2 className="text-2xl font-bold">Welcome, {username}!</h2>
                <p className="text-slate-500 dark:text-slate-400">You are learning English from {currentLanguage}.</p>
            </div>
            <h3 className="text-xl font-bold">Your Progress</h3>
            <ProgressBar current={totalMastery} max={maxPossibleMastery} />
            <button
            onClick={onStartQuiz}
            disabled={!canStartQuiz}
            className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition hover:bg-green-600 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:hover:bg-slate-400"
            >
            <BrainCircuitIcon className="w-6 h-6" />
            Start Quiz
            </button>
            {!canStartQuiz && (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    Add at least {QUIZ_SESSION_LENGTH} words in the 'Word Bank' tab to start a quiz.
                </p>
            )}
        </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-bold ml-1">Recently Added Words</h2>
        <WordList words={words.slice(0, 5)} />
      </div>
    </div>
  );
};

export default Dashboard;
