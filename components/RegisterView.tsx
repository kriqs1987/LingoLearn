import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { BookOpenIcon } from './Icons';

interface RegisterViewProps {
    onSwitchToLogin: () => void;
}

const RegisterView: React.FC<RegisterViewProps> = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, authError, isLoading } = useContext(AuthContext);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (isLoading) return;

    if (password !== confirmPassword) {
        setFormError("Passwords do not match.");
        return;
    }
     if (password.length < 6) {
        setFormError("Password must be at least 6 characters long.");
        return;
    }
    if (username.trim() && password.trim()) {
      register(username.trim(), password.trim());
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
             <p className="text-slate-500 dark:text-slate-400 mt-2">Create Your Account</p>
        </div>
        <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Get Started</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username-reg" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                    <div className="mt-1">
                        <input id="username-reg" name="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700" placeholder="e.g., Alex"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="password-reg" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <div className="mt-1">
                        <input id="password-reg" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700" placeholder="••••••••"/>
                    </div>
                </div>
                 <div>
                    <label htmlFor="confirm-password-reg" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                    <div className="mt-1">
                        <input id="confirm-password-reg" name="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700" placeholder="••••••••"/>
                    </div>
                </div>

                {(authError || formError) && <p className="text-sm text-red-500">{authError || formError}</p>}

                <div>
                    <button type="submit" disabled={!username.trim() || !password.trim() || isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed">
                     {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Create Account'}
                    </button>
                </div>
            </form>
             <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <button onClick={onSwitchToLogin} className="font-medium text-sky-600 hover:text-sky-500">
                   Sign In
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterView;
