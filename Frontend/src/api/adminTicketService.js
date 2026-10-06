import api from "./api";

export const fetchExpoTickets = async (params = {}) => {
  const response = await api.get("/api/admin/tickets", { params });
  return response.data;
};

export const approveExpoTicket = async (id) => {
  const response = await api.put(`/api/admin/tickets/${id}/approve`);
  return response.data;
};

export const rejectExpoTicket = async (id, note) => {
  const response = await api.put(`/api/admin/tickets/${id}/reject`, { note });
  return response.data;
};