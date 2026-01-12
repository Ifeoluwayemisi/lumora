"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

/**
 * ThemeProvider Wrapper Component
 *
 * Wraps next-themes to provide dark mode functionality across the app
 * Must be placed near the root of the component tree
 *
 * Configuration:
 * - attribute: "class" - Uses class attribute for theme switching
 * - defaultTheme: "system" - Respects user's OS preference
 * - enableSystem: true - Automatically detects system theme preference
 * - disableTransitionOnChange: true - Prevents flash during theme switch
 *
 * Usage:
 * - Use useTheme() hook in child components to access theme and setTheme
 * - Theme options: "light", "dark", or "system"
 */
export default function ThemeProvider({ children }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="lumora-theme"
    >
      {children}
    </NextThemeProvider>
  );
}
