import apiClient from './apiClient';

/**
 * Service for teacher-related API operations
 */
export const teacherService = {
  /**
   * Get teacher profile
   * @returns {Promise<Object>} Teacher profile data
   */
  async getProfile() {
    try {
      const response = await apiClient.get('/teacher/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      throw error;
    }
  },

  /**
   * Update teacher profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile data
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/teacher/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating teacher profile:', error);
      throw error;
    }
  },

  /**
   * Get teacher dashboard stats
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/teacher/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher dashboard stats:', error);
      throw error;
    }
  }
};

export default teacherService;
