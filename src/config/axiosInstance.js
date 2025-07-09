import axios from 'axios';
import API_CONFIG from './api-config';

// Create an Axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
  },
  timeout: 15000, // 15 seconds timeout
  responseType: 'json',
  responseEncoding: 'utf8',
});

// Add a request interceptor to include the auth token in every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (!error.response) {
      console.error('Network error or server not reachable:', error.message);
      // Handle network errors
    } else if (error.response.status === 401) {
      // Unauthorized - token expired or invalid
      console.error('Authentication error (401):', error.response.data);
      
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      
      // Redirect to login unless already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (error.response.status === 403) {
      console.error('Permission denied (403):', error.response.data);
      // Handle forbidden errors
    } else if (error.response.status === 404) {
      console.error('Resource not found (404):', error.response.data);
      // Handle not found errors
    } else {
      console.error(`API error (${error.response.status}):`, error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 