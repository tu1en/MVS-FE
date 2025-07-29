import apiClient from './apiClient';

/**
 * Service for teacher-related API operations
 */
export const teacherClassroomService = {
  /**
   * Get classrooms for the current teacher
   * @returns {Promise<Array>} List of classrooms
   */
  async getMyClassrooms() {
    try {
      // ✅ FIX: Loại bỏ /api từ đầu vì apiClient đã có baseURL: /api
      const response = await apiClient.get('/classroom-management/classrooms/current-teacher');
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher classrooms:', error);
      throw error;
    }
  },

  /**
   * Get detailed information about a specific classroom
   * @param {number} classroomId - The classroom ID
   * @returns {Promise<Object>} Classroom details
   */
  async getClassroomDetails(classroomId) {
    try {
      // ✅ FIX: Loại bỏ /api từ đầu
      const response = await apiClient.get(`/classrooms/${classroomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classroom details:', error);
      throw error;
    }
  },

  /**
   * Get students in a specific classroom
   * @param {number} classroomId - The classroom ID
   * @returns {Promise<Array>} List of students
   */
  async getClassroomStudents(classroomId) {
    try {
      const response = await apiClient.get(`/classrooms/${classroomId}/students`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classroom students:', error);
      throw error;
    }
  },

  /**
   * Get assignments for a specific classroom
   * @param {number} classroomId - The classroom ID
   * @returns {Promise<Array>} List of assignments
   */
  async getClassroomAssignments(classroomId) {
    try {
      const response = await apiClient.get(`/assignments/classroom/${classroomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classroom assignments:', error);
      throw error;
    }
  },

  /**
   * Create a new classroom
   * @param {Object} classroomData - The classroom data
   * @returns {Promise<Object>} Created classroom
   */
  async createClassroom(classroomData) {
    try {
      const response = await apiClient.post('/classrooms', classroomData);
      return response.data;
    } catch (error) {
      console.error('Error creating classroom:', error);
      throw error;
    }
  },

  /**
   * Update a classroom
   * @param {number} classroomId - The classroom ID
   * @param {Object} classroomData - The updated classroom data
   * @returns {Promise<Object>} Updated classroom
   */
  async updateClassroom(classroomId, classroomData) {
    try {
      const response = await apiClient.put(`/classrooms/${classroomId}`, classroomData);
      return response.data;
    } catch (error) {
      console.error('Error updating classroom:', error);
      throw error;
    }
  },

  /**
   * Delete a classroom
   * @param {number} classroomId - The classroom ID
   * @returns {Promise<void>}
   */
  async deleteClassroom(classroomId) {
    try {
      await apiClient.delete(`/classrooms/${classroomId}`);
    } catch (error) {
      console.error('Error deleting classroom:', error);
      throw error;
    }
  },

  /**
   * Enroll a student in a classroom
   * @param {number} classroomId - The classroom ID
   * @param {number} studentId - The student ID
   * @returns {Promise<void>}
   */
  async enrollStudent(classroomId, studentId) {
    try {
      await apiClient.post(`/classrooms/${classroomId}/enrollments`, { studentId });
    } catch (error) {
      console.error('Error enrolling student:', error);
      throw error;
    }
  },

  /**
   * Get teaching history for the current teacher
   * @param {AbortSignal} signal - Optional AbortSignal for request cancellation
   * @returns {Promise<Array>} List of teaching history records
   */
  async getTeachingHistory(signal) {
    try {
      // ✅ FIX: Loại bỏ /api từ đầu
      const response = await apiClient.get('/teacher/teaching-history', {
        signal: signal // Pass the AbortSignal to axios
      });
      return response.data;
    } catch (error) {
      // Check if the error is due to an aborted request
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        console.log('Teaching history request was cancelled');
      } else {
        console.error('Error fetching teaching history:', error);
      }
      throw error;
    }
  }
};

export default teacherClassroomService;