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