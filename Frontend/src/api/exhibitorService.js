import api from "./api";

// Fetch exhibitors (with optional status filter)
export const fetchExhibitors = async (params = {}) => {
  const response = await api.get("/api/exhibitors", { params });
  return response.data;
};

// Approve exhibitor
export const approveExhibitor = async (id) => {
  const response = await api.put(`/api/exhibitors/${id}/approve`);
  return response.data;
};

// Reject exhibitor
export const rejectExhibitor = async (id) => {
  const response = await api.put(`/api/exhibitors/${id}/reject`);
  return response.data;
};

// Applications (admin)
export const fetchApplications = async (params = {}) => {
  const response = await api.get("/api/exhibitors/applications", { params });
  return response.data;
};

export const approveApplication = async (id) => {
  const response = await api.put(`/api/exhibitors/applications/${id}/approve`);
  return response.data;
};

export const rejectApplication = async (id, adminNote) => {
  const response = await api.put(`/api/exhibitors/applications/${id}/reject`, { adminNote });
  return response.data;
};