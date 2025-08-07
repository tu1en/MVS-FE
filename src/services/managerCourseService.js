/**
 * Manager Course Service - Integration with Course System
 */
import API_CONFIG from '../config/api-config';
import api from './api';

export const managerCourseService = {
  
  /**
   * Get all course templates (Manager view)
   */
  async getAllCourseTemplates(params = {}) {
    try {
      const { search, category, level } = params;
      const queryParams = new URLSearchParams();
      
      if (search) queryParams.append('search', search);
      if (category) queryParams.append('category', category);
      if (level) queryParams.append('level', level);
      
      const response = await api.get(`${API_CONFIG.ENDPOINTS.COURSE_TEMPLATES}?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching course templates:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch course templates'
      };
    }
  },

  /**
   * Get course template details
   */
  async getCourseTemplateById(courseId) {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.COURSE_TEMPLATES_BY_ID(courseId));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching course template details:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch course template details'
      };
    }
  },

  /**
   * Create new course template (Manager role)
   */
  async createCourseTemplate(courseData) {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.COURSE_TEMPLATES, courseData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating course template:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create course template'
      };
    }
  },

  /**
   * Update existing course template (Manager role)
   */
  async updateCourseTemplate(courseId, courseData) {
    try {
      const response = await api.put(API_CONFIG.ENDPOINTS.COURSE_TEMPLATES_BY_ID(courseId), courseData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating course template:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update course template'
      };
    }
  },

  /**
   * Delete course template (Manager role)
   */
  async deleteCourseTemplate(courseId) {
    try {
      await api.delete(API_CONFIG.ENDPOINTS.COURSE_TEMPLATES_BY_ID(courseId));
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting course template:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete course template'
      };
    }
  },

  /**
   * Get course enrollment statistics
   */
  async getCourseEnrollmentStats() {
    try {
      // This would need to be implemented on backend
      // For now, return mock data
      return {
        success: true,
        data: {
          totalCourses: 0,
          totalEnrollments: 0,
          totalRevenue: 0,
          activeStudents: 0
        }
      };
    } catch (error) {
      console.error('Error fetching enrollment stats:', error);
      return {
        success: false,
        error: 'Failed to fetch enrollment statistics'
      };
    }
  },

  /**
   * Get course analytics
   */
  async getCourseAnalytics() {
    try {
      // This would need to be implemented on backend
      // For now, return mock data
      return {
        success: true,
        data: {
          popularCategories: [],
          enrollmentTrends: [],
          teacherPerformance: []
        }
      };
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      return {
        success: false,
        error: 'Failed to fetch course analytics'
      };
    }
  }
};

export default managerCourseService;