import api from "./api";

export const bookEvent = async (event) => {
  const response = await api.post("/api/attendee-portal/book", { event });
  return response.data;
};

export const fetchMyRegistrations = async () => {
  const response = await api.get("/api/attendee-portal/my");
  return response.data;
};

export const bookExpoTicket = async (expo) => {
  const response = await api.post("/api/attendee-portal/book-expo", { expo });
  return response.data;
};