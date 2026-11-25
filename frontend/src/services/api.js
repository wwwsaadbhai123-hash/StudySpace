
import axios from "axios";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach authentication token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("studyspace_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Detect maintenance mode
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 503 &&
      error.response?.data?.maintenanceMode === true
    ) {
      window.dispatchEvent(
        new CustomEvent("studyspace-maintenance", {
          detail: {
            message:
              error.response.data.message ||
              "StudySpace is currently under maintenance. Please try again later.",
          },
        })
      );
    }

    return Promise.reject(error);
  }
);

export default api;
