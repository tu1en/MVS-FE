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
 * Grading Service for handling assignment grading and evaluation
 */
class GradingService {

  /**
   * Get assignment submissions for grading
   * @param {number} assignmentId - Assignment ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of submissions
   */
  static async getSubmissionsForGrading(assignmentId, params = {}) {
    try {
      const response = await apiClient.get(`/assignments/${assignmentId}/submissions`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions for grading:', error);
      throw error;
    }
  }

  /**
   * Grade a submission
   * @param {number} submissionId - Submission ID
   * @param {Object} gradeData - Grading data
   * @returns {Promise<Object>} Graded submission
   */
  static async gradeSubmission(submissionId, gradeData) {
    try {
      const response = await apiClient.post(`/assignments/submissions/${submissionId}/grade`, gradeData);
      return response.data;
    } catch (error) {
      console.error('Error grading submission:', error);
      throw error;
    }
  }

  /**
   * Get grading rubrics for an assignment
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<Array>} List of rubrics
   */
  static async getGradingRubrics(assignmentId) {
    try {
      const response = await apiClient.get(`/assignments/${assignmentId}/rubrics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grading rubrics:', error);
      throw error;
    }
  }

  /**
   * Create grading rubric
   * @param {number} assignmentId - Assignment ID
   * @param {Object} rubricData - Rubric data
   * @returns {Promise<Object>} Created rubric
   */
  static async createGradingRubric(assignmentId, rubricData) {
    try {
      const response = await apiClient.post(`/assignments/${assignmentId}/rubrics`, rubricData);
      return response.data;
    } catch (error) {
      console.error('Error creating grading rubric:', error);
      throw error;
    }
  }

  /**
   * Update grading rubric
   * @param {number} rubricId - Rubric ID
   * @param {Object} rubricData - Updated rubric data
   * @returns {Promise<Object>} Updated rubric
   */
  static async updateGradingRubric(rubricId, rubricData) {
    try {
      const response = await apiClient.put(`/assignments/rubrics/${rubricId}`, rubricData);
      return response.data;
    } catch (error) {
      console.error('Error updating grading rubric:', error);
      throw error;
    }
  }

  /**
   * Delete grading rubric
   * @param {number} rubricId - Rubric ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteGradingRubric(rubricId) {
    try {
      const response = await apiClient.delete(`/assignments/rubrics/${rubricId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting grading rubric:', error);
      throw error;
    }
  }

  /**
   * Bulk grade submissions
   * @param {number} assignmentId - Assignment ID
   * @param {Array} gradeData - Array of grade data for multiple submissions
   * @returns {Promise<Object>} Bulk grading result
   */
  static async bulkGradeSubmissions(assignmentId, gradeData) {
    try {
      const response = await apiClient.post(`/assignments/${assignmentId}/bulk-grade`, { grades: gradeData });
      return response.data;
    } catch (error) {
      console.error('Error bulk grading submissions:', error);
      throw error;
    }
  }

  /**
   * Get grading analytics for an assignment
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<Object>} Grading analytics
   */
  static async getGradingAnalytics(assignmentId) {
    try {
      const response = await apiClient.get(`/assignments/${assignmentId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grading analytics:', error);
      throw error;
    }
  }

  /**
   * Get grade distribution for an assignment
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<Object>} Grade distribution data
   */
  static async getGradeDistribution(assignmentId) {
    try {
      const response = await apiClient.get(`/assignments/${assignmentId}/grade-distribution`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grade distribution:', error);
      throw error;
    }
  }

  /**
   * Add feedback to a submission
   * @param {number} submissionId - Submission ID
   * @param {Object} feedbackData - Feedback data
   * @returns {Promise<Object>} Added feedback
   */
  static async addFeedback(submissionId, feedbackData) {
    try {
      const response = await apiClient.post(`/assignments/submissions/${submissionId}/feedback`, feedbackData);
      return response.data;
    } catch (error) {
      console.error('Error adding feedback:', error);
      throw error;
    }
  }

  /**
   * Get feedback for a submission
   * @param {number} submissionId - Submission ID
   * @returns {Promise<Array>} List of feedback
   */
  static async getFeedback(submissionId) {
    try {
      const response = await apiClient.get(`/assignments/submissions/${submissionId}/feedback`);
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  }

  /**
   * Update feedback
   * @param {number} feedbackId - Feedback ID
   * @param {Object} feedbackData - Updated feedback data
   * @returns {Promise<Object>} Updated feedback
   */
  static async updateFeedback(feedbackId, feedbackData) {
    try {
      const response = await apiClient.put(`/assignments/feedback/${feedbackId}`, feedbackData);
      return response.data;
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  }

  /**
   * Delete feedback
   * @param {number} feedbackId - Feedback ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteFeedback(feedbackId) {
    try {
      const response = await apiClient.delete(`/assignments/feedback/${feedbackId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  }

  /**
   * Export grades for an assignment
   * @param {number} assignmentId - Assignment ID
   * @param {string} format - Export format (csv, xlsx, pdf)
   * @returns {Promise<Blob>} Exported file blob
   */
  static async exportGrades(assignmentId, format = 'csv') {
    try {
      const response = await apiClient.get(`/assignments/${assignmentId}/export-grades`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting grades:', error);
      throw error;
    }
  }

  /**
   * Import grades from file
   * @param {number} assignmentId - Assignment ID
   * @param {FormData} formData - File data
   * @returns {Promise<Object>} Import result
   */
  static async importGrades(assignmentId, formData) {
    try {
      const response = await apiClient.post(`/assignments/${assignmentId}/import-grades`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error importing grades:', error);
      throw error;
    }
  }

  /**
   * Get grading history for a submission
   * @param {number} submissionId - Submission ID
   * @returns {Promise<Array>} Grading history
   */
  static async getGradingHistory(submissionId) {
    try {
      const response = await apiClient.get(`/assignments/submissions/${submissionId}/grading-history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grading history:', error);
      throw error;
    }
  }

  /**
   * Regrade a submission
   * @param {number} submissionId - Submission ID
   * @param {Object} regradeData - Regrade data
   * @returns {Promise<Object>} Regrade result
   */
  static async regradeSubmission(submissionId, regradeData) {
    try {
      const response = await apiClient.post(`/assignments/submissions/${submissionId}/regrade`, regradeData);
      return response.data;
    } catch (error) {
      console.error('Error regrading submission:', error);
      throw error;
    }
  }

  /**
   * Get plagiarism check results
   * @param {number} submissionId - Submission ID
   * @returns {Promise<Object>} Plagiarism check results
   */
  static async getPlagiarismResults(submissionId) {
    try {
      const response = await apiClient.get(`/assignments/submissions/${submissionId}/plagiarism`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plagiarism results:', error);
      throw error;
    }
  }

  /**
   * Run plagiarism check
   * @param {number} assignmentId - Assignment ID
   * @param {Array} submissionIds - List of submission IDs to check
   * @returns {Promise<Object>} Plagiarism check initiation result
   */
  static async runPlagiarismCheck(assignmentId, submissionIds) {
    try {
      const response = await apiClient.post(`/assignments/${assignmentId}/plagiarism-check`, { submissionIds });
      return response.data;
    } catch (error) {
      console.error('Error running plagiarism check:', error);
      throw error;
    }
  }

  /**
   * Get auto-grading settings for an assignment
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<Object>} Auto-grading settings
   */
  static async getAutoGradingSettings(assignmentId) {
    try {
      const response = await apiClient.get(`/assignments/${assignmentId}/auto-grading`);
      return response.data;
    } catch (error) {
      console.error('Error fetching auto-grading settings:', error);
      throw error;
    }
  }

  /**
   * Update auto-grading settings
   * @param {number} assignmentId - Assignment ID
   * @param {Object} settings - Auto-grading settings
   * @returns {Promise<Object>} Updated settings
   */
  static async updateAutoGradingSettings(assignmentId, settings) {
    try {
      const response = await apiClient.put(`/assignments/${assignmentId}/auto-grading`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating auto-grading settings:', error);
      throw error;
    }
  }
}

export default GradingService;
