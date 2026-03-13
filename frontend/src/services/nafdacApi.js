import { apiClient } from "./apiClient";

export const nafdacApi = {
  // Get all incidents
  getIncidents: async (status = "OPEN") => {
    return apiClient.get(`/nafdac/incidents?status=${status}`);
  },

  // Update incident status
  updateIncident: async (incidentId, status) => {
    return apiClient.patch(`/nafdac/incidents/${incidentId}/status`, {
      status,
    });
  },

  // Get hotspot data
  getHotspots: async () => {
    return apiClient.get("/nafdac/hotspots");
  },

  // Get predicted hotspots
  getPredictedHotspots: async (days = 30) => {
    return apiClient.get(`/nafdac/hotspots/predicted?days=${days}`);
  },
};
