import api from "./api";


export const fetchExhibitors = async (params = {}) => {
  const response = await api.get("/api/exhibitors", { params });
  return response.data;
};


export const approveExhibitor = async (id) => {
  const response = await api.put(`/api/exhibitors/${id}/approve`);
  return response.data;
};


export const rejectExhibitor = async (id) => {
  const response = await api.put(`/api/exhibitors/${id}/reject`);
  return response.data;
};


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