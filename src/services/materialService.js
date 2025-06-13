import axios from 'axios';
import API_CONFIG from '../config/api-config.js';

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000, // Longer timeout for file operations
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
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Material Service for handling course materials and file operations
 */
class MaterialService {

  /**
   * Upload a new material
   * @param {FormData} formData - File data with metadata
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<Object>} Upload result
   */
  static async uploadMaterial(formData, onProgress = null) {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        };
      }

      const response = await apiClient.post('/materials/upload', formData, config);
      return response.data;
    } catch (error) {
      console.error('Error uploading material:', error);
      throw error;
    }
  }

  /**
   * Get all materials with pagination and filtering
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Materials list with pagination
   */
  static async getMaterials(params = {}) {
    try {
      const response = await apiClient.get('/materials', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  }

  /**
   * Get material by ID
   * @param {number} materialId - Material ID
   * @returns {Promise<Object>} Material details
   */
  static async getMaterialById(materialId) {
    try {
      const response = await apiClient.get(`/materials/${materialId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching material:', error);
      throw error;
    }
  }

  /**
   * Download a material
   * @param {number} materialId - Material ID
   * @returns {Promise<Blob>} File blob
   */
  static async downloadMaterial(materialId) {
    try {
      const response = await apiClient.get(`/materials/${materialId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading material:', error);
      throw error;
    }
  }

  /**
   * Get materials by course
   * @param {number} courseId - Course ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Course materials
   */
  static async getMaterialsByCourse(courseId, params = {}) {
    try {
      const response = await apiClient.get(`/materials/course/${courseId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching course materials:', error);
      throw error;
    }
  }

  /**
   * Search materials
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Search results
   */
  static async searchMaterials(query, filters = {}) {
    try {
      const params = { query, ...filters };
      const response = await apiClient.get('/materials/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching materials:', error);
      throw error;
    }
  }

  /**
   * Update material metadata
   * @param {number} materialId - Material ID
   * @param {Object} updateData - Updated material data
   * @returns {Promise<Object>} Updated material
   */
  static async updateMaterial(materialId, updateData) {
    try {
      const response = await apiClient.put(`/materials/${materialId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating material:', error);
      throw error;
    }
  }

  /**
   * Delete a material
   * @param {number} materialId - Material ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteMaterial(materialId) {
    try {
      const response = await apiClient.delete(`/materials/${materialId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }

  /**
   * Get material categories
   * @returns {Promise<Array>} List of categories
   */
  static async getCategories() {
    try {
      const response = await apiClient.get('/materials/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Create new category
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Created category
   */
  static async createCategory(categoryData) {
    try {
      const response = await apiClient.post('/materials/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Get materials by category
   * @param {number} categoryId - Category ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Materials in category
   */
  static async getMaterialsByCategory(categoryId, params = {}) {
    try {
      const response = await apiClient.get(`/materials/category/${categoryId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching materials by category:', error);
      throw error;
    }
  }

  /**
   * Share material with users
   * @param {number} materialId - Material ID
   * @param {Array} userIds - List of user IDs to share with
   * @returns {Promise<Object>} Share result
   */
  static async shareMaterial(materialId, userIds) {
    try {
      const response = await apiClient.post(`/materials/${materialId}/share`, { userIds });
      return response.data;
    } catch (error) {
      console.error('Error sharing material:', error);
      throw error;
    }
  }

  /**
   * Get shared materials for current user
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Shared materials
   */
  static async getSharedMaterials(params = {}) {
    try {
      const response = await apiClient.get('/materials/shared', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching shared materials:', error);
      throw error;
    }
  }

  /**
   * Get material usage statistics
   * @param {number} materialId - Material ID
   * @returns {Promise<Object>} Usage statistics
   */
  static async getMaterialStats(materialId) {
    try {
      const response = await apiClient.get(`/materials/${materialId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching material stats:', error);
      throw error;
    }
  }

  /**
   * Create material version (for updates)
   * @param {number} materialId - Original material ID
   * @param {FormData} formData - New version file data
   * @returns {Promise<Object>} New version result
   */
  static async createMaterialVersion(materialId, formData) {
    try {
      const response = await apiClient.post(`/materials/${materialId}/versions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating material version:', error);
      throw error;
    }
  }

  /**
   * Get material versions
   * @param {number} materialId - Material ID
   * @returns {Promise<Array>} List of material versions
   */
  static async getMaterialVersions(materialId) {
    try {
      const response = await apiClient.get(`/materials/${materialId}/versions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching material versions:', error);
      throw error;
    }
  }
}

export default MaterialService;
