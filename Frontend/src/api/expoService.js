import api from "./api";

<<<<<<< HEAD
=======
// Fetch all expos with optional query parameters (search, status, page, limit)
>>>>>>> dup-event
export const fetchExpos = async (params = {}) => {
  const response = await api.get("/api/expo", { params });
  return response.data;
};

<<<<<<< HEAD
=======
// Fetch single expo by ID
>>>>>>> dup-event
export const fetchExpoById = async (id) => {
  const response = await api.get(`/api/expo/${id}`);
  return response.data;
};

<<<<<<< HEAD
=======
// Create a new expo
>>>>>>> dup-event
export const createExpo = async (expoData) => {
  const response = await api.post("/api/expo", expoData);
  return response.data;
};

<<<<<<< HEAD
=======
// Update an existing expo
>>>>>>> dup-event
export const updateExpo = async (id, expoData) => {
  const response = await api.put(`/api/expo/${id}`, expoData);
  return response.data;
};

<<<<<<< HEAD
export const deleteExpo = async (id) => {
  const response = await api.delete(`/api/expo/${id}`);
  return response.data;
=======
// Dedicated status change
export const updateExpoStatus = async (id, status) => {
  const response = await api.patch(`/api/expo/${id}/status`, { status });
  return response.data;
};

// Delete an expo
export const deleteExpo = async (id) => {
  const response = await api.delete(`/api/expo/${id}`);
  return response.data;
};

// Upload banner image reusing the existing /api/upload/image endpoint
export const uploadExpoBanner = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post("/api/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
>>>>>>> dup-event
};