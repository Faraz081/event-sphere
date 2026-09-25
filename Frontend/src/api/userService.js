import api from "./api";

/**
 * Service methods for Admin User Management
 */

// Fetch all users with search and filter queries
export const fetchUsers = async (params = {}) => {
  const response = await api.get("/api/users", { params });
  return response.data;
};

// Fetch user distribution and role statistics
export const fetchUserStats = async () => {
  const response = await api.get("/api/users/stats");
  return response.data;
};

// Fetch a single user by ID
export const fetchUserById = async (id) => {
  const response = await api.get(`/api/users/${id}`);
  return response.data;
};

// Create a new user (Admin action)
export const createUser = async (userData) => {
  const response = await api.post("/api/users", userData);
  return response.data;
};

// Update an existing user
export const updateUser = async (id, userData) => {
  const response = await api.put(`/api/users/${id}`, userData);
  return response.data;
};

// Delete a user
export const deleteUser = async (id) => {
  const response = await api.delete(`/api/users/${id}`);
  return response.data;
};
