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
      const isPublicAuthRequest = /^\/api\/(login|register)(\/|$)/.test(
        config.url || ""
      );
      const token = isPublicAuthRequest
        ? null
        : localStorage.getItem("eventsphere_auth_token");

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const request = error.config;
    const sentToken = Boolean(
      request?.headers?.Authorization || request?.headers?.authorization
    );

    if (error.response?.status === 401 && sentToken) {
      localStorage.removeItem("eventsphere_auth_token");
      localStorage.removeItem("eventsphere_token");
      localStorage.removeItem("eventsphere_current_user");

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
