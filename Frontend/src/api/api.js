import axios from "axios";

console.log("DEBUG - VITE_API_URL:", import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3200",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    try {
      const token =
        localStorage.getItem("eventsphere_auth_token") ||
        localStorage.getItem("eventsphere_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error reading authentication token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
