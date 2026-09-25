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
      const stored = localStorage.getItem("eventsphere_current_user");
      if (stored) {
        const user = JSON.parse(stored);
        if (user?._id) {
          config.headers["Authorization"] = `Bearer ${user._id}`;
          config.headers["x-user-id"] = user._id;
        }
      }
    } catch (e) {
      console.error("Error reading current user for request interceptor:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;