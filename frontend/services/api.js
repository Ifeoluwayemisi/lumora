import axios from "axios";
import { logout } from "@/lib/auth";

/**
 * API Service Configuration
 *
 * Provides a centralized Axios instance with:
 * - Automatic Authorization header injection
 * - Base URL configuration from environment variables
 * - Request/response interceptors
 * - Error handling and token refresh
 *
 * Environment Variables:
 * - NEXT_PUBLIC_API_URL: Backend API base URL (required for production)
 */

// Validate API URL is configured
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

if (!process.env.NEXT_PUBLIC_API_URL && typeof window !== "undefined") {
  console.warn(
    "⚠️  NEXT_PUBLIC_API_URL not configured. Using fallback: http://localhost:5000/api",
  );
}

// Create Axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Set reasonable timeouts to prevent hanging requests
  timeout: 30000, // 30 seconds
});

/**
 * Request Interceptor
 *
 * Automatically attaches JWT token from localStorage to all requests
 * Only runs on client-side (checks for window object)
 */
api.interceptors.request.use(
  (config) => {
    // Only attempt to access localStorage in browser environment
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem("lumora_token");
        if (token) {
          // Attach token to Authorization header
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("[API] Failed to retrieve auth token:", error);
      }
    }
    return config;
  },
  (error) => {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 *
 * Handles common error scenarios:
 * - 401: Token expired or invalid - triggers logout
 * - 403: Insufficient permissions
 * - 429: Rate limit exceeded
 * - 5xx: Server errors
 * - Network errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message;

    // Handle 401 Unauthorized - token may be expired or invalid
    if (status === 401) {
      console.warn("[API] Unauthorized (401) - Token may have expired");

      // Only trigger logout if we're on the client side
      if (typeof window !== "undefined") {
        // Clear auth data
        localStorage.removeItem("lumora_token");
        localStorage.removeItem("lumora_user");

        // Redirect to login page
        if (window.location.pathname !== "/auth/login") {
          window.location.href = "/auth/login";
        }
      }
    }

    // Handle 403 Forbidden - insufficient permissions
    if (status === 403) {
      console.warn("[API] Forbidden (403) - Insufficient permissions");
    }

    // Handle 429 Rate Limit - too many requests
    if (status === 429) {
      console.warn("[API] Rate limited (429) - Too many requests");
    }

    // Handle 5xx Server errors
    if (status >= 500) {
      console.error("[API] Server error (5xx):", message);
    }

    // Log network errors
    if (!error.response) {
      console.error("[API] Network error:", error.message);
    }

    // Log all errors for debugging
    console.error("[API] Error response:", {
      status,
      message,
      url: error.config?.url,
    });

    return Promise.reject(error);
  },
);

/**
 * Get URL for static files (e.g., QR codes, certificates)
 * Removes /api suffix from API_URL since static files are served at root
 *
 * @param {string} relativePath - Relative path from backend root (e.g., /uploads/qrcodes/code.png)
 * @returns {string} Full URL to the static file
 */
export function getStaticFileUrl(relativePath) {
  if (!relativePath) return null;

  // Remove /api suffix if present
  const baseUrl = API_URL.endsWith("/api")
    ? API_URL.slice(0, -4) // Remove last 4 characters (/api)
    : API_URL;

  return `${baseUrl}${relativePath}`;
}

export default api;
