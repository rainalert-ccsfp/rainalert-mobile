// API Configuration
export const API_CONFIG = {
  // Development settings
  development: {
    baseURL: "http://192.168.1.17:5000", // Replace with your computer's IP address
    timeout: 10000,
  },
  // Production settings (if needed)
  production: {
    baseURL: "https://your-production-api.com", // Replace with your production API
    timeout: 15000,
  },
};

// Get current environment
export const getApiConfig = () => {
  if (__DEV__) {
    return API_CONFIG.development;
  }
  return API_CONFIG.production;
};

// Helper function to get the base URL
export const getBaseURL = () => {
  return getApiConfig().baseURL;
};

// Helper function to get timeout
export const getTimeout = () => {
  return getApiConfig().timeout;
}; 