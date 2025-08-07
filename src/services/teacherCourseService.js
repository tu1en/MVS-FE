/**
 * Teacher Course Service - Integration with Course System
 */
import API_CONFIG from '../config/api-config';
import api from './api';

export const teacherCourseService = {
  
  /**
   * Get all course templates available to teacher
   */
  async getCourseTemplates() {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.TEACHER_COURSE_TEMPLATES);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching teacher course templates:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch course templates'
      };
    }
  },

  /**
   * Get specific course template details
   */
  async getCourseTemplateById(courseId) {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.TEACHER_COURSE_TEMPLATE_DETAIL(courseId));
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
   * Create new course template
   */
  async createCourseTemplate(courseData) {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.TEACHER_COURSE_TEMPLATE_CREATE, courseData);
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
   * Update existing course template
   */
  async updateCourseTemplate(courseId, courseData) {
    try {
      const response = await api.put(API_CONFIG.ENDPOINTS.TEACHER_COURSE_TEMPLATE_UPDATE(courseId), courseData);
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
   * Get teacher's course enrollments
   */
  async getCourseEnrollments() {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.TEACHER_COURSE_ENROLLMENTS);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching course enrollments:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch course enrollments'
      };
    }
  }
};

export default teacherCourseService;