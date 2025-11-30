import React, { useState } from 'react';
import { Dictionary } from '../types';
import { PlusIcon, ArrowUpTrayIcon, TrashIcon, ArrowDownTrayIcon, PencilIcon } from './Icons';
import { SUPPORTED_LANGUAGES } from '../constants';

interface DictionaryManagerProps {
    dictionaries: Dictionary[];
    activeDictionary: Dictionary | null;
    onCreateDictionary: (name: string, sourceLanguage: string, targetLanguage: string) => void;
    onDeleteDictionary: (id: string) => void;
    onRenameDictionary: (id: string, name: string) => void;
    onSelectDictionary: (id: string | null) => void;
    onOpenImportModal: () => void;
    onExportDictionary: () => void;
}

const DictionaryManager: React.FC<DictionaryManagerProps> = ({
    dictionaries,
    activeDictionary,
    onCreateDictionary,
    onDeleteDictionary,
    onRenameDictionary,
    onSelectDictionary,
    onOpenImportModal,
    onExportDictionary,
}) => {
    const [newDictionaryName, setNewDictionaryName] = useState('');
    const [sourceLanguage, setSourceLanguage] = useState(SUPPORTED_LANGUAGES[0]);
    const [targetLanguage, setTargetLanguage] = useState(SUPPORTED_LANGUAGES[1]);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameName, setRenameName] = useState('');
    
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDictionaryName.trim()) {
            if (sourceLanguage === targetLanguage) {
                alert("Source and target languages cannot be the same.");
                return;
            }
            onCreateDictionary(newDictionaryName.trim(), sourceLanguage, targetLanguage);
            setNewDictionaryName('');
        }
    };

    const handleStartRename = () => {
        if (activeDictionary) {
            setRenameName(activeDictionary.name);
            setIsRenaming(true);
        }
    };

    const handleRenameSubmit = () => {
        if (activeDictionary && renameName.trim()) {
            onRenameDictionary(activeDictionary.id, renameName.trim());
            setIsRenaming(false);
        }
    };

    const handleDelete = () => {
        if (activeDictionary) {
             const message = `Are you sure you want to delete the dictionary "${activeDictionary.name}"?\nThis will permanently delete all ${activeDictionary.words.length} words in it.`;
             if (window.confirm(message)) {
                 onDeleteDictionary(activeDictionary.id);
             }
        }
    };
    
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg space-y-4">
            <h2 className="text-xl font-bold">Manage Dictionaries</h2>
            
            <form onSubmit={handleCreate} className="space-y-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newDictionaryName}
                        onChange={(e) => setNewDictionaryName(e.target.value)}
                        placeholder="New dictionary name..."
                        className="flex-grow bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                    />
                    <button
                        type="submit"
                        className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition disabled:bg-slate-400"
                        disabled={!newDictionaryName.trim()}
                        aria-label="Create new dictionary"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="source-lang" className="block text-sm font-medium text-slate-700 dark:text-slate-300">From</label>
                        <select
                            id="source-lang"
                            value={sourceLanguage}
                            onChange={(e) => setSourceLanguage(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-8 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 rounded-md bg-white dark:bg-slate-700"
                        >
                            {SUPPORTED_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="target-lang" className="block text-sm font-medium text-slate-700 dark:text-slate-300">To</label>
                        <select
                            id="target-lang"
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-8 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 rounded-md bg-white dark:bg-slate-700"
                        >
                            {SUPPORTED_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                    </div>
                </div>
            </form>
            
            {dictionaries.length > 0 && (
                 <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <label htmlFor="dictionary-select" className="font-semibold">Active Dictionary:</label>
                        <div className="flex gap-2">
                            <button
                                onClick={onOpenImportModal}
                                disabled={!activeDictionary}
                                className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 px-3 rounded-lg flex items-center gap-2 transition disabled:bg-slate-400 disabled:cursor-not-allowed"
                            >
                                <ArrowUpTrayIcon className="w-4 h-4"/>
                                Import
                            </button>
                             <button
                                onClick={onExportDictionary}
                                disabled={!activeDictionary || activeDictionary.words.length === 0}
                                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-2 px-3 rounded-lg flex items-center gap-2 transition disabled:bg-slate-400 disabled:cursor-not-allowed"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4"/>
                                Export
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            id="dictionary-select"
                            value={activeDictionary?.id || ''}
                            onChange={(e) => onSelectDictionary(e.target.value)}
                            className="block w-full pl-3 pr-8 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 rounded-md bg-white dark:bg-slate-700"
                        >
                            {dictionaries.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.words.length})</option>
                            ))}
                        </select>
                        <button
                             onClick={handleStartRename}
                             disabled={!activeDictionary}
                             className="p-2 text-slate-500 hover:text-sky-500 bg-slate-200 dark:bg-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:hover:text-slate-500"
                             aria-label="Rename selected dictionary"
                        >
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={!activeDictionary}
                            className="p-2 text-slate-500 hover:text-red-500 bg-slate-200 dark:bg-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:hover:text-slate-500"
                            aria-label="Delete selected dictionary"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                 </div>
            )}
            
            {isRenaming && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setIsRenaming(false)}>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Rename Dictionary</h3>
                        <input
                            type="text"
                            value={renameName}
                            onChange={(e) => setRenameName(e.target.value)}
                            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-sky-500 focus:outline-none dark:text-white"
                            autoFocus
                            placeholder="Enter new name"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameSubmit();
                                if (e.key === 'Escape') setIsRenaming(false);
                            }}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsRenaming(false)}
                                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRenameSubmit}
                                disabled={!renameName.trim()}
                                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 transition"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DictionaryManager;