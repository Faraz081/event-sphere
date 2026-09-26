import axios from "axios";

console.log("DEBUG - VITE_API_URL:", import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3200",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("eventsphere_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;