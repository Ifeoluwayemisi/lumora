"use client";

import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lumora_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("[AUTHCONTEXT] Restored user from localStorage:", {
          id: parsed.id,
          email: parsed.email,
          role: parsed.role,
          roleType: typeof parsed.role,
        });
        setUser(parsed);
      } else {
        console.log("[AUTHCONTEXT] No user in localStorage");
      }
    } catch (error) {
      console.error("Failed to load user from localStorage:", error);
    }

    const syncUser = (e) => {
      if (e.key === "lumora_user") {
        console.log("[AUTHCONTEXT] Storage event - lumora_user changed");
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener("storage", syncUser);
    console.log("[AUTHCONTEXT] Hydration complete");
    setIsHydrated(true);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const login = (userData, token) => {
    try {
      console.log("[AUTHCONTEXT] login() called with userData:", {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        roleType: typeof userData.role,
      });
      
      localStorage.setItem("lumora_user", JSON.stringify(userData));
      localStorage.setItem("lumora_token", token);
      
      // Verify what was stored
      const stored = localStorage.getItem("lumora_user");
      const parsed = JSON.parse(stored);
      console.log("[AUTHCONTEXT] Stored in localStorage:", {
        id: parsed.id,
        email: parsed.email,
        role: parsed.role,
        roleType: typeof parsed.role,
      });
      
      setUser(userData);
      console.log("[AUTHCONTEXT] setUser called");
    } catch (error) {
      console.error("Failed to save user to localStorage:", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("lumora_user");
      localStorage.removeItem("lumora_token");
      setUser(null);
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isHydrated }}>
      {children}
    </AuthContext.Provider>
  );
}
