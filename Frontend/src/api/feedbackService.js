import api from "./api";

export const submitFeedback = async (feedbackData) => {
  const response = await api.post("/api/feedback", feedbackData);
  return response.data;
};

export const fetchFeedback = async (params = {}) => {
  const response = await api.get("/api/feedback", { params });
  return response.data;
};

export const updateFeedback = async (id, data) => {
  const response = await api.put(`/api/feedback/${id}`, data);
  return response.data;
};