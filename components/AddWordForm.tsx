

import React, { useState } from 'react';
import { PlusIcon } from './Icons';

interface AddWordFormProps {
  onAddWord: (word: string) => Promise<void>;
  isLoading: boolean;
  sourceLanguage: string;
}

const AddWordForm: React.FC<AddWordFormProps> = ({ onAddWord, isLoading, sourceLanguage }) => {
  const [newWord, setNewWord] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWord.trim() && !isLoading) {
      onAddWord(newWord.trim().toLowerCase());
      setNewWord('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={newWord}
        onChange={(e) => setNewWord(e.target.value)}
        placeholder={`Add a new ${sourceLanguage} word...`}
        className="flex-grow bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition disabled:bg-slate-400 disabled:cursor-not-allowed"
        disabled={isLoading || !newWord.trim()}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <PlusIcon className="w-5 h-5" />
        )}
      </button>
    </form>
  );
};

export default AddWordForm;