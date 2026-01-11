"use client";

import { AuthProvider } from "@/context/AuthContext";
import ThemeProvider from "@/providers/ThemeProvider";

/**
 * Providers Component
 *
 * Central location for all context providers
 * Order matters: Theme should be outermost to apply styles to all children
 *
 * Stack:
 * 1. ThemeProvider - Handles dark/light mode
 * 2. AuthProvider - Handles user authentication state
 *
 * These wrap all child components to provide global state
 */
export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
