// Re-export apiClient from api.js for backward compatibility
import { ApiService } from './api.js';
import api from './api.js';

// Export the default api object as apiClient for compatibility
export default api;

// Also export the ApiService class
export { ApiService };