import axios from "axios";

/**
 * Admin API Service
 *
 * Provides methods for all admin endpoints:
 * - Authentication (2-step login with 2FA)
 * - Dashboard analytics
 * - Manufacturer review
 * - User reports
 * - Case management
 * - Audit logs
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const adminApi = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor for auth token
adminApi.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem("admin_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Error reading admin token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

/**
 * AUTHENTICATION
 */
export const adminAuthApi = {
  // Register new admin
  register: async (email, password, firstName, lastName) => {
    const response = await adminApi.post("/auth/register", {
      email,
      password,
      firstName,
      lastName,
    });
    return response.data;
  },

  // Step 1: Email and password verification
  loginStep1: async (email, password) => {
    const response = await adminApi.post("/auth/login/step1", {
      email,
      password,
    });
    return response.data;
  },

  // Step 2: 2FA token verification
  loginStep2: async (tempToken, twoFactorCode) => {
    const response = await adminApi.post("/auth/login/step2", {
      tempToken,
      twoFactorCode,
    });
    return response.data;
  },

  // Get current admin profile
  getProfile: async () => {
    const response = await adminApi.get("/auth/profile");
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    const response = await adminApi.post("/auth/change-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await adminApi.post("/auth/logout");
    return response.data;
  },

  // List all admins (SUPER_ADMIN only)
  listAdmins: async () => {
    const response = await adminApi.get("/auth/admins");
    return response.data;
  },
};

/**
 * DASHBOARD ANALYTICS
 */
export const adminDashboardApi = {
  // Get global metrics
  getMetrics: async (period = "alltime") => {
    const response = await adminApi.get("/dashboard/metrics", {
      params: { period },
    });
    return response.data;
  },

  // Get authenticity breakdown
  getAuthenticityBreakdown: async () => {
    const response = await adminApi.get("/dashboard/authenticity");
    return response.data;
  },

  // Get verification trend (30-day)
  getTrend: async (days = 30) => {
    const response = await adminApi.get("/dashboard/trend", {
      params: { days },
    });
    return response.data;
  },

  // Get hotspots (geographic clusters)
  getHotspots: async () => {
    const response = await adminApi.get("/dashboard/hotspots");
    return response.data;
  },

  // Get high-risk manufacturers
  getHighRiskManufacturers: async () => {
    const response = await adminApi.get("/dashboard/high-risk-manufacturers");
    return response.data;
  },

  // Get AI health score
  getAIHealth: async () => {
    const response = await adminApi.get("/dashboard/ai-health");
    return response.data;
  },

  // Get AI trend (confidence over time)
  getAITrend: async (days = 30) => {
    const response = await adminApi.get("/dashboard/trend", {
      params: { days },
    });
    return response.data;
  },

  // Get false positives data
  getAIFalsePositives: async () => {
    const response = await adminApi.get("/dashboard/false-positives");
    return response.data;
  },

  // Get flagged results
  getAIFlaggedResults: async () => {
    const response = await adminApi.get("/dashboard/flagged-results");
    return response.data;
  },

  // Get critical alerts
  getAlerts: async () => {
    const response = await adminApi.get("/dashboard/alerts");
    return response.data;
  },

  // Export dashboard data
  exportDashboard: async () => {
    const response = await adminApi.get("/dashboard/export");
    return response.data;
  },
};

/**
 * MANUFACTURER REVIEW
 */
export const adminManufacturerApi = {
  // Get review queue
  getReviewQueue: async (page = 1, limit = 10, status = "pending") => {
    const response = await adminApi.get("/manufacturers/review-queue", {
      params: { page, limit, status },
    });
    return response.data;
  },

  // Get queue stats
  getQueueStats: async () => {
    const response = await adminApi.get("/manufacturers/review-queue/stats");
    return response.data;
  },

  // Get review queue stats (alias)
  getReviewQueueStats: async () => {
    const response = await adminApi.get("/manufacturers/review-queue/stats");
    return response.data;
  },

  // Get single review
  getReview: async (manufacturerId) => {
    const response = await adminApi.get(
      `/manufacturers/${manufacturerId}/review`,
    );
    return response.data;
  },

  // Get manufacturer detail (alias for getReview)
  getManufacturerDetail: async (manufacturerId) => {
    const response = await adminApi.get(
      `/manufacturers/${manufacturerId}/review`,
    );
    return response.data;
  },

  // Get admin view (full profile)
  getAdminView: async (manufacturerId) => {
    const response = await adminApi.get(
      `/manufacturers/${manufacturerId}/admin-view`,
    );
    return response.data;
  },

  // Approve manufacturer
  approve: async (manufacturerId, trustScore, reason) => {
    console.log(
      "[API_APPROVE] POST /manufacturers/" + manufacturerId + "/approve",
      { trustScore, reason },
    );
    const response = await adminApi.post(
      `/manufacturers/${manufacturerId}/approve`,
      { trustScore, reason },
    );
    console.log("[API_APPROVE] Response:", response.data);
    return response.data;
  },

  approveManufacturer: async (manufacturerId) => {
    console.log(
      "[API_APPROVE] POST /manufacturers/" + manufacturerId + "/approve",
    );
    const response = await adminApi.post(
      `/manufacturers/${manufacturerId}/approve`,
      {},
    );
    console.log("[API_APPROVE] Response:", response.data);
    return response.data;
  },

  // Reject manufacturer
  reject: async (manufacturerId, reason) => {
    console.log(
      "[API_REJECT] Calling POST /manufacturers/" +
        manufacturerId +
        "/reject with reason:",
      reason,
    );
    const response = await adminApi.post(
      `/manufacturers/${manufacturerId}/reject`,
      { reason },
    );
    console.log("[API_REJECT] Response:", response.data);
    return response.data;
  },

  rejectManufacturer: async (manufacturerId, reason) => {
    console.log(
      "[API_REJECT] Calling POST /manufacturers/" +
        manufacturerId +
        "/reject with reason:",
      reason,
    );
    const response = await adminApi.post(
      `/manufacturers/${manufacturerId}/reject`,
      { reason },
    );
    console.log("[API_REJECT] Response:", response.data);
    return response.data;
  },

  // Request additional documents
  requestDocs: async (manufacturerId, documents) => {
    const response = await adminApi.post(
      `/manufacturers/${manufacturerId}/request-docs`,
      { documents },
    );
    return response.data;
  },

  // Suspend manufacturer
  suspend: async (manufacturerId, reason) => {
    console.log(
      "[API_SUSPEND] Calling POST /manufacturers/" +
        manufacturerId +
        "/suspend with reason:",
      reason,
    );
    const response = await adminApi.post(
      `/manufacturers/${manufacturerId}/suspend`,
      { reason },
    );
    console.log("[API_SUSPEND] Response:", response.data);
    return response.data;
  },

  suspendManufacturer: async (manufacturerId, reason) => {
    console.log(
      "[API_SUSPEND] Calling POST /manufacturers/" +
        manufacturerId +
        "/suspend with reason:",
      reason,
    );
    const response = await adminApi.post(
      `/manufacturers/${manufacturerId}/suspend`,
      { reason },
    );
    console.log("[API_SUSPEND] Response:", response.data);
    return response.data;
  },

  // Force audit on manufacturer
  forceAudit: async (manufacturerId) => {
    const response = await adminApi.post(
      `/manufacturers/${manufacturerId}/audit`,
      {},
    );
    return response.data;
  },
};

/**
 * USER REPORTS
 */
export const adminReportApi = {
  // Get reports queue
  getReports: async (page = 1, limit = 10, status = "NEW") => {
    const response = await adminApi.get("/reports", {
      params: { page, limit, status },
    });
    return response.data;
  },

  // Get single report
  getReport: async (reportId) => {
    const response = await adminApi.get(`/reports/${reportId}`);
    return response.data;
  },

  // Get report stats
  getStats: async () => {
    const response = await adminApi.get("/reports/stats");
    return response.data;
  },

  // Get report stats (alias)
  getReportsStats: async () => {
    const response = await adminApi.get("/reports/stats");
    return response.data;
  },

  // Get reports by risk level
  getRiskBreakdown: async () => {
    const response = await adminApi.get("/reports/risk-breakdown");
    return response.data;
  },

  // Get hotspots (geographic clusters)
  getHotspots: async () => {
    const response = await adminApi.get("/reports/hotspots");
    return response.data;
  },

  // Review report and set risk level
  reviewReport: async (reportId, status, notes) => {
    const response = await adminApi.post(`/reports/${reportId}/review`, {
      status,
      notes,
    });
    return response.data;
  },

  // Link report to case
  linkToCase: async (reportId, caseId) => {
    const response = await adminApi.post(`/reports/${reportId}/link-case`, {
      caseId,
    });
    return response.data;
  },

  // Dismiss report
  dismissReport: async (reportId, reason) => {
    const response = await adminApi.post(`/reports/${reportId}/dismiss`, {
      reason,
    });
    return response.data;
  },

  // Escalate to NAFDAC
  escalateToNAFDAC: async (reportId, notes) => {
    const response = await adminApi.post(`/reports/${reportId}/escalate-nafdac`, {
      notes,
    });
    return response.data;
  },
};

/**
 * CASE MANAGEMENT
 */
export const adminCaseApi = {
  // Get cases
  getCases: async (page = 1, limit = 10, status = "open") => {
    const response = await adminApi.get("/cases", {
      params: { page, limit, status },
    });
    return response.data;
  },

  // Create case
  createCase: async (data) => {
    const response = await adminApi.post("/cases", data);
    return response.data;
  },

  // Get single case
  getCase: async (caseId) => {
    const response = await adminApi.get(`/cases/${caseId}`);
    return response.data;
  },

  // Get case stats
  getStats: async () => {
    const response = await adminApi.get("/cases/stats");
    return response.data;
  },

  // Get case stats (alias)
  getCaseStats: async () => {
    const response = await adminApi.get("/cases/stats");
    return response.data;
  },

  // Search cases
  searchCases: async (query) => {
    const response = await adminApi.get("/cases/search", {
      params: { q: query },
    });
    return response.data;
  },

  // Update case status
  updateStatus: async (caseId, newStatus, reason) => {
    const response = await adminApi.post(`/cases/${caseId}/status`, {
      newStatus,
      reason,
    });
    return response.data;
  },

  // Update case status (alias)
  updateCaseStatus: async (caseId, data) => {
    const response = await adminApi.post(`/cases/${caseId}/status`, data);
    return response.data;
  },

  // Add note to case
  addNote: async (caseId, content, isInternal = true) => {
    const response = await adminApi.post(`/cases/${caseId}/notes`, {
      content,
      isInternal,
    });
    return response.data;
  },

  // Add note to case (alias)
  addCaseNote: async (caseId, data) => {
    const response = await adminApi.post(`/cases/${caseId}/notes`, data);
    return response.data;
  },
      isInternal,
    });
    return response.data;
  },

  // Escalate to NAFDAC
  escalateNAFDAC: async (caseId, evidenceBundle) => {
    const response = await adminApi.post(`/cases/${caseId}/escalate-nafdac`, {
      evidenceBundle,
    });
    return response.data;
  },
};

/**
 * AUDIT LOGS
 */
export const adminAuditApi = {
  // Get all audit logs
  getLogs: async (
    page = 1,
    limit = 20,
    filterAction,
    filterAdmin,
    startDate,
    endDate,
  ) => {
    const params = { page, limit };
    if (filterAction) params.action = filterAction;
    if (filterAdmin) params.adminId = filterAdmin;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await adminApi.get("/audit-logs", { params });
    return response.data;
  },

  // Get logs for specific resource
  getResourceLogs: async (resourceType, resourceId) => {
    const response = await adminApi.get(
      `/audit-logs/${resourceType}/${resourceId}`,
    );
    return response.data;
  },

  // Get logs for specific admin
  getAdminLogs: async (adminId) => {
    const response = await adminApi.get(`/audit-logs/admin/${adminId}`);
    return response.data;
  },

  // Check for suspicious activity
  checkSuspiciousActivity: async (adminId) => {
    const response = await adminApi.post(`/audit-logs/suspicious/${adminId}`);
    return response.data;
  },

  // Export logs
  exportLogs: async (dateFrom, dateTo) => {
    const response = await adminApi.get("/audit-logs/export", {
      params: { dateFrom, dateTo },
    });
    return response.data;
  },
};

export const adminUsersApi = {
  // Get all users with filtering
  getUsers: async (filters = {}) => {
    const response = await adminApi.get("/users", { params: filters });
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await adminApi.get("/users/stats");
    return response.data;
  },

  // Get single user details
  getUser: async (userId) => {
    const response = await adminApi.get(`/users/${userId}`);
    return response.data;
  },

  // Suspend user account
  suspendUser: async (userId, data) => {
    const response = await adminApi.post(`/users/${userId}/suspend`, data);
    return response.data;
  },

  // Unsuspend/restore user account
  unsuspendUser: async (userId) => {
    const response = await adminApi.post(`/users/${userId}/unsuspend`);
    return response.data;
  },

  // Flag user for review
  flagUser: async (userId, data) => {
    const response = await adminApi.post(`/users/${userId}/flag`, data);
    return response.data;
  },

  // Unflag user
  unflagUser: async (userId) => {
    const response = await adminApi.post(`/users/${userId}/unflag`);
    return response.data;
  },
};

export const adminSettingsApi = {
  // Get admin settings
  getSettings: async () => {
    const response = await adminApi.get("/admin/settings");
    return response.data;
  },

  // Update admin settings
  updateSettings: async (settings) => {
    const response = await adminApi.put("/admin/settings", settings);
    return response.data;
  },

  // Reset settings to defaults
  resetSettings: async () => {
    const response = await adminApi.post("/admin/settings/reset");
    return response.data;
  },
};

export default adminApi;
