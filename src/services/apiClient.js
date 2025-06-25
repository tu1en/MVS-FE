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
  timeout: 10000,
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
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      console.error('Authentication error:', error);
      // Optionally redirect to login page
      // window.location.href = '/login';
    }
    
    // Log all API errors
    console.error('API Error:', error);
    
    return Promise.reject(error);
  }
);

export default apiClient; 