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

// Add a response interceptor for global error handling and UTF-8 encoding fix
axiosInstance.interceptors.response.use(
  (response) => {
    // Fix Vietnamese encoding issues in response data
    if (response.data && typeof response.data === 'object') {
      response.data = fixVietnameseEncoding(response.data);
    }
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

/**
 * Fix Vietnamese encoding issues in response data
 */
function fixVietnameseEncoding(data) {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => fixVietnameseEncoding(item));
  }
  
  if (typeof data === 'object') {
    const fixed = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        fixed[key] = fixVietnameseText(value);
      } else if (typeof value === 'object') {
        fixed[key] = fixVietnameseEncoding(value);
      } else {
        fixed[key] = value;
      }
    }
    return fixed;
  }
  
  if (typeof data === 'string') {
    return fixVietnameseText(data);
  }
  
  return data;
}

/**
 * Fix common Vietnamese encoding issues in text
 */
function fixVietnameseText(text) {
  if (!text || typeof text !== 'string') return text;
  
  return text
    .replace(/Th\?/g, 'Thị')
    .replace(/th\?/g, 'thị')
    .replace(/Van h\?c/g, 'Văn học')
    .replace(/van h\?c/g, 'văn học')
    .replace(/l\?p/g, 'lớp')
    .replace(/L\?p/g, 'Lớp')
    .replace(/gi\?o/g, 'giáo')
    .replace(/Gi\?o/g, 'Giáo')
    .replace(/vi\?n/g, 'viên')
    .replace(/Vi\?n/g, 'Viên')
    .replace(/h\?c/g, 'học')
    .replace(/H\?c/g, 'Học')
    .replace(/to\?n/g, 'toán')
    .replace(/To\?n/g, 'Toán')
    .replace(/Nguy\?n/g, 'Nguyễn')
    .replace(/nguy\?n/g, 'nguyễn')
    .replace(/L\?/g, 'Lý')
    .replace(/l\?/g, 'lý')
    .replace(/B\?nh/g, 'Bình')
    .replace(/b\?nh/g, 'bình')
    .replace(/Huy/g, 'Huy') // Keep Huy as is
    .replace(/K\?/g, 'Kỹ')
    .replace(/k\?/g, 'kỹ');
}

export default axiosInstance; 