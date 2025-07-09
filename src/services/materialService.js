import axiosInstance from '../config/axiosInstance';

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
      // Validate required parameters
      const classroomId = formData.get('classroomId');
      const uploadedBy = formData.get('uploadedBy');
      const file = formData.get('file');
      
      console.log('Debug uploadMaterial params:', { 
        classroomId: typeof classroomId === 'object' ? 'File object' : classroomId,
        uploadedBy,
        hasFile: !!file,
        fileType: file ? file.type : 'N/A',
        fileName: file ? file.name : 'N/A'
      });
      
      // Validate file
      if (!file) {
        throw new Error('No file attached for upload');
      }
      
      // Validate classroom ID
      if (!classroomId) {
        throw new Error('Missing classroomId parameter');
      }
      
      const parsedClassroomId = parseInt(classroomId);
      if (isNaN(parsedClassroomId)) {
        throw new Error(`Invalid classroomId parameter: ${classroomId}`);
      }
      
      // Validate user ID
      if (!uploadedBy) {
        throw new Error('Missing uploadedBy parameter');
      }
      
      const parsedUploadedBy = parseInt(uploadedBy);
      if (isNaN(parsedUploadedBy)) {
        throw new Error(`Invalid uploadedBy parameter: ${uploadedBy}`);
      }
      
      // Ensure values are integers in the FormData
      formData.set('classroomId', parsedClassroomId);
      formData.set('uploadedBy', parsedUploadedBy);
      
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

      console.log('Making API request to upload material');
      const response = await axiosInstance.post('/materials/upload', formData, config);
      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading material:', error);
      if (error.response) {
        console.error('Server error details:', error.response.data);
      }
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
      const response = await axiosInstance.get('/materials', { params });
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
      const response = await axiosInstance.get(`/materials/${materialId}`);
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
    // Array of possible endpoint patterns to try
    const endpointPatterns = [
      `/materials/${materialId}/download`,
      `/materials/download/${materialId}`,
      `/mock-materials/${materialId}/download`,
      `/mock-materials/download/${materialId}`,
      `/materials-alt/${materialId}/download`,
      `/materials-alt/download/${materialId}`
    ];
    
    let lastError = null;
    
    // Try each endpoint pattern in sequence
    for (const endpoint of endpointPatterns) {
      try {
        const response = await axiosInstance.get(endpoint, {
          responseType: 'blob'
        });
        return response.data;
      } catch (error) {
        lastError = error;
        console.log(`Tried endpoint ${endpoint}, failed with: ${error.message}`);
        // Continue to next endpoint pattern
      }
    }
    
    // If we get here, all attempts failed
    console.error('Error downloading material:', lastError);
    throw lastError;
  }

  /**
   * Get materials by course
   * @param {number} courseId - Course ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Course materials
   */
  static async getMaterialsByCourse(courseId, params = {}) {
    try {
      // Array of possible endpoints to try in order
      const endpoints = [
        `/materials/course/${courseId}`,
        `/mock-materials/course/${courseId}`,
        `/materials-alt/course/${courseId}`
      ];
      
      let lastError = null;
      
      // Try each endpoint in sequence
      for (const endpoint of endpoints) {
        try {
          const response = await axiosInstance.get(endpoint, { params });
          return response.data;
        } catch (error) {
          lastError = error;
          console.log(`Tried endpoint ${endpoint}, failed with: ${error.message}`);
          // Continue to next endpoint
        }
      }
      
      // If we get here, all attempts failed
      console.error('All material endpoints failed:', lastError);
      return []; // Return empty array for graceful degradation
    } catch (error) {
      console.error('Error fetching course materials:', error);
      // In case of complete failure, return empty array for graceful degradation
      return [];
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
      const response = await axiosInstance.get('/materials/search', { params });
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
      const response = await axiosInstance.put(`/materials/${materialId}`, updateData);
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
      const response = await axiosInstance.delete(`/materials/${materialId}`);
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
      const response = await axiosInstance.get('/materials/categories');
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
      const response = await axiosInstance.post('/materials/categories', categoryData);
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
      const response = await axiosInstance.get(`/materials/category/${categoryId}`, { params });
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
      const response = await axiosInstance.post(`/materials/${materialId}/share`, { userIds });
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
      const response = await axiosInstance.get('/materials/shared', { params });
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
      const response = await axiosInstance.get(`/materials/${materialId}/stats`);
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
      const response = await axiosInstance.post(`/materials/${materialId}/versions`, formData, {
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
      const response = await axiosInstance.get(`/materials/${materialId}/versions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching material versions:', error);
      throw error;
    }
  }
}

export default MaterialService;
