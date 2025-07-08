import axiosInstance from '../config/axiosInstance';

const academicPerformanceService = {
  /**
   * Get student academic performance data
   * @returns {Promise<Object>} Academic performance data
   */
  getAcademicPerformance: async () => {
    try {
      const response = await axiosInstance.get('/academic-performance/student');
      return response.data;
    } catch (error) {
      console.error('Error fetching academic performance:', error);
      throw error;
    }
  }
};

export default academicPerformanceService; 