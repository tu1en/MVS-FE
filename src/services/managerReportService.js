import api from './api';

/**
 * Service for handling manager reports
 */
const managerReportService = {
  /**
   * Get attendance report data
   * @param {string} period - Report period (month, quarter, year)
   * @returns {Promise<Object>} Attendance report data
   */
  getAttendanceReport: async (period = 'month') => {
    try {
      const response = await api.get(`/manager/reports/attendance?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      throw error;
    }
  },

  /**
   * Get performance report data
   * @param {string} period - Report period (semester, year)
   * @returns {Promise<Object>} Performance report data
   */
  getPerformanceReport: async (period = 'semester') => {
    try {
      const response = await api.get(`/manager/reports/performance?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching performance report:', error);
      throw error;
    }
  },

  /**
   * Get financial report data
   * @param {string} period - Report period (quarter, year)
   * @returns {Promise<Object>} Financial report data
   */
  getFinancialReport: async (period = 'quarter') => {
    try {
      const response = await api.get(`/manager/reports/financial?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching financial report:', error);
      throw error;
    }
  }
};

export default managerReportService; 