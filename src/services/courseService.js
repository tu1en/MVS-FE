import apiClient from './apiClient';

const courseService = {
  /**
   * Get all available courses
   * @returns {Promise<Array>} List of courses
   */
  getAllCourses: () => {
    return apiClient.get('/courses');
  },
};

export default courseService; 