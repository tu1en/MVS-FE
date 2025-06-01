import api from "./api";

export const accomplishmentService = {
  /**
   * Get all accomplishments for a student
   * @param {number} studentId - The ID of the student
   * @returns {Promise} - A promise that resolves to an array of accomplishments
   */
  getStudentAccomplishments: async (studentId) => {
    try {
      const response = await api.get(
        `/api/students/${studentId}/accomplishments`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching accomplishments:", error);
      throw error;
    }
  },
};

export default accomplishmentService;
