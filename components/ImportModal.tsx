import React, { useState, useCallback } from 'react';

interface ImportModalProps {
    dictionaryName: string;
    onClose: () => void;
    onImport: (wordList: string, targetLanguage: string, onProgress: (progress: { current: number; total: number; word: string }) => void) => Promise<{ successful: number; failed: number, errors: string[] }>;
    targetLanguage: string;
}

type ImportStatus = 'idle' | 'in_progress' | 'complete';

const ImportModal: React.FC<ImportModalProps> = ({ dictionaryName, onClose, onImport, targetLanguage }) => {
    const [wordList, setWordList] = useState('');
    const [status, setStatus] = useState<ImportStatus>('idle');
    const [progress, setProgress] = useState<{ current: number; total: number; word: string } | null>(null);
    const [results, setResults] = useState<{ successful: number; failed: number, errors: string[] } | null>(null);

    const handleImportClick = useCallback(async () => {
        if (!wordList.trim()) return;
        setStatus('in_progress');
        setProgress(null);
        setResults(null);
        
        const importResults = await onImport(wordList, targetLanguage, (p) => {
            setProgress(p);
        });

        setResults(importResults);
        setStatus('complete');
    }, [wordList, onImport, targetLanguage]);

    const renderContent = () => {
        switch (status) {
            case 'in_progress':
                return (
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
                        <h3 className="text-lg font-semibold">Importing Words...</h3>
                        {progress && (
                            <div>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Processing: <span className="font-mono font-bold">{progress.word}</span>
                                </p>
                                <p className="text-sm font-medium text-sky-600 dark:text-sky-300">
                                    {progress.current} / {progress.total}
                                </p>
                            </div>
                        )}
                    </div>
                );
            case 'complete':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center">Import Complete</h3>
                        <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg text-center">
                            <p className="text-green-600 dark:text-green-400 font-bold">{results?.successful} words imported successfully.</p>
                            <p className="text-red-600 dark:text-red-400 font-bold">{results?.failed} words failed.</p>
                        </div>
                        {results && results.errors.length > 0 && (
                            <div className="max-h-32 overflow-y-auto p-2 border border-slate-200 dark:border-slate-600 rounded-md">
                               <p className="text-sm font-semibold mb-1">Error details:</p>
                               <ul className="text-xs text-slate-500 dark:text-slate-400 list-disc list-inside">
                                  {results.errors.map((err, i) => <li key={i}>{err}</li>)}
                               </ul>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition"
                        >
                            Done
                        </button>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <div className="space-y-4">
                         <div>
                            <label htmlFor="word-list" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Paste words to import (one per line):
                            </label>
                            <textarea
                                id="word-list"
                                value={wordList}
                                onChange={(e) => setWordList(e.target.value)}
                                rows={8}
                                className="mt-1 block w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                                placeholder="apple&#10;banana&#10;house"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImportClick}
                                disabled={!wordList.trim()}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-slate-400"
                            >
                                Start Import
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={status !== 'in_progress' ? onClose : undefined}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md" role="dialog" aria-modal="true" aria-labelledby="import-title" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 id="import-title" className="text-xl font-bold">Import Words to "{dictionaryName}"</h2>
                    {status !== 'in_progress' && <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-2xl font-bold">&times;</button>}
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default ImportModal;