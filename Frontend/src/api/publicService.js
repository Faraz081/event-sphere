import api from "./api";

export const fetchPublicExpos = async () => {
  const response = await api.get("/api/public/expos");
  return response.data;
};

export const fetchPublicExpo = async (id) => {
  const response = await api.get(`/api/public/expos/${id}`);
  return response.data;
};

export const fetchPublicExhibitorProfile = async (id) => {
  const response = await api.get(`/api/public/exhibitors/${id}`);
  return response.data;
};

export const fetchPublicExhibitors = async (id, params = {}) => {
  const response = await api.get(`/api/public/expos/${id}/exhibitors`, { params });
  return response.data;
};

export const fetchPublicBooths = async (id) => {
  const response = await api.get(`/api/public/expos/${id}/booths`);
  return response.data;
};

export const fetchPublicEvents = async () => {
  const response = await api.get("/api/event");
  return response.data;
};