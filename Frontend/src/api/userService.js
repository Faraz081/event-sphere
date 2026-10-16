import api from "./api";




export const fetchUsers = async (params = {}) => {
  const response = await api.get("/api/users", { params });
  return response.data;
};


export const fetchUserStats = async () => {
  const response = await api.get("/api/users/stats");
  return response.data;
};


export const fetchUserById = async (id) => {
  const response = await api.get(`/api/users/${id}`);
  return response.data;
};


export const createUser = async (userData) => {
  const response = await api.post("/api/users", userData);
  return response.data;
};


export const updateUser = async (id, userData) => {
  const response = await api.put(`/api/users/${id}`, userData);
  return response.data;
};


export const deleteUser = async (id) => {
  const response = await api.delete(`/api/users/${id}`);
  return response.data;
};
