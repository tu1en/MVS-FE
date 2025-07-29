import axios from 'axios';
import API_CONFIG from './api-config';

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
  },
  responseType: 'json',
  responseEncoding: 'utf8',
});

const pendingRequests = new Map();

const getRequestKey = (config) => {
  const params = { ...config.params };
  delete params._t;
  return `${config.method}:${config.url}:${JSON.stringify(params)}`;
};

const cleanupExpiredRequests = () => {
  const now = Date.now();
  for (const [key, timestamp] of pendingRequests.entries()) {
    if (now - timestamp > 5000) {
      pendingRequests.delete(key);
    }
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

//     if (config.method === 'get') {
//       config.params = { ...config.params, _t: Date.now() };

//       const requestKey = getRequestKey(config);
//       cleanupExpiredRequests();

//    // Thay vì cancel request, implement proper deduplication
// if (config.method === 'get') {
//   config.params = { ...config.params, _t: Date.now() };
  
//   const requestKey = getRequestKey(config);
//   cleanupExpiredRequests();
  
//   // Chỉ warn thay vì cancel - let request proceed
//   if (pendingRequests.has(requestKey)) {
//     const existingTimestamp = pendingRequests.get(requestKey);
//     if (Date.now() - existingTimestamp < 1000) {
//       console.warn(`Duplicate GET detected but allowing: ${requestKey}`);
//       // Don't cancel - just log and proceed
//     }
//   }
//   pendingRequests.set(requestKey, Date.now());
// }
//       pendingRequests.set(requestKey, Date.now());
//     }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.config && response.config.method === 'get') {
      const requestKey = getRequestKey(response.config);
      pendingRequests.delete(requestKey);
    }
    return response;
  },
  (error) => {
    if (error.config && error.config.method === 'get') {
      const requestKey = getRequestKey(error.config);
      pendingRequests.delete(requestKey);
    }

    if (axios.isCancel(error)) {
      // Don't treat canceled request as an error
      return Promise.reject(error);
    }

    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    switch (status) {
      case 401:
        console.error('Unauthorized:', data);
        ['token', 'user', 'role', 'username', 'userId'].forEach((key) =>
          localStorage.removeItem(key)
        );
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        break;
      case 403:
        console.error('Forbidden:', data);
        break;
      case 404:
        console.error('Not Found:', error.config?.url);
        break;
      case 500:
        console.error('Server Error:', data);
        break;
      default:
        console.error(`API error (${status}):`, data);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
