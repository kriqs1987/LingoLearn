import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  authError: string | null;
  isLoading: boolean;
  login: (username: string, password_DO_NOT_USE_IN_PROD: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password_DO_NOT_USE_IN_PROD: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  authError: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {},
});

const SESSION_STORAGE_KEY_USER = 'lingoLearnUser';
const SESSION_STORAGE_KEY_TOKEN = 'lingoLearnToken';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on initial load
    try {
      const storedUser = window.sessionStorage.getItem(SESSION_STORAGE_KEY_USER);
      const storedToken = window.sessionStorage.getItem(SESSION_STORAGE_KEY_TOKEN);
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Could not parse user from session storage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);
  
  const login = useCallback(async (username: string, password_DO_NOT_USE_IN_PROD: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
        const { user: loggedInUser, token: new_token } = await apiService.login(username, password_DO_NOT_USE_IN_PROD);
        setUser(loggedInUser);
        setToken(new_token);
        window.sessionStorage.setItem(SESSION_STORAGE_KEY_USER, JSON.stringify(loggedInUser));
        window.sessionStorage.setItem(SESSION_STORAGE_KEY_TOKEN, new_token);
    } catch (error: any) {
        setAuthError(error.message || "Invalid username or password.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, password_DO_NOT_USE_IN_PROD: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
        const { user: registeredUser, token: new_token } = await apiService.register(username, password_DO_NOT_USE_IN_PROD);
        setUser(registeredUser);
        setToken(new_token);
        window.sessionStorage.setItem(SESSION_STORAGE_KEY_USER, JSON.stringify(registeredUser));
        window.sessionStorage.setItem(SESSION_STORAGE_KEY_TOKEN, new_token);
    } catch (error: any) {
        setAuthError(error.message || "Registration failed.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthError(null);
    try {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY_USER);
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY_TOKEN);
    } catch (error) {
        console.error("Could not remove user from session storage", error);
    }
  }, []);

  if (isLoading) {
      // You might want a full-page loading spinner here
      return <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500"></div>
      </div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, authError, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
