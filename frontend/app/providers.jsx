"use client";

import { AuthProvider } from "@/context/AuthContext";
import { AdminProvider } from "@/context/AdminContext";
import ThemeProvider from "@/providers/ThemeProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Providers Component
 *
 * Central location for all context providers
 * Order matters: Theme should be outermost to apply styles to all children
 *
 * Stack:
 * 1. ThemeProvider - Handles dark/light mode
 * 2. AuthProvider - Handles user authentication state
 * 3. AdminProvider - Handles admin authentication state
 * 4. ToastContainer - Displays toast notifications
 *
 * These wrap all child components to provide global state
 */
export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
