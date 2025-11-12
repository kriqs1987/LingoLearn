import React, { useState } from 'react';
import { LOCAL_STORAGE_API_KEY } from '../constants';

interface SettingsViewProps {
    onSave: (apiKey: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onSave }) => {
    const [apiKey, setApiKey] = useState(localStorage.getItem(LOCAL_STORAGE_API_KEY) || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(apiKey.trim());
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold mb-4">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Configure your application settings here.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="api-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Gemini API Key
                        </label>
                        <input
                            id="api-key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your Gemini API key"
                            className="mt-1 block w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        />
                         <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Your API key is stored securely in your browser's local storage and is never sent to any server except Google's. 
                            You can get a key from{' '}
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">
                                Google AI Studio
                            </a>.
                        </p>
                    </div>

                    <div className="flex justify-end">
                         <button
                            type="submit"
                            disabled={!apiKey.trim()}
                            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-slate-400"
                        >
                            Save Key
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsView;
