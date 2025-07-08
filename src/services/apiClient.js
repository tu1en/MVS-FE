import axios from 'axios';
import API_CONFIG from '../config/api-config.js';

/**
 * Centralized API client for making HTTP requests
 * This file provides a configured axios instance that can be imported
 * and used across the application for all API calls.
 */

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add a timestamp to prevent caching issues
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Track ongoing requests to prevent duplicates
const pendingRequests = new Map();

// Function to generate a request key
const getRequestKey = (config) => {
  return `${config.method}:${config.url}`;
};

// Add request interceptor to deduplicate requests
apiClient.interceptors.request.use(
  config => {
    // Generate a unique key for this request
    const requestKey = getRequestKey(config);
    
    // For attendance endpoints, teacher courses, and lecture endpoints, don't deduplicate as they need to be refreshed
    if (config.url && (config.url.includes('attendance') || config.url.includes('lecture') || config.url.includes('current-teacher'))) {
      return config;
    }
    
    // Check if we have a pending request with the same key
    if (pendingRequests.has(requestKey)) {
      // For other requests, we can cancel duplicates
      if (config.method === 'get') {
        const controller = new AbortController();
        config.signal = controller.signal;
        controller.abort('Duplicate request cancelled');
      }
    }
    
    // Store this request in our pending map
    pendingRequests.set(requestKey, true);
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => {
    // Remove from pending requests
    const requestKey = getRequestKey(response.config);
    pendingRequests.delete(requestKey);
    
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  async error => {
    // Remove from pending requests if there's a config
    if (error.config) {
      const requestKey = getRequestKey(error.config);
      pendingRequests.delete(requestKey);
    }
    
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized: Token is invalid or expired
          console.error("Authentication Error: Redirecting to login.");
          // Clear authentication data from storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          localStorage.removeItem('role');
          // Redirect to the login page
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden: User does not have permission
          console.error("Authorization Error: Access Denied.");
          // Optionally, you can show a notification to the user
          // For example: message.error("You don't have permission to perform this action.");
          break;
        case 404:
          // Not Found: The requested resource does not exist
          console.error("API Error 404: Resource not found.", data);
          break;
        default:
          // Handle other server errors (5xx)
          console.error(`API Error ${status}:`, data);
          break;
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error: No response received from server.', error.request);
      
      // Don't retry aborted requests
      if (error.code === 'ERR_CANCELED') {
        return Promise.reject(error);
      }
      
      // For development only: If backend is not running, don't keep retrying
      if (process.env.NODE_ENV === 'development' && error.code === 'ERR_NETWORK') {
        console.warn('Network error in development environment - backend might be down');
        return Promise.reject(error);
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error during request setup:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 