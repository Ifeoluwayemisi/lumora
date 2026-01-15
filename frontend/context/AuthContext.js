'use client';

import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lumora_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load user from localStorage:', error);
    }

    const syncUser = (e) => {
      if (e.key === 'lumora_user') {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener('storage', syncUser);
    setIsHydrated(true);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  const login = (userData, token) => {
    try {
      localStorage.setItem('lumora_user', JSON.stringify(userData));
      localStorage.setItem('lumora_token', token);
      setUser(userData);
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('lumora_user');
      localStorage.removeItem('lumora_token');
      setUser(null);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isHydrated }}>
      {children}
    </AuthContext.Provider>
  );
}
