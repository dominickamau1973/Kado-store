import axios from "axios";

// In deployment set VITE_API_BASE_URL to the backend HTTPS URL ending in /api.
// The localhost fallback is for local development only.
const baseURL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").trim();

const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
