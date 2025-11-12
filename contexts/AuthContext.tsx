import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { LOCAL_STORAGE_USERS_KEY } from '../constants';

interface StoredUser extends User {
    // In a real app, never store passwords in plaintext. Hashing should be done server-side.
    // For a fully local/offline app, this is a simplified approach.
    password_THIS_IS_INSECURE: string;
}

interface AuthContextType {
  user: User | null;
  authError: string | null;
  isLoading: boolean;
  login: (username: string, password_THIS_IS_INSECURE: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password_THIS_IS_INSECURE: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  authError: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {},
});

const SESSION_STORAGE_KEY_USER = 'lingoLearnUser';

const loadUsersFromStorage = (): StoredUser[] => {
    try {
        const users = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error("Failed to load users from localStorage", error);
        return [];
    }
}

const saveUsersToStorage = (users: StoredUser[]) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (error) {
        console.error("Failed to save users to localStorage", error);
    }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on initial load
    try {
      const storedUser = window.sessionStorage.getItem(SESSION_STORAGE_KEY_USER);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse user from session storage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password_THIS_IS_INSECURE: string) => {
    setIsLoading(true);
    setAuthError(null);
    const users = loadUsersFromStorage();
    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (foundUser && foundUser.password_THIS_IS_INSECURE === password_THIS_IS_INSECURE) {
        const currentUser: User = { username: foundUser.username, isAdmin: foundUser.isAdmin };
        setUser(currentUser);
        window.sessionStorage.setItem(SESSION_STORAGE_KEY_USER, JSON.stringify(currentUser));
    } else {
        setAuthError("Invalid username or password.");
    }
    setIsLoading(false);
  }, []);

  const register = useCallback(async (username: string, password_THIS_IS_INSECURE: string) => {
    setIsLoading(true);
    setAuthError(null);
    const users = loadUsersFromStorage();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        setAuthError("Username is already taken.");
        setIsLoading(false);
        return;
    }
    
    // First registered user becomes an admin
    const isAdmin = users.length === 0;
    const newUser: StoredUser = { username, password_THIS_IS_INSECURE, isAdmin };
    
    saveUsersToStorage([...users, newUser]);
    
    const currentUser: User = { username: newUser.username, isAdmin: newUser.isAdmin };
    setUser(currentUser);
    window.sessionStorage.setItem(SESSION_STORAGE_KEY_USER, JSON.stringify(currentUser));
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAuthError(null);
    try {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY_USER);
    } catch (error) {
        console.error("Could not remove user from session storage", error);
    }
  }, []);

  if (isLoading && !user) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500"></div>
      </div>;
  }

  return (
    <AuthContext.Provider value={{ user, authError, isLoading: false, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};