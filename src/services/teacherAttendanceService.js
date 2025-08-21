import apiClient from './apiClient';

/**
 * Service for teacher attendance-related API operations
 */
export const teacherAttendanceService = {
  /**
   * Get attendance sessions for a specific classroom
   * @param {number} classroomId - The classroom ID
   * @returns {Promise<Array>} List of attendance sessions
   */
  async getClassroomAttendanceSessions(classroomId) {
    try {
      const response = await apiClient.get(`/attendance-sessions/classroom/${classroomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classroom attendance sessions:', error);
      throw error;
    }
  },

  /**
   * Get attendance session details
   * @param {number} sessionId - The session ID
   * @returns {Promise<Object>} Session details with attendance records
   */
  async getAttendanceSessionDetails(sessionId) {
    try {
      const response = await apiClient.get(`/attendance-sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance session details:', error);
      throw error;
    }
  },

  /**
   * Create a new attendance session
   * @param {Object} sessionData - Session data including classroomId, lectureId, date, etc.
   * @returns {Promise<Object>} Created session
   */
  async createAttendanceSession(sessionData) {
    try {
      const response = await apiClient.post('/attendance-sessions', sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating attendance session:', error);
      throw error;
    }
  },

  /**
   * Update attendance records for a session
   * @param {number} sessionId - The session ID
   * @param {Array} attendanceRecords - Array of attendance records
   * @returns {Promise<void>}
   */
  async updateAttendanceRecords(sessionId, attendanceRecords) {
    try {
      await apiClient.put(`/attendance-sessions/${sessionId}/records`, {
        attendanceRecords
      });
    } catch (error) {
      console.error('Error updating attendance records:', error);
      throw error;
    }
  },

  /**
   * Take attendance for a lecture
   * @param {number} lectureId - The lecture ID
   * @param {Array} attendanceData - Array of student attendance data
   * @returns {Promise<Object>} Attendance session result
   */
  async takeAttendance(lectureId, attendanceData) {
    try {
      const response = await apiClient.post('/attendance-sessions/take', {
        lectureId,
        attendanceRecords: attendanceData
      });
      return response.data;
    } catch (error) {
      console.error('Error taking attendance:', error);
      throw error;
    }
  },

  /**
   * Get attendance statistics for a classroom
   * @param {number} classroomId - The classroom ID
   * @returns {Promise<Object>} Attendance statistics
   */
  async getClassroomAttendanceStats(classroomId) {
    try {
      const response = await apiClient.get(`/attendance-sessions/classroom/${classroomId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      throw error;
    }
  },

  /**
   * Get attendance for a specific lecture
   * @param {number} lectureId - The lecture ID
   * @returns {Promise<Object>} Attendance data for the lecture
   */
  async getLectureAttendance(lectureId) {
    try {
      const response = await apiClient.get(`/attendance-sessions/lecture/${lectureId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lecture attendance:', error);
      throw error;
    }
  },

  /**
   * Get students for attendance taking
   * @param {number} classroomId - The classroom ID
   * @returns {Promise<Array>} List of students with attendance status
   */
  async getStudentsForAttendance(classroomId) {
    try {
      const response = await apiClient.get(`/classrooms/${classroomId}/students-for-attendance`);
      return response.data;
    } catch (error) {
      console.error('Error fetching students for attendance:', error);
      throw error;
    }
  },

  /**
   * Export attendance data for a classroom
   * @param {number} classroomId - The classroom ID
   * @param {string} format - Export format (csv, excel)
   * @returns {Promise<Blob>} Export file
   */
  async exportAttendanceData(classroomId, format = 'csv') {
    try {
      const response = await apiClient.get(`/attendance-sessions/classroom/${classroomId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting attendance data:', error);
      throw error;
    }
  },

  /**
   * Delete an attendance session
   * @param {number} sessionId - The session ID
   * @returns {Promise<void>}
   */
  async deleteAttendanceSession(sessionId) {
    try {
      await apiClient.delete(`/attendance-sessions/${sessionId}`);
    } catch (error) {
      console.error('Error deleting attendance session:', error);
      throw error;
    }
  },

  /**
   * Get attendance data for a specific lecture
   * @param {number} lectureId - The lecture ID
   * @param {number} classroomId - The classroom ID (required parameter)
   * @returns {Promise<Array>} List of students with attendance status
   */
  async getAttendanceForLecture(lectureId, classroomId) {
    // Log for debugging what's happening with the request
    console.log(`Trying to fetch attendance for lecture ${lectureId} in classroom ${classroomId}`);
    
    try {
      // Use the correct path with v1 prefix and include the required classroomId parameter as a query param
      // This matches exactly what's in the backend AttendanceController
      console.log(`Attempting endpoint: /attendance/lecture/${lectureId}?classroomId=${classroomId}`);
      
      const response = await apiClient.get(`/attendance/lecture/${lectureId}`, {
        params: {
          classroomId: classroomId
        },
        timeout: 15000 // Set a longer timeout for the request
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance for lecture:', error);
      
      // If we have a 404, try the alternative endpoint
      if (error.response && error.response.status === 404) {
        console.log('First endpoint failed with 404, trying alternative endpoint...');
        
        try {
          // Try without v1 prefix as a fallback
          console.log(`Attempting alternative endpoint: /attendance/lecture/${lectureId}?classroomId=${classroomId}`);
          const altResponse = await apiClient.get(`/attendance/lecture/${lectureId}`, {
            params: {
              classroomId: classroomId
            },
            timeout: 15000
          });
          return altResponse.data;
        } catch (altError) {
          console.error('All endpoints failed:', altError);
          throw altError;
        }
      } else {
        throw error;
      }
    }
  },

  /**
   * Get attendance status for a lecture
   * @param {number} lectureId - Lecture ID
   * @param {number} classroomId - Classroom ID
   * @returns {Promise<Object>} Attendance status information
   */
  async getAttendanceStatus(lectureId, classroomId) {
    try {
      console.log(`Getting attendance status for lecture ${lectureId} in classroom ${classroomId}`);

      const response = await apiClient.get(`/attendance/lecture/${lectureId}/status`, {
        params: {
          classroomId: classroomId
        },
        timeout: 15000
      });

      return response.data;
    } catch (error) {
      console.error('Error getting attendance status:', error);
      throw error;
    }
  },

  /**
   * Submit attendance records
   * @param {Object} attendanceData - Attendance data with lecture, classroom, and records
   * @returns {Promise<Object>} Submission result
   */
  async submitAttendance(attendanceData) {
    try {
      // Use the correct API endpoint path that matches the backend controller
      const response = await apiClient.post(`/attendance/submit`, attendanceData);
      return response.data;
    } catch (error) {
      console.error('Error submitting attendance:', error);
      throw error;
    }
  }
};

export default teacherAttendanceService;
