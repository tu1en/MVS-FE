import axiosInstance from '../config/axiosInstance';

// Use the configured axios instance instead of creating a new one
const apiClient = axiosInstance;

// Remove the old axios interceptor setup since it's already in axiosInstance
// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// }, (error) => {
//   return Promise.reject(error);
// });

// Remove the old response interceptor since it's already in axiosInstance
// apiClient.interceptors.response.use((response) => {
//   return response;
// }, (error) => {
//   const { response } = error;
//   // Handle 401 Unauthorized error (token expired)
//   if (response && response.status === 401) {
//     localStorage.removeItem('token');
//     localStorage.removeItem('role');
//     window.location.href = '/login';
//   }
//   return Promise.reject(error);
// });

class SubmissionService {
  /**
   * Submit an assignment
   * @param {Object} submissionData - Submission data
   * @returns {Promise<Object>} Created submission
   */
  static async submitAssignment(submissionData) {
    try {
      const response = await apiClient.post('/submissions', submissionData);
      return response.data;
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw error;
    }
  }

  /**
   * Get submission by assignment and student
   * @param {number} assignmentId - Assignment ID
   * @param {number} studentId - Student ID  
   * @returns {Promise<Object>} Submission details
   */
  static async getStudentSubmission(assignmentId, studentId) {
    try {
      const response = await apiClient.get(`/submissions/assignment/${assignmentId}/student/${studentId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No submission found
      }
      console.error('Error fetching student submission:', error);
      throw error;
    }
  }

  /**
   * Get all submissions for a student
   * @param {number} studentId - Student ID
   * @returns {Promise<Array>} List of submissions
   */
  static async getStudentSubmissions(studentId) {
    try {
      const response = await apiClient.get(`/submissions/student/${studentId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching student submissions:', error);
      return [];
    }
  }

  /**
   * Update a submission
   * @param {number} submissionId - Submission ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated submission
   */
  static async updateSubmission(submissionId, updateData) {
    try {
      const response = await apiClient.put(`/submissions/${submissionId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  }

  /**
   * Delete a submission
   * @param {number} submissionId - Submission ID
   * @returns {Promise<void>}
   */
  static async deleteSubmission(submissionId) {
    try {
      await apiClient.delete(`/submissions/${submissionId}`);
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  }

  /**
   * Create a new submission
   * @param {Object} submissionData - Submission data
   * @returns {Promise<Object>} Created submission
   */
  static async createSubmission(submissionData) {
    try {
      console.log('Creating submission with data:', submissionData);
      const response = await apiClient.post('/submissions', submissionData);
      console.log('Create submission response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  }
}

export default SubmissionService;
