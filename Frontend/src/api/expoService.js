import api from "./api";

export const fetchExpos = async (params = {}) => {
  const response = await api.get("/api/expo", { params });
  return response.data;
};

export const fetchExpoById = async (id) => {
  const response = await api.get(`/api/expo/${id}`);
  return response.data;
};

export const createExpo = async (expoData) => {
  const response = await api.post("/api/expo", expoData);
  return response.data;
};

export const updateExpo = async (id, expoData) => {
  const response = await api.put(`/api/expo/${id}`, expoData);
  return response.data;
};

export const deleteExpo = async (id) => {
  const response = await api.delete(`/api/expo/${id}`);
  return response.data;
};