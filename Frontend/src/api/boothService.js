import api from "./api";


export const fetchBooths = async (params = {}) => {
  const response = await api.get("/api/booth", { params });
  return response.data;
};


export const fetchBoothById = async (id) => {
  const response = await api.get(`/api/booth/${id}`);
  return response.data;
};


export const createBooth = async (boothData) => {
  const response = await api.post("/api/booth", boothData);
  return response.data;
};


export const updateBooth = async (id, boothData) => {
  const response = await api.put(`/api/booth/${id}`, boothData);
  return response.data;
};


export const deleteBooth = async (id) => {
  const response = await api.delete(`/api/booth/${id}`);
  return response.data;
};


export const fetchExposForSelect = async () => {
  const response = await api.get("/api/expo");
  return response.data;
};