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
      const response = await apiClient.get(`${API_URL}/my-attendance-history`, {
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
};

// Export both as default and named export
export { attendanceService };
export default attendanceService;