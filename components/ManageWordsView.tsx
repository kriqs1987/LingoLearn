import React, { useState } from 'react';
import { Word, Dictionary } from '../types';
import AddWordForm from './AddWordForm';
import WordList from './WordList';
import EditWordModal from './EditWordModal';
import DictionaryManager from './DictionaryManager';

interface ManageWordsViewProps {
  dictionaries: Dictionary[];
  activeDictionary: Dictionary | null;
  createDictionary: (name: string) => void;
  deleteDictionary: (id: string) => void;
  setActiveDictionary: (id: string | null) => void;
  onAddWord: (word: string) => Promise<void>;
  onDeleteWord: (wordId: string) => void;
  onUpdateWord: (wordId: string, updatedDetails: { translation: string; exampleSentence: string; }) => void;
  isLoading: boolean;
  error: string | null;
  onOpenImportModal: () => void;
}

const ManageWordsView: React.FC<ManageWordsViewProps> = ({
  dictionaries,
  activeDictionary,
  createDictionary,
  deleteDictionary,
  setActiveDictionary,
  onAddWord,
  onDeleteWord,
  onUpdateWord,
  isLoading,
  error,
  onOpenImportModal,
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
      <DictionaryManager 
        dictionaries={dictionaries}
        activeDictionaryId={activeDictionary?.id || null}
        onCreateDictionary={createDictionary}
        onDeleteDictionary={deleteDictionary}
        onSelectDictionary={setActiveDictionary}
        onOpenImportModal={onOpenImportModal}
      />

      {activeDictionary && (
        <>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg space-y-4">
                <h2 className="text-xl font-bold">Add New Word to "{activeDictionary.name}"</h2>
                <AddWordForm onAddWord={onAddWord} isLoading={isLoading} />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold ml-1">Words in "{activeDictionary.name}" ({activeDictionary.words.length})</h2>
                <WordList words={activeDictionary.words} onDelete={onDeleteWord} onEdit={handleEditClick} />
            </div>
        </>
      )}

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