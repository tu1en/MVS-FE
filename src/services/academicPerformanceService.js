import api from './api';

const academicPerformanceService = {
  /**
   * Get student academic performance data
   * @returns {Promise<Object>} Academic performance data
   */
  getAcademicPerformance: async () => {
    try {
      const response = await api.get('/academic-performance/student');
      return response.data;
    } catch (error) {
      console.error('Error fetching academic performance:', error);
      throw error;
    }
  }
};

export default academicPerformanceService; 