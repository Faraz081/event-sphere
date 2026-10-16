import api from "./api";

export const submitContactMessage = async (message) => {
  const response = await api.post("/api/contact", message);
  return response.data;
};

export const fetchContactMessages = async () => {
  const response = await api.get("/api/contact");
  return response.data;
};
