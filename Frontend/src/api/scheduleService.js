import api from "./api";

// Fetch all schedules with optional filters (expo, search)
export const fetchSchedules = async (params = {}) => {
  const response = await api.get("/api/schedule", { params });
  return response.data;
};

// Fetch single schedule by ID
export const fetchScheduleById = async (id) => {
  const response = await api.get(`/api/schedule/${id}`);
  return response.data;
};

// Create a new schedule session
export const createSchedule = async (scheduleData) => {
  const response = await api.post("/api/schedule", scheduleData);
  return response.data;
};

// Update an existing schedule session
export const updateSchedule = async (id, scheduleData) => {
  const response = await api.put(`/api/schedule/${id}`, scheduleData);
  return response.data;
};

// Delete a schedule session
export const deleteSchedule = async (id) => {
  const response = await api.delete(`/api/schedule/${id}`);
  return response.data;
};
