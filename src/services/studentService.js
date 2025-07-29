import axios from 'axios';
import API_CONFIG from '../config/api-config.js';

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Student Service for handling student-specific operations
 */
class StudentService {

  /**
   * Get student courses
   * @param {number} studentId - Student ID (optional, defaults to current user)
   * @returns {Promise<Array>} List of student courses
   */
  static async getStudentCourses(studentId = null) {
    try {
      const endpoint = studentId ? `/students/${studentId}/courses` : '/students/my-courses';
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching student courses:', error);
      throw error;
    }
  }

  /**
   * Get student dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  static async getDashboardStats() {
    try {
      const response = await apiClient.get('/students/dashboard-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get student timetable
   * @param {number} studentId - Student ID (optional)
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Student timetable
   */
  static async getStudentTimetable(studentId = null, params = {}) {
    try {
      const endpoint = studentId ? `/students/${studentId}/timetable` : '/students/my-timetable';
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching student timetable:', error);
      throw error;
    }
  }

  /**
   * Get student progress
   * @param {number} studentId - Student ID (optional)
   * @returns {Promise<Object>} Student progress data
   */
  static async getStudentProgress(studentId = null) {
    try {
      const endpoint = studentId ? `/students/${studentId}/progress` : '/students/my-progress';
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching student progress:', error);
      throw error;
    }
  }

  /**
   * Get students by course
   * @param {number} courseId - Course ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of students in course
   */
  static async getStudentsByCourse(courseId, params = {}) {
    try {
      const response = await apiClient.get(`/students/course/${courseId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching students by course:', error);
      throw error;
    }
  }

  /**
   * Get students by class
   * @param {number} classId - Class ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of students in class
   */
  static async getStudentsByClass(classId, params = {}) {
    try {
      const response = await apiClient.get(`/students/class/${classId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching students by class:', error);
      throw error;
    }
  }

  /**
   * Search students
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Search results
   */
  static async searchStudents(query, filters = {}) {
    try {
      const params = { query, ...filters };
      const response = await apiClient.get('/students/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching students:', error);
      throw error;
    }
  }

  /**
   * Get student details
   * @param {number} studentId - Student ID
   * @returns {Promise<Object>} Student details
   */
  static async getStudentDetails(studentId) {
    try {
      const response = await apiClient.get(`/students/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student details:', error);
      throw error;
    }
  }

  /**
   * Get student assignments
   * @param {number} studentId - Student ID (optional)
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Student assignments
   */
  static async getStudentAssignments(studentId = null, params = {}) {
    try {
      const endpoint = studentId ? `/students/${studentId}/assignments` : '/students/my-assignments';
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching student assignments:', error);
      throw error;
    }
  }

  /**
   * Get student grades
   * @param {number} studentId - Student ID (optional)
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Student grades
   */
  static async getStudentGrades(studentId = null, params = {}) {
    try {
      const endpoint = studentId ? `/students/${studentId}/grades` : '/students/my-grades';
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching student grades:', error);
      throw error;
    }
  }

  /**
   * Update student information
   * @param {number} studentId - Student ID
   * @param {Object} studentData - Updated student data
   * @returns {Promise<Object>} Updated student
   */
  static async updateStudent(studentId, studentData) {
    try {
      const response = await apiClient.put(`/students/${studentId}`, studentData);
      return response.data;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  /**
   * Get student attendance
   * @param {number} studentId - Student ID (optional)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Attendance data
   */
  static async getStudentAttendance(studentId = null, params = {}) {
    try {
      const endpoint = studentId ? `/students/${studentId}/attendance` : '/students/my-attendance';
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      throw error;
    }
  }

  /**
   * Enroll student in course
   * @param {number} studentId - Student ID
   * @param {number} courseId - Course ID
   * @returns {Promise<Object>} Enrollment result
   */
  static async enrollStudent(studentId, courseId) {
    try {
      const response = await apiClient.post(`/students/${studentId}/enroll/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error enrolling student:', error);
      throw error;
    }
  }

  /**
   * Remove student from course
   * @param {number} studentId - Student ID
   * @param {number} courseId - Course ID
   * @returns {Promise<Object>} Removal result
   */
  static async removeStudentFromCourse(studentId, courseId) {
    try {
      const response = await apiClient.delete(`/students/${studentId}/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing student from course:', error);
      throw error;
    }
  }

  /**
   * Get student analytics
   * @param {number} studentId - Student ID (optional)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Student analytics data
   */
  static async getStudentAnalytics(studentId = null, params = {}) {
    try {
      const endpoint = studentId ? `/students/${studentId}/analytics` : '/students/my-analytics';
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching student analytics:', error);
      throw error;
    }
  }

  /**
   * Send message to student
   * @param {number} studentId - Student ID
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} Message sent result
   */
  static async sendMessageToStudent(studentId, messageData) {
    try {
      const response = await apiClient.post(`/students/${studentId}/message`, messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message to student:', error);
      throw error;
    }
  }

  /**
   * Export student list
   * @param {Object} params - Export parameters
   * @param {string} format - Export format (csv, xlsx, pdf)
   * @returns {Promise<Blob>} Exported file blob
   */
  static async exportStudentList(params = {}, format = 'csv') {
    try {
      const response = await apiClient.get('/students/export', {
        params: { ...params, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting student list:', error);
      throw error;
    }
  }

  /**
   * Get student notifications
   * @param {number} studentId - Student ID (optional)
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Student notifications
   */
  static async getStudentNotifications(studentId = null, params = {}) {
    try {
      const endpoint = studentId ? `/students/${studentId}/notifications` : '/students/my-notifications';
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching student notifications:', error);
      throw error;
    }
  }

  /**
   * Mark student notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise<Object>} Update result
   */
  static async markNotificationAsRead(notificationId) {
    try {
      const response = await apiClient.put(`/students/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
}

export default StudentService;
