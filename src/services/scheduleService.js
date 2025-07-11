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
      console.log(`📅 scheduleService.getMyTimetable: Fetching timetable from ${startDate} to ${endDate}`);
      const response = await apiClient.get('/timetable/my-timetable', {
        params: {
          startDate,
          endDate,
        },
      });
      console.log(`📅 scheduleService.getMyTimetable: Response received:`, response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching timetable in scheduleService:", error);
      console.error("   Status:", error.response?.status);
      console.error("   Data:", error.response?.data);
      // Re-throw the error to be handled by the calling component
      throw error;
    }
  },
  
  /**
   * Fetches schedules for a specific classroom
   * @param {number} classroomId - The ID of the classroom
   * @returns {Promise<Array<object>>} A promise that resolves to an array of schedule objects.
   */
  getClassroomSchedule: async (classroomId) => {
    try {
      console.log(`📅 scheduleService.getClassroomSchedule: Fetching schedules for classroom ID ${classroomId}`);
      const response = await apiClient.get(`/api/schedules/classroom/${classroomId}`);
      console.log(`📅 scheduleService.getClassroomSchedule: Response data:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching classroom schedule in scheduleService:`, error);
      throw error;
    }
  },

  /**
   * Creates sample schedules for a classroom
   * @param {number} classroomId - The ID of the classroom
   * @returns {Promise<object>} A promise that resolves to a result object.
   */
  createSampleSchedules: async (classroomId) => {
    try {
      console.log(`📅 scheduleService.createSampleSchedules: Creating sample schedules for classroom ID ${classroomId}`);
      const response = await apiClient.post(`/api/schedules/sample/${classroomId}`);
      console.log(`📅 scheduleService.createSampleSchedules: Response:`, response);
      return response.data;
    } catch (error) {
      console.error(`Error creating sample schedules in scheduleService:`, error);
      throw error;
    }
  }
};

export default scheduleService; 