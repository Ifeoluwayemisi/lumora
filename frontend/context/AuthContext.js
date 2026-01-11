"use client";

import { createContext, useState, useEffect } from "react";

/**
 * AuthContext
 *
 * Provides authentication state management for the entire application
 * Handles:
 * - User session persistence via localStorage
 * - Multi-tab synchronization via storage events
 * - Login/logout functionality
 * - Hydration state to prevent SSR/CSR mismatches
 */
export const AuthContext = createContext();

const STORAGE_KEYS = {
  USER: "lumora_user",
  TOKEN: "lumora_token",
};

/**
 * AuthProvider Component
 *
 * Must be wrapped in a Client Component (use "use client") to access browser APIs
 *
 * @param {React.ReactNode} children - Child components
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  /**
   * Initialize auth state from localStorage on client mount
   * Also sets up storage event listener for multi-tab synchronization
   */
  useEffect(() => {
    try {
      // Load user from localStorage
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to load user from localStorage:", error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEYS.USER);
    }

    /**
     * Handle storage changes from other tabs/windows
     * Allows real-time synchronization across browser tabs
     */
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.USER) {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch (error) {
          console.error("Failed to parse user from storage event:", error);
          setUser(null);
        }
      }
    };

    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange);

    // Mark component as hydrated (safe to use localStorage)
    setIsHydrated(true);

    // Cleanup listener on unmount
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /**
   * Login function
   * Stores user data and token in localStorage
   *
   * @param {Object} userData - User profile data
   * @param {string} token - JWT authentication token
   */
  const login = (userData, token) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      setUser(userData);
    } catch (error) {
      console.error("Failed to save user to localStorage:", error);
      // Handle quota exceeded or other storage errors
      throw new Error("Failed to save session. Please try again.");
    }
  };

  /**
   * Logout function
   * Clears user data and token from localStorage
   */
  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      setUser(null);
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  };

  /**
   * Context value object
   * isHydrated: Indicates if component has mounted and localStorage is safe to use
   * user: Current logged-in user or null
   * login: Function to authenticate user
   * logout: Function to sign out user
   */
  const value = {
    user,
    login,
    logout,
    isHydrated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
