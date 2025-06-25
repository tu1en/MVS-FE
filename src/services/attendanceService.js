import apiClient from './apiClient';

const API_URL = '/api/attendance';

/**
 * Service for attendance-related API calls
 */
const attendanceService = {
  /**
   * Get attendance sessions for a teacher
   * @param {number} teacherId - The teacher's ID
   * @returns {Promise} Promise containing attendance sessions
   */
  getTeacherSessions: async (teacherId) => {
    try {
      const response = await apiClient.get(`${API_URL}/teacher/${teacherId}/sessions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher sessions:', error);
      return [];
    }
  },

  /**
   * Get attendance sessions for a student
   * @param {number} studentId - The student's ID
   * @returns {Promise} Promise containing attendance sessions
   */
  getStudentSessions: async (studentId) => {
    try {
      const response = await apiClient.get(`${API_URL}/student/${studentId}/sessions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student sessions:', error);
      return [];
    }
  },

  /**
   * Get classrooms for a teacher
   * @param {number} teacherId - The teacher's ID
   * @returns {Promise} Promise containing classrooms
   */
  getTeacherClassrooms: async (teacherId) => {
    try {
      const response = await apiClient.get(`/api/classrooms/teacher/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher classrooms:', error);
      return [];
    }
  },

  /**
   * Get attendance records for a teacher's sessions
   * @param {number} teacherId - The teacher's ID
   * @returns {Promise} Promise containing attendance records
   */
  getTeacherAttendanceRecords: async (teacherId) => {
    try {
      const response = await apiClient.get(`${API_URL}/teacher/${teacherId}/records`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher attendance records:', error);
      return [];
    }
  },

  /**
   * Get attendance records for a student
   * @param {number} studentId - The student's ID
   * @returns {Promise} Promise containing attendance records
   */
  getStudentAttendanceRecords: async (studentId) => {
    try {
      const response = await apiClient.get(`${API_URL}/student/${studentId}/records`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student attendance records:', error);
      return [];
    }
  },

  /**
   * Create a new attendance session
   * @param {Object} sessionData - The session data
   * @returns {Promise} Promise containing created session
   */
  createAttendanceSession: async (sessionData) => {
    try {
      const response = await apiClient.post(`${API_URL}/sessions`, sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating attendance session:', error);
      throw error;
    }
  },

  /**
   * Update attendance session status
   * @param {number} sessionId - The session ID
   * @param {string} status - The new status
   * @returns {Promise} Promise containing updated session
   */
  updateSessionStatus: async (sessionId, status) => {
    try {
      const response = await apiClient.put(`${API_URL}/sessions/${sessionId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  },

  /**
   * Mark attendance for a student
   * @param {Object} attendanceData - The attendance data
   * @returns {Promise} Promise containing created attendance record
   */
  markAttendance: async (attendanceData) => {
    try {
      const response = await apiClient.post(`${API_URL}/mark`, attendanceData);
      return response.data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  },

  /**
   * Get attendance view for a student
   * @returns {Promise} Promise containing attendance view data
   */
  getStudentAttendanceView: async () => {
    try {
      const response = await apiClient.get(`${API_URL}/student/view`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student attendance view:', error);
      return { records: [] };
    }
  },

  /**
   * Get students for attendance in a session
   * @param {number} sessionId - The session ID
   * @returns {Promise} Promise containing students list
   */
  getStudentsForAttendance: async (sessionId) => {
    try {
      const response = await apiClient.get(`${API_URL}/sessions/${sessionId}/students`);
      return response.data;
    } catch (error) {
      console.error('Error fetching students for attendance:', error);
      return [];
    }
  },

  /**
   * Update attendance records for multiple students
   * @param {number} sessionId - The session ID
   * @param {Array} records - The attendance records
   * @returns {Promise} Promise containing updated records
   */
  updateAttendanceRecords: async (sessionId, records) => {
    try {
      const response = await apiClient.put(`${API_URL}/sessions/${sessionId}/records`, { records });
      return response.data;
    } catch (error) {
      console.error('Error updating attendance records:', error);
      throw error;
    }
  }
};

export default attendanceService; 