// API Service for Security Dashboard endpoints

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Get token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// API Headers with authorization
const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "API Error" }));
    throw new Error(error.error || error.message || "API request failed");
  }
  return response.json();
};

// ============================================
// RISK SCORE ENDPOINTS
// ============================================

export const riskScoreAPI = {
  // Recalculate risk for single manufacturer
  recalculateRisk: async (manufacturerId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/security/recalculate-risk/${manufacturerId}`,
      {
        method: "POST",
        headers: getHeaders(),
      },
    );
    return handleResponse(response);
  },

  // Recalculate all risks
  recalculateAllRisks: async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/security/recalculate-all-risks`,
      {
        method: "POST",
        headers: getHeaders(),
      },
    );
    return handleResponse(response);
  },
};

// ============================================
// TRUST SCORE ENDPOINTS
// ============================================

export const trustScoreAPI = {
  // Recalculate trust for single manufacturer
  recalculateTrust: async (manufacturerId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/security/recalculate-trust/${manufacturerId}`,
      {
        method: "POST",
        headers: getHeaders(),
      },
    );
    return handleResponse(response);
  },

  // Recalculate all trusts
  recalculateAllTrusts: async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/security/recalculate-all-trust`,
      {
        method: "POST",
        headers: getHeaders(),
      },
    );
    return handleResponse(response);
  },

  // Get trust trend
  getTrustTrend: async (manufacturerId: string, days: number = 90) => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/security/trust-trend/${manufacturerId}?days=${days}`,
      {
        headers: getHeaders(),
      },
    );
    return handleResponse(response);
  },
};

// ============================================
// WEBSITE LEGITIMACY ENDPOINTS
// ============================================

export const websiteAPI = {
  // Check website legitimacy
  checkWebsite: async (manufacturerId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/security/check-website/${manufacturerId}`,
      {
        method: "POST",
        headers: getHeaders(),
      },
    );
    return handleResponse(response);
  },

  // Get website check history
  getWebsiteHistory: async (manufacturerId: string, limit: number = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/security/website-history/${manufacturerId}?limit=${limit}`,
      {
        headers: getHeaders(),
      },
    );
    return handleResponse(response);
  },

  // Recheck all websites
  recheckAllWebsites: async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/security/recheck-all-websites`,
      {
        method: "POST",
        headers: getHeaders(),
      },
    );
    return handleResponse(response);
  },
};

// ============================================
// DOCUMENT FORGERY ENDPOINTS
// ============================================

export const documentAPI = {
  // Check single document
  checkDocument: async (
    manufacturerId: string,
    documentType: string,
    filePath: string,
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/security/check-document/${manufacturerId}`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ documentType, filePath }),
      },
    );
    return handleResponse(response);
  },

  // Check all documents for manufacturer
  checkAllDocuments: async (manufacturerId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/security/check-all-documents/${manufacturerId}`,
      {
        method: "POST",
        headers: getHeaders(),
      },
    );
    return handleResponse(response);
  },

  // Get document check history
  getDocumentHistory: async (manufacturerId: string, limit: number = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/security/document-history/${manufacturerId}?limit=${limit}`,
      {
        headers: getHeaders(),
      },
    );
    return handleResponse(response);
  },
};

// ============================================
// RATE LIMIT ENDPOINTS
// ============================================

export const rateLimitAPI = {
  // Get rate limit status
  getStatus: async (userId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/security/rate-limit-status/${userId}`,
      {
        headers: getHeaders(),
      },
    );
    return handleResponse(response);
  },

  // Reset rate limit
  reset: async (userId: string, action?: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/security/reset-rate-limit/${userId}`,
      {
        method: "POST",
        headers: getHeaders(),
        body: action ? JSON.stringify({ action }) : undefined,
      },
    );
    return handleResponse(response);
  },

  // Get rate limit stats
  getStats: async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/security/rate-limit-stats`,
      {
        headers: getHeaders(),
      },
    );
    return handleResponse(response);
  },
};

// ============================================
// COMBINED CHECK ENDPOINT
// ============================================

export const securityAPI = {
  // Run full security check
  fullCheck: async (manufacturerId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/security/full-check/${manufacturerId}`,
      {
        method: "POST",
        headers: getHeaders(),
      },
    );
    return handleResponse(response);
  },
};
