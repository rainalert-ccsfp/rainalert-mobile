import axios from "axios";
import { getBaseURL, getTimeout } from "../config/api";

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: getTimeout(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
API.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    }
    
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check if the server is running.');
    }
    
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
    }
    
    throw new Error('An unexpected error occurred. Please try again.');
  }
);

export const registerUser = (data: any) => API.post("/register", data);
export const loginUser = (data: any) => API.post("/login", data);
export const forgotPasswordAPI = (data: any) =>
  API.post("/forgot-password", data);
export const resetPasswordAPI = (data: any) =>
  API.post("/reset-password", data);

export const getFloodReports = () => API.get("/reports");

export const reportFlood = (data: any) => API.post("/reports", data);

export default API;
