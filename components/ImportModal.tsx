import React, { useState, useCallback } from 'react';

interface ImportModalProps {
    dictionaryName: string;
    onClose: () => void;
    onImport: (wordList: string, onProgress: (progress: { current: number; total: number; word: string }) => void) => Promise<{ successful: number; failed: number, errors: string[] }>;
    onImportCSV: (csvText: string) => Promise<{ successful: number; failed: number, errors: string[] }>;
    onImportExamples: (examplesText: string) => Promise<{ successful: number; failed: number, errors: string[] }>;
}

type ImportStatus = 'idle' | 'in_progress' | 'complete';
type ImportTab = 'paste' | 'csv' | 'examples';

const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};

const ImportModal: React.FC<ImportModalProps> = ({ dictionaryName, onClose, onImport, onImportCSV, onImportExamples }) => {
    const [wordList, setWordList] = useState('');
    const [examplesText, setExamplesText] = useState('');
    const [status, setStatus] = useState<ImportStatus>('idle');
    const [progress, setProgress] = useState<{ current: number; total: number; word: string } | null>(null);
    const [results, setResults] = useState<{ successful: number; failed: number, errors: string[] } | null>(null);
    const [activeTab, setActiveTab] = useState<ImportTab>('paste');
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvError, setCsvError] = useState<string | null>(null);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                setCsvFile(file);
                setCsvError(null);
            } else {
                setCsvFile(null);
                setCsvError("Please select a valid .csv file.");
            }
        }
    }

    const handleImportClick = useCallback(async () => {
        setStatus('in_progress');
        setProgress(null);
        setResults(null);
        let importResults;

        try {
            if (activeTab === 'paste') {
                if (!wordList.trim()) {
                    setStatus('idle');
                    return;
                }
                importResults = await onImport(wordList, (p) => {
                    setProgress(p);
                });
            } else if (activeTab === 'csv') {
                if (!csvFile) {
                    setCsvError("Please select a file to import.");
                    setStatus('idle');
                    return;
                }
                const csvText = await readFileAsText(csvFile);
                importResults = await onImportCSV(csvText);
            } else { // activeTab === 'examples'
                 if (!examplesText.trim()) {
                    setStatus('idle');
                    return;
                }
                importResults = await onImportExamples(examplesText);
            }
            setResults(importResults);
        } catch (error: any) {
            setResults({ successful: 0, failed: 0, errors: [error.message || 'An unexpected error occurred.'] });
        }
        
        setStatus('complete');
    }, [wordList, onImport, onImportCSV, onImportExamples, activeTab, csvFile, examplesText]);

    const renderContent = () => {
        switch (status) {
            case 'in_progress':
                return (
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
                        <h3 className="text-lg font-semibold">
                           {activeTab === 'paste' ? 'Importing Words...' : 'Importing Data...'}
                        </h3>
                        {progress && activeTab === 'paste' && (
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
                            <p className="text-green-600 dark:text-green-400 font-bold">{results?.successful} items imported successfully.</p>
                            <p className="text-red-600 dark:text-red-400 font-bold">{results?.failed} items failed.</p>
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
                const isImportDisabled = (activeTab === 'paste' && !wordList.trim()) || 
                                         (activeTab === 'csv' && !csvFile) ||
                                         (activeTab === 'examples' && !examplesText.trim());
                return (
                    <>
                        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
                             <button onClick={() => setActiveTab('paste')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'paste' ? 'border-b-2 border-sky-500 text-sky-600 dark:text-sky-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                Paste Words
                            </button>
                             <button onClick={() => setActiveTab('examples')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'examples' ? 'border-b-2 border-sky-500 text-sky-600 dark:text-sky-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                Paste Examples
                            </button>
                            <button onClick={() => setActiveTab('csv')} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'csv' ? 'border-b-2 border-sky-500 text-sky-600 dark:text-sky-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                Upload CSV
                            </button>
                        </div>
                    
                        {activeTab === 'paste' && (
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
                                    <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
                                        This will use AI to fetch translations and examples for each word.
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'examples' && (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="example-list" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Paste full examples:
                                    </label>
                                    <textarea
                                        id="example-list"
                                        value={examplesText}
                                        onChange={(e) => setExamplesText(e.target.value)}
                                        rows={8}
                                        className="mt-1 block w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                                        placeholder="I need to book a flight.&#10;Muszę zarezerwować lot.&#10;I need to book a flight to Warsaw for the conference.&#10;&#10;Where is the nearest train station?&#10;Gdzie jest najbliższa stacja kolejowa?&#10;Excuse me, where is the nearest train station?"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
                                        Format: 3 lines per example (source, translation, sentence), separated by a blank line. No AI is used.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'csv' && (
                            <div className="space-y-2">
                                <label htmlFor="csv-file" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Upload a .csv file
                                </label>
                                <input
                                    id="csv-file"
                                    type="file"
                                    accept=".csv,text/csv"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 dark:file:bg-sky-900/50 file:text-sky-700 dark:file:text-sky-300 hover:file:bg-sky-100 dark:hover:file:bg-sky-900"
                                />
                                {csvFile && <p className="text-sm text-slate-500 dark:text-slate-400">Selected: {csvFile.name}</p>}
                                {csvError && <p className="text-sm text-red-500">{csvError}</p>}
                                <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
                                    Required columns: sourceWord, translatedWord, definition, exampleSentence, masteryLevel, lastReviewed. No AI is used.
                                </p>
                            </div>
                        )}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImportClick}
                                disabled={isImportDisabled}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-slate-400"
                            >
                                Start Import
                            </button>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={status !== 'in_progress' ? onClose : undefined}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md" role="dialog" aria-modal="true" aria-labelledby="import-title" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 id="import-title" className="text-xl font-bold">Import to "{dictionaryName}"</h2>
                    {status !== 'in_progress' && <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-2xl font-bold">&times;</button>}
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default ImportModal;