import React, { useState } from 'react';
import { Dictionary } from '../types';
import { PlusIcon, ArrowUpTrayIcon, TrashIcon } from './Icons';
import { SUPPORTED_LANGUAGES } from '../constants';

interface DictionaryManagerProps {
    dictionaries: Dictionary[];
    activeDictionaryId: string | null;
    onCreateDictionary: (name: string, sourceLanguage: string, targetLanguage: string) => void;
    onDeleteDictionary: (id: string) => void;
    onSelectDictionary: (id: string | null) => void;
    onOpenImportModal: () => void;
}

const DictionaryManager: React.FC<DictionaryManagerProps> = ({
    dictionaries,
    activeDictionaryId,
    onCreateDictionary,
    onDeleteDictionary,
    onSelectDictionary,
    onOpenImportModal
}) => {
    const [newDictionaryName, setNewDictionaryName] = useState('');
    const [sourceLanguage, setSourceLanguage] = useState(SUPPORTED_LANGUAGES[0]);
    const [targetLanguage, setTargetLanguage] = useState(SUPPORTED_LANGUAGES[1]);
    
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
                    <div className="flex items-center justify-between">
                        <label htmlFor="dictionary-select" className="font-semibold">Active Dictionary:</label>
                        <button
                            onClick={onOpenImportModal}
                            disabled={!activeDictionaryId}
                            className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 px-3 rounded-lg flex items-center gap-2 transition disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            <ArrowUpTrayIcon className="w-4 h-4"/>
                            Import Words
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <select
                            id="dictionary-select"
                            value={activeDictionaryId || ''}
                            onChange={(e) => onSelectDictionary(e.target.value)}
                            className="block w-full pl-3 pr-8 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 rounded-md bg-white dark:bg-slate-700"
                        >
                            {dictionaries.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.words.length})</option>
                            ))}
                        </select>
                        <button
                            onClick={() => {
                                if (activeDictionaryId && window.confirm('Are you sure you want to delete this dictionary and all its words?')) {
                                    onDeleteDictionary(activeDictionaryId);
                                }
                            }}
                            disabled={!activeDictionaryId}
                            className="p-2 text-slate-500 hover:text-red-500 bg-slate-200 dark:bg-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:hover:text-slate-500"
                            aria-label="Delete selected dictionary"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default DictionaryManager;