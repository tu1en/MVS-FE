import axios from 'axios';

// API Base URL
const API_BASE_URL = 'http://localhost:8088/api';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
});

// Add axios interceptor to handle token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for common error handling
apiClient.interceptors.response.use((response) => {
  return response;
}, (error) => {
  const { response } = error;
  // Handle 401 Unauthorized error (token expired)
  if (response && response.status === 401) {
    // Clear session and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

class AssignmentService {
  /**
   * Get all assignments
   * @returns {Promise<Array>} Assignments list
   */
  static async getAllAssignments() {
    try {
      const response = await apiClient.get('/assignments');
      // Handle different response structures
      let data = response.data;
      if (data && data.data) {
        data = data.data; // If response has nested data property
      }
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching all assignments:', error);
      // Return empty array instead of throwing error to allow graceful degradation
      return [];
    }
  }

  /**
   * Get assignments by classroom ID
   * @param {number} classroomId - Classroom ID
   * @returns {Promise<Array>} Assignments list
   */
  static async getAssignmentsByClassroom(classroomId) {
    try {
      if (!classroomId) {
        throw new Error('Classroom ID is required');
      }
      const response = await apiClient.get(`/assignments/classroom/${classroomId}`);
      // Handle different response structures
      let data = response.data;
      if (data && data.data) {
        data = data.data; // If response has nested data property
      }
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching assignments for classroom ${classroomId}:`, error);
      return [];
    }
  }

  /**
   * Get assignments by student ID
   * @param {number} studentId - Student ID
   * @returns {Promise<Array>} Assignments list
   */
  static async getAssignmentsByStudent(studentId) {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      const response = await apiClient.get(`/assignments/student/${studentId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching assignments for student ${studentId}:`, error);
      return [];
    }
  }

  /**
   * Create a new assignment
   * @param {Object} assignmentData - Assignment data
   * @returns {Promise<Object>} Created assignment
   */
  static async createAssignment(assignmentData) {
    try {
      if (!assignmentData || !assignmentData.title || !assignmentData.dueDate) {
        throw new Error('Invalid assignment data. Title and due date are required.');
      }
      const response = await apiClient.post('/assignments', assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  /**
   * Update an existing assignment
   * @param {number} assignmentId - Assignment ID
   * @param {Object} assignmentData - Updated assignment data
   * @returns {Promise<Object>} Updated assignment
   */
  static async updateAssignment(assignmentId, assignmentData) {
    try {
      if (!assignmentId || !assignmentData) {
        throw new Error('Assignment ID and data are required');
      }
      const response = await apiClient.put(`/assignments/${assignmentId}`, assignmentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating assignment ${assignmentId}:`, error);
      throw error;
    }
  }

  /**
   * Delete an assignment
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<void>}
   */
  static async deleteAssignment(assignmentId) {
    try {
      if (!assignmentId) {
        throw new Error('Assignment ID is required');
      }
      await apiClient.delete(`/assignments/${assignmentId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting assignment ${assignmentId}:`, error);
      throw error;
    }
  }

  /**
   * Get submissions for an assignment
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<Array>} Submissions list
   */
  static async getSubmissionsForAssignment(assignmentId) {
    try {
      if (!assignmentId) {
        throw new Error('Assignment ID is required');
      }
      const response = await apiClient.get(`/assignments/${assignmentId}/submissions`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching submissions for assignment ${assignmentId}:`, error);
      return []; // Return empty array for graceful degradation
    }
  }

  /**
   * Get submissions for a student
   * @param {number} studentId - Student ID
   * @returns {Promise<Array>} Submissions list
   */
  static async getSubmissionsByStudent(studentId) {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      const response = await apiClient.get(`/submissions/student/${studentId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching submissions for student ${studentId}:`, error);
      return []; // Return empty array for graceful degradation
    }
  }

  /**
   * Submit an assignment
   * @param {Object} submissionData - Submission data
   * @returns {Promise<Object>} Created submission
   */
  static async submitAssignment(submissionData) {
    try {
      if (!submissionData || !submissionData.assignmentId || !submissionData.studentId) {
        throw new Error('Invalid submission data. Assignment ID and student ID are required.');
      }
      const response = await apiClient.post('/submissions', submissionData);
      return response.data;
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw error;
    }
  }

  /**
   * Grade a submission
   * @param {number} assignmentId - Assignment ID
   * @param {Object} gradeData - Grade data
   * @returns {Promise<Object>} Grade result
   */
  static async gradeSubmission(assignmentId, gradeData) {
    try {
      if (!assignmentId || !gradeData) {
        throw new Error('Assignment ID and grade data are required');
      }
      const response = await apiClient.post(`/assignments/${assignmentId}/grade`, gradeData);
      return response.data;
    } catch (error) {
      console.error('Error grading submission:', error);
      throw error;
    }
  }

  /**
   * Upload a file
   * @param {FormData} formData - Form data with file
   * @returns {Promise<Object>} Upload result
   */
  static async uploadFile(formData) {
    try {
      if (!formData) {
        throw new Error('Form data is required');
      }
      const response = await apiClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Insert/seed mock data into database (for development only)
   * @returns {Promise<Object>} Result of the seed operation
   */
  static async seedAssignmentData(mockData) {
    try {
      const response = await apiClient.post('/assignments/seed', mockData || {});
      return response.data;
    } catch (error) {
      console.error('Error seeding assignment data:', error);
      throw error;
    }
  }

  /**
   * Get assignments by teacher ID
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<Array>} Assignments list
   */
  static async getAssignmentsByTeacher(teacherId) {
    try {
      if (!teacherId) {
        throw new Error('Teacher ID is required');
      }
      // Use the backend endpoint that expects teacher ID in the path
      const response = await apiClient.get(`/assignments/teacher/${teacherId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching assignments for teacher ${teacherId}:`, error);
      return [];
    }
  }

  /**
   * Get assignments for the current logged-in teacher (from JWT token)
   * @returns {Promise<Array>} Assignments list
   */
  static async getCurrentTeacherAssignments() {
    try {
      // Use the bridge endpoint that extracts teacher ID from JWT token
      const response = await apiClient.get('/assignments/current-teacher');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching current teacher assignments:', error);
      return [];
    }
  }
}

export default AssignmentService; 