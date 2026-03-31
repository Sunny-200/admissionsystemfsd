import axios from "axios";

// Centralized Axios instance for all API calls
const API = axios.create({
  baseURL: "http://localhost:5001/api",
});

// Attach JWT token (if available) to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;