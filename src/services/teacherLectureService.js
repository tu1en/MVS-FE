import apiClient from './apiClient';

/**
 * Service for teacher lecture-related API operations
 */
export const teacherLectureService = {
  /**
   * Get lectures for a specific classroom
   * @param {number} classroomId - The classroom ID
   * @returns {Promise<Array>} List of lectures
   */
  async getClassroomLectures(classroomId) {
    try {
      const response = await apiClient.get(`/api/lectures/classrooms/${classroomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classroom lectures:', error);
      throw error;
    }
  },

  /**
   * Get detailed information about a specific lecture
   * @param {number} lectureId - The lecture ID
   * @returns {Promise<Object>} Lecture details
   */
  async getLectureDetails(lectureId) {
    try {
      const response = await apiClient.get(`/api/lectures/${lectureId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lecture details:', error);
      throw error;
    }
  },

  /**
   * Create a new lecture
   * @param {Object} lectureData - The lecture data
   * @returns {Promise<Object>} Created lecture
   */
  async createLecture(lectureData) {
    try {
      const response = await apiClient.post('/api/lectures', lectureData);
      return response.data;
    } catch (error) {
      console.error('Error creating lecture:', error);
      throw error;
    }
  },

  /**
   * Update a lecture
   * @param {number} lectureId - The lecture ID
   * @param {Object} lectureData - The updated lecture data
   * @returns {Promise<Object>} Updated lecture
   */
  async updateLecture(lectureId, lectureData) {
    try {
      const response = await apiClient.put(`/api/lectures/${lectureId}`, lectureData);
      return response.data;
    } catch (error) {
      console.error('Error updating lecture:', error);
      throw error;
    }
  },

  /**
   * Delete a lecture
   * @param {number} lectureId - The lecture ID
   * @returns {Promise<void>}
   */
  async deleteLecture(lectureId) {
    try {
      await apiClient.delete(`/api/lectures/${lectureId}`);
    } catch (error) {
      console.error('Error deleting lecture:', error);
      throw error;
    }
  },

  /**
   * Get materials for a specific lecture
   * @param {number} lectureId - The lecture ID
   * @returns {Promise<Array>} List of materials
   */
  async getLectureMaterials(lectureId) {
    try {
      const response = await apiClient.get(`/api/lectures/${lectureId}/materials`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lecture materials:', error);
      throw error;
    }
  },

  /**
   * Add materials to a lecture
   * @param {number} lectureId - The lecture ID
   * @param {Array} materials - Array of material data
   * @returns {Promise<void>}
   */
  async addMaterialsToLecture(lectureId, materials) {
    try {
      await apiClient.post(`/api/lectures/${lectureId}/materials`, { materials });
    } catch (error) {
      console.error('Error adding materials to lecture:', error);
      throw error;
    }
  },

  /**
   * Delete a material from a lecture
   * @param {number} lectureId - The lecture ID
   * @param {number} materialId - The material ID
   * @returns {Promise<void>}
   */
  async deleteLectureMaterial(lectureId, materialId) {
    try {
      await apiClient.delete(`/api/lectures/${lectureId}/materials/${materialId}`);
    } catch (error) {
      console.error('Error deleting lecture material:', error);
      throw error;
    }
  },

  /**
   * Upload a file for lecture material
   * @param {File} file - The file to upload
   * @param {function} onUploadProgress - Progress callback
   * @returns {Promise<Object>} Upload result with file URL
   */
  async uploadLectureMaterial(file, onUploadProgress) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: onUploadProgress
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading lecture material:', error);
      throw error;
    }
  },

  /**
   * Start a livestream for a lecture
   * @param {number} lectureId - The lecture ID
   * @returns {Promise<Object>} Livestream details
   */
  async startLivestream(lectureId) {
    try {
      const response = await apiClient.post(`/api/lectures/${lectureId}/livestream/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting livestream:', error);
      throw error;
    }
  },

  /**
   * Stop a livestream for a lecture
   * @param {number} lectureId - The lecture ID
   * @returns {Promise<void>}
   */
  async stopLivestream(lectureId) {
    try {
      await apiClient.post(`/api/lectures/${lectureId}/livestream/stop`);
    } catch (error) {
      console.error('Error stopping livestream:', error);
      throw error;
    }
  },

  /**
   * Upload materials for a lecture
   * @param {FormData} formData - Form data containing files and lectureId
   * @returns {Promise<Object>} Upload result
   */
  async uploadLectureMaterials(formData) {
    try {
      const response = await apiClient.post('/api/lectures/materials/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading lecture materials:', error);
      throw error;
    }
  },

  /**
   * Get livestream status for a lecture
   * @param {number} lectureId - The lecture ID
   * @returns {Promise<Object>} Livestream status
   */
  async getLivestreamStatus(lectureId) {
    try {
      const response = await apiClient.get(`/api/lectures/${lectureId}/livestream/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching livestream status:', error);
      throw error;
    }
  }
};

export default teacherLectureService;
