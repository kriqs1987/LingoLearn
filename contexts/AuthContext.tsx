import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

const SESSION_STORAGE_KEY = 'lingoLearnUser';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for a logged-in user in session storage on initial load
    try {
      const storedUser = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse user from session storage", error);
    }
  }, []);

  const login = useCallback((username: string) => {
    const newUser = { username };
    setUser(newUser);
    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
    } catch (error) {
        console.error("Could not save user to session storage", error);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
        console.error("Could not remove user from session storage", error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
