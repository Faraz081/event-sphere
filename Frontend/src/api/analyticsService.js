import api from "./api";

export const fetchAnalytics = async () => {
  const response = await api.get("/api/analytics");
  return response.data;
};

export const fetchExpoReport = async (expoId) => {
  const response = await api.get(`/api/analytics/expo/${expoId}`);
  return response.data;
};