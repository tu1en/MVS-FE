import apiClient from './apiClient';

/**
 * Service for teacher assignment-related API operations
 */
export const teacherAssignmentService = {
  /**
   * Get assignments for the current teacher
   * @returns {Promise<Array>} List of assignments
   */
  async getMyAssignments() {
    try {
      const response = await apiClient.get('/assignments/current-teacher');
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher assignments:', error);
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
   * Get assignment details
   * @param {number} assignmentId - The assignment ID
   * @returns {Promise<Object>} Assignment details
   */
  async getAssignmentDetails(assignmentId) {
    try {
      const response = await apiClient.get(`/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assignment details:', error);
      throw error;
    }
  },

  /**
   * Create a new assignment
   * @param {Object} assignmentData - The assignment data
   * @returns {Promise<Object>} Created assignment
   */
  async createAssignment(assignmentData) {
    try {
      const response = await apiClient.post('/assignments', assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  },

  /**
   * Update an assignment
   * @param {number} assignmentId - The assignment ID
   * @param {Object} assignmentData - The updated assignment data
   * @returns {Promise<Object>} Updated assignment
   */
  async updateAssignment(assignmentId, assignmentData) {
    try {
      const response = await apiClient.put(`/assignments/${assignmentId}`, assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  },

  /**
   * Delete an assignment
   * @param {number} assignmentId - The assignment ID
   * @returns {Promise<void>}
   */
  async deleteAssignment(assignmentId) {
    try {
      await apiClient.delete(`/assignments/${assignmentId}`);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  },

  /**
   * Get submissions for an assignment
   * @param {number} assignmentId - The assignment ID
   * @returns {Promise<Array>} List of submissions
   */
  async getAssignmentSubmissions(assignmentId) {
    try {
      const response = await apiClient.get(`/assignments/${assignmentId}/submissions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assignment submissions:', error);
      throw error;
    }
  },

  /**
   * Get submission details
   * @param {number} submissionId - The submission ID
   * @returns {Promise<Object>} Submission details
   */
  async getSubmissionDetails(submissionId) {
    try {
      const response = await apiClient.get(`/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching submission details:', error);
      throw error;
    }
  },

  /**
   * Grade a submission
   * @param {number} submissionId - The submission ID
   * @param {Object} gradeData - Grade data including score and feedback
   * @returns {Promise<Object>} Updated submission
   */
  async gradeSubmission(submissionId, gradeData) {
    try {
      const response = await apiClient.put(`/submissions/${submissionId}/grade`, gradeData);
      return response.data;
    } catch (error) {
      console.error('Error grading submission:', error);
      throw error;
    }
  },

  /**
   * Bulk grade submissions
   * @param {Array} gradeData - Array of grade data for multiple submissions
   * @returns {Promise<Array>} Array of updated submissions
   */
  async bulkGradeSubmissions(gradeData) {
    try {
      const response = await apiClient.put('/submissions/bulk-grade', { grades: gradeData });
      return response.data;
    } catch (error) {
      console.error('Error bulk grading submissions:', error);
      throw error;
    }
  },

  /**
   * Get assignment statistics
   * @param {number} assignmentId - The assignment ID
   * @returns {Promise<Object>} Assignment statistics
   */
  async getAssignmentStats(assignmentId) {
    try {
      const response = await apiClient.get(`/assignments/${assignmentId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assignment stats:', error);
      throw error;
    }
  },

  /**
   * Download submission file
   * @param {number} submissionId - The submission ID
   * @returns {Promise<Blob>} File blob
   */
  async downloadSubmissionFile(submissionId) {
    try {
      const response = await apiClient.get(`/submissions/${submissionId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading submission file:', error);
      throw error;
    }
  },

  /**
   * Export assignment grades
   * @param {number} assignmentId - The assignment ID
   * @param {string} format - Export format (csv, excel)
   * @returns {Promise<Blob>} Export file
   */
  async exportAssignmentGrades(assignmentId, format = 'csv') {
    try {
      const response = await apiClient.get(`/assignments/${assignmentId}/export-grades`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting assignment grades:', error);
      throw error;
    }
  },

  /**
   * Send feedback notification to student
   * @param {number} submissionId - The submission ID
   * @returns {Promise<void>}
   */
  async sendFeedbackNotification(submissionId) {
    try {
      await apiClient.post(`/submissions/${submissionId}/send-feedback`);
    } catch (error) {
      console.error('Error sending feedback notification:', error);
      throw error;
    }
  }
};

export default teacherAssignmentService;
