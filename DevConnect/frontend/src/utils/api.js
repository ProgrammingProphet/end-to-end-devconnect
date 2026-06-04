import axios from "axios";

// Determine the base URL based on environment
// In development with Vite proxy, we use relative path
// In production, we use environment variable or relative path
const getBaseURL = () => {
  // For Vite, import.meta.env.DEV is true in development
  if (import.meta.env.DEV) {
    // In development, use relative path (will be proxied by Vite)
    return "/api";
  }

  // In production, use environment variable or default to /api
  return import.meta.env.VITE_API_URL || "/api";
};

const API_URL = getBaseURL();

console.log(`🔧 API configured for ${import.meta.env.MODE} mode`);
console.log(`📡 API Base URL: ${API_URL}`);

const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 second timeout
  withCredentials: false, // Set to true if you need cookies
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development only
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
        headers: config.headers,
      });
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    // Log responses in development only
    if (import.meta.env.DEV) {
      console.log(
        `✅ ${response.status} ${response.config.url}`,
        response.data,
      );
    }
    return response;
  },
  (error) => {
    // Create a standardized error object
    const customError = {
      status: error.response?.status || 500,
      url: error.config?.url,
      method: error.config?.method,
      message: "An unexpected error occurred",
      data: null,
      originalError: error,
    };

    // Handle different error scenarios
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      customError.message =
        error.response.data?.message ||
        error.response.statusText ||
        `Server error: ${error.response.status}`;
      customError.data = error.response.data;

      // Log error in development
      if (import.meta.env.DEV) {
        console.error(`❌ Response Error ${error.response.status}:`, {
          url: error.config.url,
          data: error.response.data,
          message: customError.message,
        });
      }

      // Handle 401 Unauthorized - token expired or invalid
      if (error.response.status === 401) {
        console.log("🔒 Authentication expired. Redirecting to login...");

        // Clear auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to login page if not already there
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error("🚫 Access forbidden");
        customError.message =
          "You do not have permission to perform this action";
      }

      // Handle 404 Not Found
      if (error.response.status === 404) {
        console.error("🔍 Resource not found");
        customError.message = "The requested resource was not found";
      }

      // Handle 429 Too Many Requests
      if (error.response.status === 429) {
        console.error("⏳ Rate limit exceeded");
        customError.message = "Too many requests. Please try again later.";
      }

      // Handle 500 Internal Server Error
      if (error.response.status >= 500) {
        console.error("💥 Server error:", error.response.data);
        customError.message = "Server error. Please try again later.";
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("📡 No response from server:", error.request);
      customError.message =
        "Cannot connect to server. Please check your internet connection.";
      customError.status = 0;
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("⚙️ Request setup error:", error.message);
      customError.message = "Request configuration error: " + error.message;
    }

    // You can also show toast notifications here if you want
    // But that's better handled in the components

    return Promise.reject(customError);
  },
);

// Helper methods for common API calls
API.helpers = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Set auth data after login/register
  setAuthData: (token, user) => {
    if (token) localStorage.setItem("token", token);
    if (user) localStorage.setItem("user", JSON.stringify(user));
  },

  // Clear auth data on logout
  clearAuthData: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default API;
