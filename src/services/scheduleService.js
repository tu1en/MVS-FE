import apiClient from './apiClient';

const scheduleService = {
  /**
   * Fetches the timetable (schedule events) for the currently authenticated user
   * within a given date range.
   * @param {string} startDate - The start date in 'YYYY-MM-DD' format.
   * @param {string} endDate - The end date in 'YYYY-MM-DD' format.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of timetable events.
   */
  getMyTimetable: async (startDate, endDate) => {
  try {
      const response = await apiClient.get('/schedule/my-timetable', {
        params: {
          startDate,
          endDate,
        },
    });
    return response.data;
  } catch (error) {
      console.error("Error fetching timetable in scheduleService:", error);
      // Re-throw the error to be handled by the calling component
    throw error;
  }
  },
};

export default scheduleService; 