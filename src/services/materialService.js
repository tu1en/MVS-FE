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
    try {
      console.log(`Đang tải xuống tài liệu ID: ${materialId}`);

      // Sử dụng endpoint chính xác duy nhất
      const response = await axiosInstance.get(`/materials/download/${materialId}`, {
        responseType: 'blob',
        timeout: 30000 // 30 seconds timeout for downloads
      });

      console.log(`Tải xuống thành công tài liệu ID: ${materialId}, kích thước: ${response.data.size} bytes`);

      // Kiểm tra nếu response là blob rỗng
      if (!response.data || response.data.size === 0) {
        throw new Error('File tải xuống rỗng hoặc không có nội dung');
      }

      return response.data;

    } catch (error) {
      console.error('Lỗi tải xuống tài liệu:', error);

      // Xử lý các loại lỗi khác nhau
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.headers['x-error-message'] || 'Lỗi không xác định';

        console.error(`HTTP Error ${status}:`, errorMessage);

        switch (status) {
          case 404:
            throw new Error('❌ Tài liệu không tồn tại hoặc đã bị xóa. Vui lòng liên hệ giáo viên để được hỗ trợ.');
          case 403:
            throw new Error('🔒 Bạn không có quyền truy cập tài liệu này. Vui lòng kiểm tra quyền truy cập.');
          case 500:
            throw new Error(`💥 Lỗi server: ${errorMessage}. Vui lòng thử lại sau hoặc liên hệ quản trị viên.`);
          case 413:
            throw new Error('📁 File quá lớn để tải xuống. Vui lòng liên hệ giáo viên.');
          case 429:
            throw new Error('⏰ Quá nhiều yêu cầu tải xuống. Vui lòng đợi một chút rồi thử lại.');
          default:
            throw new Error(`❌ Lỗi tải xuống (Mã lỗi: ${status}): ${errorMessage}`);
        }
      } else if (error.request) {
        console.error('Network error:', error.request);
        throw new Error('🌐 Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('⏱️ Quá thời gian chờ tải xuống. File có thể quá lớn, vui lòng thử lại.');
      } else {
        console.error('Unknown error:', error.message);
        throw new Error(`❓ Lỗi không xác định: ${error.message}. Vui lòng thử lại hoặc liên hệ hỗ trợ.`);
      }
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
      console.log(`Đang lấy danh sách tài liệu cho khóa học ID: ${courseId}`);

      // Sử dụng endpoint chính xác duy nhất
      const response = await axiosInstance.get(`/materials/course/${courseId}`, { params });

      console.log(`Lấy thành công ${response.data.length} tài liệu cho khóa học ID: ${courseId}`);
      return response.data;

    } catch (error) {
      console.error('Lỗi khi lấy danh sách tài liệu khóa học:', error);

      // Xử lý lỗi và trả về mảng rỗng để tránh crash UI
      if (error.response) {
        const status = error.response.status;
        console.error(`Lỗi HTTP ${status}: ${error.response.data?.message || 'Không xác định'}`);
      } else if (error.request) {
        console.error('Không thể kết nối đến server');
      }

      // Trả về mảng rỗng để UI có thể hiển thị "Không có tài liệu"
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
