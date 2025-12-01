import React, { useState } from 'react';
import { Dictionary, Word, QuizMode } from '../types';
import ProgressBar from './ProgressBar';
import { BrainCircuitIcon } from './Icons';
import { QUIZ_SESSION_LENGTH } from '../constants';

interface DashboardProps {
  words: Word[];
  totalMastery: number;
  maxPossibleMastery: number;
  onStartQuiz: (mode: QuizMode | 'MIXED') => void;
  activeDictionary: Dictionary | null;
}

const Dashboard: React.FC<DashboardProps> = ({
  words,
  totalMastery,
  maxPossibleMastery,
  onStartQuiz,
  activeDictionary,
}) => {
  const [selectedMode, setSelectedMode] = useState<QuizMode | 'MIXED'>('MIXED');
  const canStartQuiz = words.length >= QUIZ_SESSION_LENGTH;

  return (
    <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg space-y-4">
            <div className='mb-4'>
                <h2 className="text-2xl font-bold">
                    {activeDictionary ? `Learning: ${activeDictionary.name}` : "Welcome to LingoLearn!"}
                </h2>
                {activeDictionary ? (
                    <p className="text-slate-500 dark:text-slate-400">
                        {activeDictionary.sourceLanguage} to {activeDictionary.targetLanguage}
                    </p>
                ) : (
                    <p className="text-slate-500 dark:text-slate-400">
                        Go to the 'Dictionaries' tab to create your first word list!
                    </p>
                )}
            </div>
            
            {activeDictionary && (
                <>
                    <h3 className="text-xl font-bold">Your Progress</h3>
                    <ProgressBar current={totalMastery} max={maxPossibleMastery} />
                    
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <label htmlFor="quiz-mode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Select Quiz Mode
                        </label>
                        <select
                            id="quiz-mode"
                            value={selectedMode}
                            onChange={(e) => setSelectedMode(e.target.value as QuizMode | 'MIXED')}
                            className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md bg-white dark:bg-slate-800 mb-4"
                        >
                            <option value="MIXED">Mixed Mode (Random)</option>
                            <option value={QuizMode.SELECT_TRANSLATION}>Select Translation ({activeDictionary.sourceLanguage} → {activeDictionary.targetLanguage})</option>
                            <option value={QuizMode.SELECT_SOURCE}>Select Source ({activeDictionary.targetLanguage} → {activeDictionary.sourceLanguage})</option>
                            <option value={QuizMode.TYPE_SOURCE}>Type Source ({activeDictionary.targetLanguage} → Type {activeDictionary.sourceLanguage})</option>
                            <option value={QuizMode.SPEED_CHALLENGE}>⚡ Speed Challenge (Game Mode)</option>
                        </select>

                        <button
                            onClick={() => onStartQuiz(selectedMode)}
                            disabled={!canStartQuiz}
                            className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition hover:bg-green-600 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:hover:bg-slate-400"
                        >
                            <BrainCircuitIcon className="w-6 h-6" />
                            Start Quiz
                        </button>
                    </div>

                    {!canStartQuiz && (
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                            Add at least {QUIZ_SESSION_LENGTH} words to this dictionary to start a quiz.
                        </p>
                    )}
                </>
            )}
        </div>
      

    </div>
  );
};

export default Dashboard;