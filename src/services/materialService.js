import api from './api';

const MaterialService = {
  
  // ================= CORE CRUD OPERATIONS ================= //
  
  /**
   * Get all materials with pagination
   */
  async getAllMaterials(page = 0, size = 10) {
    try {
      const response = await api.get(`/materials?page=${page}&size=${size}`);
      return {
        data: response.data.content || response.data,
        totalPages: response.data.totalPages || 1,
        totalElements: response.data.totalElements || 0
      };
    } catch (error) {
      console.error('Error fetching all materials:', error);
      throw error;
    }
  },

  /**
   * Get material by ID
   */
  async getMaterialById(id) {
    try {
      const response = await api.get(`/materials/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching material ${id}:`, error);
      throw error;
    }
  },

  /**
   * **MAIN METHOD: Get materials by course/classroom ID**
   * This is called by StudentMaterials.jsx
   */
  async getMaterialsByCourse(courseId) {
    try {
      console.log(`📚 [MaterialService] Fetching materials for course: ${courseId}`);
      
      // Try main endpoint first
      const response = await api.get(`/materials/classroom/${courseId}`);
      console.log('📄 Materials response:', response.data);
      
      // Handle different response formats
      let materials = Array.isArray(response.data) ? response.data : 
                     response.data.data ? response.data.data : 
                     response.data.content ? response.data.content : [];
      
      // Transform materials to ensure consistent format
      const transformedMaterials = materials.map(material => ({
        id: material.id,
        title: material.title || material.name || 'Untitled Document',
        description: material.description || '',
        fileName: material.fileName || material.originalFileName || 'unknown_file',
        originalFileName: material.originalFileName || material.fileName,
        fileSize: material.fileSize || 0,
        fileType: material.fileType || material.contentType || 'application/octet-stream',
        downloadUrl: material.downloadUrl || material.fileUrl,
        downloadCount: material.downloadCount || 0,
        createdAt: material.createdAt || material.uploadedAt,
        updatedAt: material.updatedAt,
        classroomId: material.classroomId || courseId,
        uploadedBy: material.uploadedBy || material.teacher,
        isPublic: material.isPublic !== false, // Default to true
        status: material.status || 'ACTIVE'
      }));
      
      console.log(`✅ [MaterialService] Found ${transformedMaterials.length} materials for course ${courseId}`);
      return transformedMaterials;
      
    } catch (error) {
      console.error(`❌ Error fetching materials for course ${courseId}:`, error);
      
      // Try alternative endpoints
      try {
        console.log('🔄 Trying alternative endpoint...');
        const fallbackResponse = await api.get(`/classroom-management/classrooms/${courseId}/materials`);
        const fallbackMaterials = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : [];
        
        return fallbackMaterials.map(material => ({
          id: material.id,
          title: material.title || 'Untitled Document',
          description: material.description || '',
          fileName: material.fileName || 'unknown_file',
          originalFileName: material.originalFileName || material.fileName,
          fileSize: material.fileSize || 0,
          fileType: material.fileType || 'application/octet-stream',
          downloadUrl: material.downloadUrl,
          downloadCount: material.downloadCount || 0,
          createdAt: material.createdAt,
          updatedAt: material.updatedAt,
          classroomId: courseId,
          uploadedBy: material.uploadedBy,
          isPublic: material.isPublic !== false,
          status: material.status || 'ACTIVE'
        }));
        
      } catch (fallbackError) {
        console.error('❌ Fallback endpoint also failed:', fallbackError);
        // Return empty array instead of throwing to prevent component crash
        return [];
      }
    }
  },

  /**
   * Create new material
   */
  async createMaterial(materialData) {
    try {
      const response = await api.post('/materials', materialData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  },

  /**
   * Update material
   */
  async updateMaterial(id, materialData) {
    try {
      const response = await api.put(`/materials/${id}`, materialData);
      return response.data;
    } catch (error) {
      console.error(`Error updating material ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete material
   */
  async deleteMaterial(id) {
    try {
      await api.delete(`/materials/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting material ${id}:`, error);
      throw error;
    }
  },

  // ================= FILE OPERATIONS ================= //

  /**
   * **DOWNLOAD MATERIAL - Called by StudentMaterials.jsx**
   */
  async downloadMaterial(materialId) {
    try {
      console.log(`📥 [MaterialService] Starting download for material: ${materialId}`);
      
      const response = await api.get(`/materials/${materialId}/download`, {
        responseType: 'blob',  // Important for file downloads
        headers: {
          'Accept': 'application/octet-stream'
        }
      });
      
      console.log(`✅ [MaterialService] Download successful, blob size: ${response.data.size}`);
      return response.data; // Return the blob
      
    } catch (error) {
      console.error(`❌ Error downloading material ${materialId}:`, error);
      
      // Try alternative download endpoint
      try {
        console.log('🔄 Trying alternative download endpoint...');
        const fallbackResponse = await api.get(`/files/download/${materialId}`, {
          responseType: 'blob'
        });
        
        return fallbackResponse.data;
        
      } catch (fallbackError) {
        console.error('❌ Alternative download also failed:', fallbackError);
        throw new Error(`Không thể tải xuống tài liệu. ${error.response?.data?.message || error.message}`);
      }
    }
  },

  /**
   * Upload file for material
   */
  async uploadFile(file, materialData = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add additional material data
      Object.keys(materialData).forEach(key => {
        if (materialData[key] !== null && materialData[key] !== undefined) {
          formData.append(key, materialData[key]);
        }
      });
      
      const response = await api.post('/materials/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // ================= SEARCH & FILTER OPERATIONS ================= //

  /**
   * Search materials
   */
  async searchMaterials(keyword, page = 0, size = 10) {
    try {
      const response = await api.get(`/materials/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
      return {
        data: response.data.content || response.data,
        totalPages: response.data.totalPages || 1,
        totalElements: response.data.totalElements || 0
      };
    } catch (error) {
      console.error('Error searching materials:', error);
      throw error;
    }
  },

  /**
   * Get materials by teacher
   */
  async getMaterialsByTeacher(teacherId, page = 0, size = 10) {
    try {
      const response = await api.get(`/materials/teacher/${teacherId}?page=${page}&size=${size}`);
      return {
        data: response.data.content || response.data,
        totalPages: response.data.totalPages || 1,
        totalElements: response.data.totalElements || 0
      };
    } catch (error) {
      console.error(`Error fetching materials for teacher ${teacherId}:`, error);
      throw error;
    }
  },

  /**
   * Get materials by file type
   */
  async getMaterialsByType(fileType, page = 0, size = 10) {
    try {
      const response = await api.get(`/materials/type/${fileType}?page=${page}&size=${size}`);
      return {
        data: response.data.content || response.data,
        totalPages: response.data.totalPages || 1,
        totalElements: response.data.totalElements || 0
      };
    } catch (error) {
      console.error(`Error fetching materials by type ${fileType}:`, error);
      throw error;
    }
  },

  // ================= UTILITY METHODS ================= //

  /**
   * Get file icon class based on file extension
   */
  getFileIcon(fileName) {
    if (!fileName) return 'file';
    
    const extension = fileName.split('.').pop().toLowerCase();
    const iconMap = {
      'pdf': 'file-pdf',
      'doc': 'file-word',
      'docx': 'file-word',
      'xls': 'file-excel',
      'xlsx': 'file-excel',
      'ppt': 'file-powerpoint',
      'pptx': 'file-powerpoint',
      'jpg': 'file-image',
      'jpeg': 'file-image',
      'png': 'file-image',
      'gif': 'file-image',
      'mp4': 'file-video',
      'avi': 'file-video',
      'mov': 'file-video',
      'mp3': 'file-audio',
      'wav': 'file-audio',
      'zip': 'file-archive',
      'rar': 'file-archive',
      '7z': 'file-archive'
    };
    
    return iconMap[extension] || 'file';
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Validate file type
   */
  isValidFileType(fileName, allowedTypes = []) {
    if (!fileName) return false;
    if (allowedTypes.length === 0) return true; // No restrictions
    
    const extension = fileName.split('.').pop().toLowerCase();
    return allowedTypes.includes(extension);
  },

  /**
   * Get MIME type from file extension
   */
  getMimeType(fileName) {
    if (!fileName) return 'application/octet-stream';
    
    const extension = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'mp4': 'video/mp4',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  },

  // ================= ERROR HANDLING ================= //

  /**
   * Handle API errors gracefully
   */
  handleApiError(error, defaultMessage = 'An error occurred') {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error || defaultMessage;
      
      switch (status) {
        case 401:
          return 'Authentication required. Please log in again.';
        case 403:
          return 'You do not have permission to access this material.';
        case 404:
          return 'Material not found.';
        case 413:
          return 'File size too large.';
        case 415:
          return 'File type not supported.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return message;
      }
    } else if (error.request) {
      return 'Network error. Please check your connection.';
    } else {
      return error.message || defaultMessage;
    }
  }
};

export default MaterialService;