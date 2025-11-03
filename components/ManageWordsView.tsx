
import React, { useState } from 'react';
import { Word } from '../types';
import AddWordForm from './AddWordForm';
import WordList from './WordList';
import EditWordModal from './EditWordModal';

interface ManageWordsViewProps {
  words: Word[];
  onAddWord: (word: string) => Promise<void>;
  onDeleteWord: (wordId: string) => void;
  onUpdateWord: (wordId: string, updatedDetails: { translation: string; exampleSentence: string; }) => void;
  isLoading: boolean;
  error: string | null;
}

const ManageWordsView: React.FC<ManageWordsViewProps> = ({
  words,
  onAddWord,
  onDeleteWord,
  onUpdateWord,
  isLoading,
  error,
}) => {
  const [wordToEdit, setWordToEdit] = useState<Word | null>(null);

  const handleEditClick = (word: Word) => {
    setWordToEdit(word);
  };

  const handleCloseModal = () => {
    setWordToEdit(null);
  };

  const handleSaveEdit = (wordId: string, updatedDetails: { translation: string; exampleSentence: string; }) => {
    onUpdateWord(wordId, updatedDetails);
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg space-y-4">
        <h2 className="text-xl font-bold">Add New Word</h2>
        <AddWordForm onAddWord={onAddWord} isLoading={isLoading} />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold ml-1">My Word Bank ({words.length})</h2>
        <WordList words={words} onDelete={onDeleteWord} onEdit={handleEditClick} />
      </div>

      {wordToEdit && (
        <EditWordModal
          word={wordToEdit}
          onSave={handleSaveEdit}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ManageWordsView;
