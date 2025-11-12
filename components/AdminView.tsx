import React, { useEffect, useState } from 'react';
import { LOCAL_STORAGE_DATA_KEY, LOCAL_STORAGE_USERS_KEY } from '../constants';

interface UserStats {
    username: string;
    isAdmin: boolean;
    dictionaryCount: number;
    wordCount: number;
}

const AdminView: React.FC = () => {
    const [userStats, setUserStats] = useState<UserStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const usersJSON = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
            const dataJSON = localStorage.getItem(LOCAL_STORAGE_DATA_KEY);

            const users = usersJSON ? JSON.parse(usersJSON) : [];
            const data = dataJSON ? JSON.parse(dataJSON) : {};

            const stats: UserStats[] = users.map((user: { username: string; isAdmin: boolean }) => {
                const userData = data[user.username] || { dictionaries: [] };
                const dictionaryCount = userData.dictionaries.length;
                const wordCount = userData.dictionaries.reduce((sum: number, dict: { words: any[] }) => sum + dict.words.length, 0);

                return {
                    username: user.username,
                    isAdmin: user.isAdmin,
                    dictionaryCount,
                    wordCount,
                };
            });
            setUserStats(stats);
        } catch (err: any) {
            setError("Failed to load user statistics from local storage.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Overview of all registered users and their activity.
                </p>

                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-center py-4">{error}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto">
                            <thead className="bg-slate-50 dark:bg-slate-700">
                                <tr>
                                    <th className="p-3 font-semibold text-sm">Username</th>
                                    <th className="p-3 font-semibold text-sm">Role</th>
                                    <th className="p-3 font-semibold text-sm text-center">Dictionaries</th>
                                    <th className="p-3 font-semibold text-sm text-center">Words</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userStats.map(stat => (
                                    <tr key={stat.username} className="border-b border-slate-200 dark:border-slate-700">
                                        <td className="p-3 font-medium">{stat.username}</td>
                                        <td className="p-3">
                                            {stat.isAdmin ? (
                                                <span className="px-2 py-1 text-xs font-semibold text-sky-800 bg-sky-200 dark:text-sky-200 dark:bg-sky-800 rounded-full">Admin</span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-200 dark:text-slate-200 dark:bg-slate-600 rounded-full">User</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">{stat.dictionaryCount}</td>
                                        <td className="p-3 text-center">{stat.wordCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                 {userStats.length === 0 && !isLoading && !error && (
                    <p className="text-center py-4">No users found.</p>
                )}
            </div>
        </div>
    );
};

export default AdminView;