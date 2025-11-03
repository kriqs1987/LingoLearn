
import React from 'react';
import { Word } from '../types';
import { MAX_MASTERY_LEVEL } from '../constants';
import { TrashIcon, PencilIcon } from './Icons';

interface WordListProps {
  words: Word[];
  onDelete?: (wordId: string) => void;
  onEdit?: (word: Word) => void;
}

const MasteryDots: React.FC<{ level: number }> = ({ level }) => (
    <div className="flex items-center gap-1">
        {Array.from({ length: MAX_MASTERY_LEVEL }).map((_, i) => (
            <div
                key={i}
                className={`w-3 h-3 rounded-full ${i < level ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}
            ></div>
        ))}
    </div>
);

const WordList: React.FC<WordListProps> = ({ words, onDelete, onEdit }) => {
  if (words.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-white dark:bg-slate-800 rounded-lg">
        <h3 className="text-lg font-semibold">Your word bank is empty!</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Add a new word to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {words.map(word => (
        <div key={word.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-grow">
            <p className="font-bold text-lg text-sky-800 dark:text-sky-300">{word.sourceWord}</p>
            <p className="text-slate-600 dark:text-slate-400">{word.translatedWord}</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 italic mt-1">"{word.exampleSentence}"</p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <MasteryDots level={word.masteryLevel} />
            {onDelete && onEdit && (
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
                <button
                  onClick={() => onEdit(word)}
                  className="p-2 text-slate-500 hover:text-sky-500 transition-colors"
                  aria-label={`Edit ${word.sourceWord}`}
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(word.id)}
                  className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                  aria-label={`Delete ${word.sourceWord}`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WordList;