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
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Course Service for handling course-related API calls
 */
class CourseService {
  
  /**
   * Get all courses with pagination
   * @param {number} page - Page number (0-based)
   * @param {number} size - Page size
   * @returns {Promise<Object>} Course list with pagination info
   */
  static async getCourses(page = 0, size = 10) {
    try {
      const response = await apiClient.get('/courses', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  /**
   * Get detailed course information by ID
   * @param {number} courseId - Course ID
   * @returns {Promise<Object>} Detailed course information
   */
  static async getCourseDetails(courseId) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course details:', error);
      throw error;
    }
  }

  /**
   * Get course materials
   * @param {number} courseId - Course ID
   * @returns {Promise<Array>} List of course materials
   */
  static async getCourseMaterials(courseId) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/materials`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course materials:', error);
      throw error;
    }
  }

  /**
   * Upload material to course
   * @param {number} courseId - Course ID
   * @param {FormData} formData - File data
   * @returns {Promise<Object>} Upload result
   */
  static async uploadCourseMaterial(courseId, formData) {
    try {
      const response = await apiClient.post(`/courses/${courseId}/materials/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading course material:', error);
      throw error;
    }
  }

  /**
   * Get course schedule
   * @param {number} courseId - Course ID
   * @returns {Promise<Array>} Course schedule
   */
  static async getCourseSchedule(courseId) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/schedule`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course schedule:', error);
      throw error;
    }
  }

  /**
   * Create a new course
   * @param {Object} courseData - Course data
   * @returns {Promise<Object>} Created course
   */
  static async createCourse(courseData) {
    try {
      const response = await apiClient.post('/courses', courseData);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  /**
   * Update course information
   * @param {number} courseId - Course ID
   * @param {Object} courseData - Updated course data
   * @returns {Promise<Object>} Updated course
   */
  static async updateCourse(courseId, courseData) {
    try {
      const response = await apiClient.put(`/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  /**
   * Delete a course
   * @param {number} courseId - Course ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteCourse(courseId) {
    try {
      const response = await apiClient.delete(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  /**
   * Get courses for current user
   * @returns {Promise<Array>} User's courses
   */
  static async getMyMyCourses() {
    try {
      const response = await apiClient.get('/courses/my-courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching my courses:', error);
      throw error;
    }
  }

  /**
   * Enroll in a course
   * @param {number} courseId - Course ID
   * @returns {Promise<Object>} Enrollment result
   */
  static async enrollInCourse(courseId) {
    try {
      const response = await apiClient.post(`/courses/${courseId}/enroll`);
      return response.data;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  }

  /**
   * Get course students
   * @param {number} courseId - Course ID
   * @returns {Promise<Array>} List of enrolled students
   */
  static async getCourseStudents(courseId) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/students`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course students:', error);
      throw error;
    }
  }

  /**
   * Get course analytics
   * @param {number} courseId - Course ID
   * @returns {Promise<Object>} Course analytics data
   */
  static async getCourseAnalytics(courseId) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      throw error;
    }
  }

  /**
   * Get courses for current student
   * @returns {Promise<Array>} Courses list
   */
  static async getCurrentStudentCourses() {
    try {
      const response = await apiClient.get('/courses/student');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching current student courses:', error);
      return [];
    }
  }

  /**
   * Get courses for a specific student
   * @param {number} studentId - Student ID
   * @returns {Promise<Array>} Courses list
   */
  static async getStudentCourses(studentId) {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      const response = await apiClient.get(`/classrooms/student/${studentId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching courses for student ${studentId}:`, error);
      return [];
    }
  }

  /**
   * Get courses for current teacher
   * @returns {Promise<Array>} Courses list
   */
  static async getCurrentTeacherCourses() {
    try {
      const response = await apiClient.get('/courses/current-teacher');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching current teacher courses:', error);
      return [];
    }
  }

  /**
   * Get courses taught by a specific teacher
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<Array>} Courses list
   */
  static async getTeacherCourses(teacherId) {
    try {
      if (!teacherId) {
        throw new Error('Teacher ID is required');
      }
      const response = await apiClient.get(`/classrooms/teacher/${teacherId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching courses for teacher ${teacherId}:`, error);
      return [];
    }
  }

  /**
   * Get course details
   * @param {number} courseId - Course ID
   * @returns {Promise<Object>} Course details
   */
  static async getCourseDetails(courseId) {
    try {
      if (!courseId) {
        throw new Error('Course ID is required');
      }
      const response = await apiClient.get(`/classrooms/${courseId}`);
      return response.data || {};
    } catch (error) {
      console.error(`Error fetching course details for course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Enroll student in course
   * @param {number} courseId - Course ID
   * @param {number} studentId - Student ID
   * @returns {Promise<boolean>} Success status
   */
  static async enrollStudent(courseId, studentId) {
    try {
      if (!courseId || !studentId) {
        throw new Error('Course ID and Student ID are required');
      }
      await apiClient.post(`/classrooms/${courseId}/students/${studentId}`);
      return true;
    } catch (error) {
      console.error(`Error enrolling student ${studentId} in course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Unenroll student from course
   * @param {number} courseId - Course ID
   * @param {number} studentId - Student ID
   * @returns {Promise<boolean>} Success status
   */
  static async unenrollStudent(courseId, studentId) {
    try {
      if (!courseId || !studentId) {
        throw new Error('Course ID and Student ID are required');
      }
      await apiClient.delete(`/classrooms/${courseId}/students/${studentId}`);
      return true;
    } catch (error) {
      console.error(`Error unenrolling student ${studentId} from course ${courseId}:`, error);
      throw error;
    }
  }
}

export default CourseService;
