"use client";

import { createContext, useState, useEffect, useCallback } from "react";
import { adminAuthApi } from "@/services/adminApi";

export const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_user");
      if (stored) {
        setAdminUser(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load admin from localStorage:", err);
    }

    // Listen for storage changes (logout from other tabs)
    const syncUser = (e) => {
      if (e.key === "admin_user") {
        setAdminUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener("storage", syncUser);
    setIsHydrated(true);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const login = useCallback((userData, token) => {
    try {
      localStorage.setItem("admin_user", JSON.stringify(userData));
      localStorage.setItem("admin_token", token);
      setAdminUser(userData);
      setError(null);
    } catch (err) {
      console.error("Failed to save admin to localStorage:", err);
      setError("Failed to save session");
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await adminAuthApi.logout();
    } catch (err) {
      console.error("Logout API call failed:", err);
      // Still clear local data even if API call fails
    } finally {
      try {
        localStorage.removeItem("admin_user");
        localStorage.removeItem("admin_token");
        setAdminUser(null);
        setError(null);
      } catch (err) {
        console.error("Failed to clear localStorage:", err);
      }
      setIsLoading(false);
    }
  }, []);

  const hasRole = useCallback(
    (role) => {
      if (!adminUser) return false;
      if (adminUser.role === "SUPER_ADMIN") return true;
      return adminUser.role === role;
    },
    [adminUser],
  );

  const hasPermission = useCallback(
    (action) => {
      if (!adminUser) return false;

      const permissions = {
        SUPER_ADMIN: [
          "suspend_manufacturer",
          "blacklist_manufacturer",
          "escalate_nafdac",
          "view_audit_logs",
          "export_data",
          "manage_admins",
        ],
        MODERATOR: [
          "review_manufacturer",
          "approve_manufacturer",
          "review_reports",
          "create_case",
          "escalate_nafdac",
        ],
        ANALYST: ["view_dashboard", "view_reports", "view_cases"],
        SUPPORT: ["view_reports", "basic_support"],
      };

      const rolePermissions = permissions[adminUser.role] || [];
      return rolePermissions.includes(action);
    },
    [adminUser],
  );

  const value = {
    adminUser,
    isLoading,
    error,
    isHydrated,
    login,
    logout,
    hasRole,
    hasPermission,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}
