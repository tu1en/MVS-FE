import apiClient from './apiClient';

/**
 * Service for handling enrollment requests API calls
 */
const enrollmentService = {
  /**
   * Create a new enrollment request
   * @param {Object} requestData - Enrollment request data
   * @param {number} requestData.courseId - Course ID to enroll in (will be mapped to courseTemplateId)
   * @param {string} requestData.message - Optional message from student
   * @returns {Promise<Object>} Created enrollment request
   */
  createEnrollmentRequest: (requestData) => {
    // Transform courseId to courseTemplateId for backend compatibility
    const backendData = {
      courseTemplateId: requestData.courseId, // Backend expects courseTemplateId
      message: requestData.message
    };
    
    console.log('Sending enrollment request:', backendData);
    return apiClient.post('/enrollment-requests', backendData);
  },

  /**
   * Get enrollment requests by status (for managers)
   * @param {string} status - Request status ('PENDING', 'APPROVED', 'REJECTED')
   * @returns {Promise<Array>} List of enrollment requests
   */
  getRequests: (status = 'PENDING') => {
    return apiClient.get(`/enrollment-requests?status=${status}`);
  },

  /**
   * Get current student's enrollment requests
   * @returns {Promise<Array>} List of student's own requests
   */
  getMyRequests: () => {
    return apiClient.get('/enrollment-requests/my-requests');
  },

  /**
   * Approve an enrollment request (managers only)
   * @param {number} requestId - Request ID to approve
   * @returns {Promise<Object>} Updated enrollment request
   */
  approveRequest: (requestId) => {
    return apiClient.post(`/enrollment-requests/${requestId}/approve`);
  },

  /**
   * Reject an enrollment request (managers only)
   * @param {number} requestId - Request ID to reject
   * @param {string} reason - Reason for rejection
   * @returns {Promise<Object>} Updated enrollment request
   */
  rejectRequest: (requestId, reason) => {
    return apiClient.post(`/enrollment-requests/${requestId}/reject?reason=${encodeURIComponent(reason)}`);
  },

  /**
   * Get enrollment request statistics
   * @returns {Promise<Object>} Statistics about enrollment requests
   */
  getRequestStats: () => {
    return apiClient.get('/enrollment-requests/stats');
  }
};

export default enrollmentService;