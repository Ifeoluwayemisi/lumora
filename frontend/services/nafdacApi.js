import axios from "axios";

/**
 * NAFDAC API Service
 *
 * Provides methods for all NAFDAC endpoints:
 * - Authentication (2-step login with 2FA)
 * - Regulatory Dashboard
 * - Product monitoring
 * - Reports management
 * - Manufacturer oversight
 * - Audit logs
 * - Risk analysis
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const nafdacApi = axios.create({
  baseURL: `${API_URL}/nafdac`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor for auth token
nafdacApi.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem("nafdac_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error reading NAFDAC token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
nafdacApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== "undefined") {
        localStorage.removeItem("nafdac_token");
        localStorage.removeItem("nafdac_user");
        window.location.href = "/nafdac/login";
      }
    }
    return Promise.reject(error);
  },
);

/**
 * AUTHENTICATION
 */
export const nafdacAuthApi = {
  // Step 1: Email and password verification
  loginStep1: async (email, password) => {
    const response = await nafdacApi.post("/auth/login/step1", {
      email,
      password,
    });
    return response.data;
  },

  // Step 2: 2FA token verification
  loginStep2: async (tempToken, twoFactorCode) => {
    const response = await nafdacApi.post("/auth/login/step2", {
      tempToken,
      twoFactorCode,
    });
    return response.data;
  },

  // Get current NAFDAC staff profile
  getProfile: async () => {
    const response = await nafdacApi.get("/auth/profile");
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await nafdacApi.post("/auth/logout");
    } finally {
      localStorage.removeItem("nafdac_token");
      localStorage.removeItem("nafdac_user");
    }
  },
};

/**
 * DASHBOARD & MONITORING
 */
export const nafdacDashboardApi = {
  // Get dashboard metrics and alerts
  getMetrics: async () => {
    const response = await nafdacApi.get("/dashboard");
    return response.data;
  },

  // Get products with risk scores
  getProducts: async () => {
    const response = await nafdacApi.get("/products");
    return response.data;
  },

  // Get user reports
  getReports: async () => {
    const response = await nafdacApi.get("/reports");
    return response.data;
  },

  // Get geographic hotspots
  getHotspots: async () => {
    const response = await nafdacApi.get("/hotspots");
    return response.data;
  },

  // Get manufacturer compliance data
  getManufacturers: async () => {
    const response = await nafdacApi.get("/manufacturers");
    return response.data;
  },

  // Get risk analysis data
  getRiskAnalysis: async () => {
    const response = await nafdacApi.get("/risk-analysis");
    return response.data;
  },

  // Get audit logs
  getAuditLogs: async () => {
    const response = await nafdacApi.get("/audit-logs");
    return response.data;
  },
};

/**
 * ENFORCEMENT ACTIONS
 */
export const nafdacEnforcementApi = {
  // Flag a product for review
  flagProduct: async (productId, reason) => {
    const response = await nafdacApi.post(`/products/${productId}/flag`, {
      reason,
    });
    return response.data;
  },

  // Escalate manufacturer case
  escalateManufacturer: async (manufacturerId, level, details) => {
    const response = await nafdacApi.post(
      `/manufacturers/${manufacturerId}/escalate`,
      {
        level,
        details,
      },
    );
    return response.data;
  },

  // Create incident report
  createIncidentReport: async (data) => {
    const response = await nafdacApi.post("/reports", data);
    return response.data;
  },
};

export default nafdacApi;
