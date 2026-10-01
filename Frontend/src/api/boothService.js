import api from "./api";

// Fetch all booths with optional filters
export const fetchBooths = async (params = {}) => {
  const response = await api.get("/api/booth", { params });
  return response.data;
};

// Fetch single booth
export const fetchBoothById = async (id) => {
  const response = await api.get(`/api/booth/${id}`);
  return response.data;
};

// Create new booth
export const createBooth = async (boothData) => {
  const response = await api.post("/api/booth", boothData);
  return response.data;
};

// Update booth
export const updateBooth = async (id, boothData) => {
  const response = await api.put(`/api/booth/${id}`, boothData);
  return response.data;
};

// Delete booth
export const deleteBooth = async (id) => {
  const response = await api.delete(`/api/booth/${id}`);
  return response.data;
};

// Fetch expos (for dropdown)
export const fetchExposForSelect = async () => {
  const response = await api.get("/api/expo");
  return response.data;
};