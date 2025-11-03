
import React, { useState } from 'react';
import { Word } from '../types';

interface EditWordModalProps {
  word: Word;
  onSave: (wordId: string, updatedDetails: { translation: string; exampleSentence: string; }) => void;
  onClose: () => void;
}

const EditWordModal: React.FC<EditWordModalProps> = ({ word, onSave, onClose }) => {
  const [translation, setTranslation] = useState(word.translation);
  const [exampleSentence, setExampleSentence] = useState(word.exampleSentence);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(word.id, { translation, exampleSentence });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md" role="dialog" aria-modal="true" aria-labelledby="edit-word-title" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 id="edit-word-title" className="text-xl font-bold">Edit "{word.english}"</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-2xl font-bold">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="translation" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Translation</label>
              <input
                id="translation"
                type="text"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="mt-1 block w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label htmlFor="example" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Example Sentence</label>
              <textarea
                id="example"
                value={exampleSentence}
                onChange={(e) => setExampleSentence(e.target.value)}
                rows={3}
                className="mt-1 block w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWordModal;
