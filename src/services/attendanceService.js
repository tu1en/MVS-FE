import apiClient from './apiClient';

// Since apiClient already has baseURL = 'http://localhost:8088/api',
// we only need the relative path without '/api' prefix
const API_URL = '/attendance';

/**
 * Service for refactored attendance-related API calls (V2)
 */
const attendanceService = {

  /**
   * Gets the attendance status for all enrolled students for a specific lecture.
   * This is used by a teacher to view and mark attendance.
   * If no attendance has been taken, it returns a list of students with null status.
   * @param {number} lectureId The ID of the lecture.
   * @param {number} classroomId The ID of the classroom.
   * @returns {Promise<Array>} A promise that resolves to a list of attendance records.
   */
  getAttendanceForLecture: async (lectureId, classroomId) => {
    try {
      const response = await apiClient.get(`${API_URL}/lecture/${lectureId}`, {
        params: { classroomId }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance for lecture ${lectureId}:`, error);
      throw error;
    }
  },

  /**
   * Creates or updates attendance records for a specific lecture.
   * This is used by a teacher to submit attendance for the whole class.
   * @param {Object} dto The data transfer object.
   * @param {number} dto.lectureId The ID of the lecture.
   * @param {number} dto.classroomId The ID of the classroom.
   * @param {Array<Object>} dto.records The list of student attendance records.
   * @param {number} dto.records.studentId The student's ID.
   * @param {string} dto.records.status The attendance status ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED').
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  createOrUpdateAttendance: async (dto) => {
    try {
      await apiClient.post(API_URL, dto);
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  },

  /**
   * Gets the personal attendance history for the currently authenticated student.
   * This is used by a student to view their own attendance record for a course.
   * @param {number} classroomId The ID of the classroom.
   * @returns {Promise<Array>} A promise that resolves to the student's attendance history.
   */
  getMyAttendanceHistory: async (classroomId) => {
    try {
      // Calls the secure endpoint that gets the user ID from the token
      const response = await apiClient.get(`${API_URL}/my-history`, {
        params: { classroomId }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching current user's attendance history for classroom ${classroomId}:`, error);
      throw error;
    }
  },

  /**
   * Gets the attendance history for a specific student in a specific classroom.
   * This is intended for TEACHERS to view a student's record.
   * @param {number} studentId The ID of the student.
   * @param {number} classroomId The ID of the classroom.
   * @returns {Promise<Array>} A promise that resolves to the student's attendance history.
   */
  getStudentAttendanceHistoryForTeacher: async (studentId, classroomId) => {
    try {
      const response = await apiClient.get(`${API_URL}/history/student/${studentId}`, {
        params: { classroomId }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance history for student ${studentId} in classroom ${classroomId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử giảng dạy của giáo viên đang đăng nhập
   * Dùng cho giáo viên để xem lịch sử các buổi dạy đã được ghi nhận
   * @returns {Promise<Array>} Promise trả về danh sách các buổi học đã dạy
   */
  getMyTeachingHistory: async () => {
    try {
      // API_URL is already prefixed in apiClient, so just use the relative path
      console.log(`[attendanceService] Fetching teaching history from: /attendance/teaching-history`);
      const response = await apiClient.get('/attendance/teaching-history');
      return response.data;
    } catch (error) {
      console.error('Error fetching teaching history:', error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử giảng dạy của một giáo viên cụ thể
   * Dành cho Manager/Admin để xem lịch sử giảng dạy của giáo viên
   * @param {number} teacherId ID của giáo viên
   * @returns {Promise<Array>} Promise trả về danh sách các buổi học đã dạy
   */
  getTeacherTeachingHistory: async (teacherId) => {
    try {
      // API_URL is already prefixed in apiClient
      const response = await apiClient.get(`/attendance/teaching-history/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching teaching history for teacher ${teacherId}:`, error);
      throw error;
    }
  },

  /**
   * Get all my attendance history across all enrolled classrooms
   * @returns {Promise<Array>} List of all attendance records with classroom info
   */
  getAllMyAttendanceHistory: async () => {
    try {
      // First get all enrolled classrooms
      const classroomResponse = await apiClient.get('/classrooms/student/me');
      const classrooms = Array.isArray(classroomResponse.data) ? classroomResponse.data : [];
      
      if (classrooms.length === 0) {
        return [];
      }

      // Fetch attendance for each classroom
      const attendancePromises = classrooms.map(classroom => 
        attendanceService.getMyAttendanceHistory(classroom.id)
      );
      
      const attendanceResults = await Promise.allSettled(attendancePromises);
      const allAttendance = [];
      
      attendanceResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          // Add classroom info to each attendance record
          const attendanceWithClassroom = result.value.map(attendance => ({
            ...attendance,
            classroomId: classrooms[index].id,
            classroomName: classrooms[index].name,
            subject: classrooms[index].subject
          }));
          allAttendance.push(...attendanceWithClassroom);
        }
      });
      
      return allAttendance;
    } catch (error) {
      console.error('Error fetching all my attendance history:', error);
      return [];
    }
  },

  // ==== MANAGER ATTENDANCE VERIFICATION METHODS ====

  /**
   * Check-in with full verification for Manager/Accountant
   * @param {Object} verificationData - Verification data including location, device info, etc.
   * @returns {Promise<Object>} Check-in result
   */
  checkIn: async (verificationData) => {
    const payload = {
      latitude: verificationData.latitude,
      longitude: verificationData.longitude,
      accuracy: verificationData.accuracy,
      deviceFingerprint: verificationData.deviceFingerprint,
      publicIp: verificationData.publicIp,
      userAgent: verificationData.userAgent || navigator.userAgent,
      notes: verificationData.notes || ''
    };

    const response = await apiClient.post(`${API_URL}/verification/check-in`, payload);
    return response.data;
  },

  /**
   * Check-out with verification for Manager/Accountant
   * @param {Object} verificationData - Verification data
   * @returns {Promise<Object>} Check-out result
   */
  checkOut: async (verificationData) => {
    const payload = {
      latitude: verificationData.latitude,
      longitude: verificationData.longitude,
      accuracy: verificationData.accuracy,
      deviceFingerprint: verificationData.deviceFingerprint,
      publicIp: verificationData.publicIp,
      userAgent: verificationData.userAgent || navigator.userAgent,
      notes: verificationData.notes || ''
    };

    const response = await apiClient.post(`${API_URL}/verification/check-out`, payload);
    return response.data;
  },

  /**
   * Get today's attendance status for current user
   * @returns {Promise<Object>} Today's status
   */
  getTodayStatus: async () => {
    const response = await apiClient.get(`${API_URL}/verification/today-status`);
    return response.data;
  },

  /**
   * Get weekly statistics for current user
   * @returns {Promise<Object>} Weekly stats
   */
  getWeeklyStats: async () => {
    const response = await apiClient.get(`${API_URL}/verification/weekly-stats`);
    return response.data;
  },

  /**
   * Get company locations for verification
   * @returns {Promise<Array>} List of company locations
   */
  getCompanyLocations: async () => {
    const response = await apiClient.get(`${API_URL}/verification/locations`);
    // BE trả về { data: [...], message: string }
    return Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
  },

  /**
   * Get attendance history with date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Attendance history
   */
  getAttendanceHistory: async (startDate, endDate) => {
    try {
      const response = await apiClient.get(`${API_URL}/verification/history`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Get attendance history error:', error);
      return [];
    }
  },

  /**
   * Verify location only (for testing)
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Promise<Object>} Verification result
   */
  verifyLocation: async (latitude, longitude) => {
    try {
      const response = await apiClient.post(`${API_URL}/verification/verify-location`, {
        latitude,
        longitude
      });
      return response.data;
    } catch (error) {
      console.error('Verify location error:', error);
      throw error;
    }
  },

  /**
   * Get verification logs for a specific date
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Promise<Array>} Verification logs
   */
  getVerificationLogs: async (date) => {
    try {
      const response = await apiClient.get(`${API_URL}/verification/logs`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Get verification logs error:', error);
      return [];
    }
  },

  /**
   * Get all staff logs for a specific day (admin/accountant view)
   * @param {string} date - YYYY-MM-DD
   * @returns {Promise<Array>} List of logs across users
   */
  getDayLogs: async (date) => {
    try {
      // Align with BE endpoint: /api/attendance/all-logs?date=YYYY-MM-DD
      const response = await apiClient.get(`${API_URL}/all-logs`, {
        params: { date }
      });
      const data = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
      return data;
    } catch (error) {
      console.error('Get day logs error:', error);
      return [];
    }
  },
};

// Export both as default and named export
export { attendanceService };
export default attendanceService;