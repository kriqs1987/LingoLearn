import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { BookOpenIcon } from './Icons';

const LoginView: React.FC = () => {
  const [username, setUsername] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <BookOpenIcon className="w-16 h-16 text-sky-500 mx-auto" />
            <h1 className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight mt-4">
            LingoLearn
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Your Personal English Coach</p>
        </div>
        <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Welcome!</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Enter your name to begin
                </label>
                <div className="mt-1">
                <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700"
                    placeholder="e.g., Alex"
                />
                </div>
            </div>

            <div>
                <button
                type="submit"
                disabled={!username.trim()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                Start Learning
                </button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
