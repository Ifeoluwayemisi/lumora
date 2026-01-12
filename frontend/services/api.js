import axios from "axios";

/**
 * API Service Configuration
 *
 * Provides a centralized Axios instance with:
 * - Automatic Authorization header injection
 * - Base URL configuration from environment variables
 * - Request/response interceptors
 *
 * Environment Variables:
 * - NEXT_PUBLIC_API_URL: Backend API base URL
 */

// Validate API URL is configured
if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    "Warning: NEXT_PUBLIC_API_URL environment variable is not configured"
  );
}

// Create Axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
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
api.interceptors.request.use((config) => {
  // Only attempt to access localStorage in browser environment
  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("lumora_token");
      if (token) {
        // Attach token to Authorization header
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Failed to retrieve auth token:", error);
    }
  }
  return config;
});

/**
 * Response Interceptor
 *
 * Handles common error scenarios:
 * - 401: Token expired or invalid - could trigger logout
 * - 403: Insufficient permissions
 * - Network errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token may be expired
    if (error.response?.status === 401) {
      // TODO: Implement logout logic or redirect to login
      // You might want to trigger logout from AuthContext here
      console.warn("Unauthorized: Token may have expired");
    }

    // Handle 403 Forbidden - insufficient permissions
    if (error.response?.status === 403) {
      console.warn("Forbidden: Insufficient permissions");
    }

    // Log network errors
    if (!error.response) {
      console.error("Network error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
