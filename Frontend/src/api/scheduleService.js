import api from "./api";


export const fetchSchedules = async (params = {}) => {
  const response = await api.get("/api/schedule", { params });
  return response.data;
};


export const fetchScheduleById = async (id) => {
  const response = await api.get(`/api/schedule/${id}`);
  return response.data;
};


export const createSchedule = async (scheduleData) => {
  const response = await api.post("/api/schedule", scheduleData);
  return response.data;
};


export const updateSchedule = async (id, scheduleData) => {
  const response = await api.put(`/api/schedule/${id}`, scheduleData);
  return response.data;
};


export const deleteSchedule = async (id) => {
  const response = await api.delete(`/api/schedule/${id}`);
  return response.data;
};
