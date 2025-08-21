import api from './api';

/**
 * Service for managing makeup attendance requests
 */
class MakeupAttendanceService {
  
  /**
   * Create a new makeup attendance request
   * @param {Object} requestData - Request data
   * @param {number} requestData.lectureId - Lecture ID
   * @param {number} requestData.classroomId - Classroom ID
   * @param {string} requestData.reason - Reason for makeup attendance
   * @returns {Promise<Object>} Created request
   */
  async createRequest(requestData) {
    try {
      const response = await api.post('/makeup-attendance/request', requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating makeup attendance request:', error);
      throw error;
    }
  }

  /**
   * Get all requests for the current teacher
   * @returns {Promise<Array>} List of requests
   */
  async getMyRequests() {
    try {
      const response = await api.get('/makeup-attendance/my-requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching my requests:', error);
      throw error;
    }
  }

  /**
   * Get all requests for the current teacher with pagination
   * @param {number} page - Page number (0-based)
   * @param {number} size - Page size
   * @returns {Promise<Object>} Page of requests
   */
  async getMyRequestsPaged(page = 0, size = 10) {
    try {
      const response = await api.get('/makeup-attendance/my-requests/paged', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching my requests (paged):', error);
      throw error;
    }
  }

  /**
   * Get all pending requests (for manager approval)
   * @returns {Promise<Array>} List of pending requests
   */
  async getPendingRequests() {
    try {
      const response = await api.get('/makeup-attendance/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  }

  /**
   * Get all pending requests with pagination (for manager approval)
   * @param {number} page - Page number (0-based)
   * @param {number} size - Page size
   * @returns {Promise<Object>} Page of pending requests
   */
  async getPendingRequestsPaged(page = 0, size = 10) {
    try {
      const response = await api.get('/makeup-attendance/pending/paged', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pending requests (paged):', error);
      throw error;
    }
  }

  /**
   * Get requests by status
   * @param {string} status - Request status (PENDING, APPROVED, REJECTED, COMPLETED)
   * @returns {Promise<Array>} List of requests
   */
  async getRequestsByStatus(status) {
    try {
      const response = await api.get(`/makeup-attendance/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching requests by status:', error);
      throw error;
    }
  }

  /**
   * Get a specific request by ID
   * @param {number} requestId - Request ID
   * @returns {Promise<Object>} Request details
   */
  async getRequestById(requestId) {
    try {
      const response = await api.get(`/makeup-attendance/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching request by ID:', error);
      throw error;
    }
  }

  /**
   * Acknowledge a makeup attendance request
   * @param {number} requestId - Request ID
   * @param {string} managerNotes - Optional notes from manager
   * @returns {Promise<Object>} Updated request
   */
  async acknowledgeRequest(requestId, managerNotes = '') {
    try {
      const response = await api.post(`/makeup-attendance/${requestId}/acknowledge`, {
        acknowledged: true,
        managerNotes
      });
      return response.data;
    } catch (error) {
      console.error('Error acknowledging request:', error);
      throw error;
    }
  }

  /**
   * Process a makeup attendance request (acknowledge with notes)
   * @param {number} requestId - Request ID
   * @param {string} managerNotes - Manager notes
   * @returns {Promise<Object>} Updated request
   */
  async processRequest(requestId, managerNotes = '') {
    try {
      const response = await api.post(`/makeup-attendance/${requestId}/acknowledge`, {
        acknowledged: true,
        managerNotes
      });
      return response.data;
    } catch (error) {
      console.error('Error processing request:', error);
      throw error;
    }
  }

  /**
   * Check if a teacher can create a makeup request for a specific lecture
   * @param {number} lectureId - Lecture ID
   * @returns {Promise<boolean>} Whether request can be created
   */
  async canCreateMakeupRequest(lectureId) {
    try {
      const response = await api.get(`/makeup-attendance/can-create/${lectureId}`);
      return response.data.canCreate;
    } catch (error) {
      console.error('Error checking if can create request:', error);
      throw error;
    }
  }

  /**
   * Get acknowledged requests for the current teacher
   * @returns {Promise<Array>} List of acknowledged requests
   */
  async getAcknowledgedRequests() {
    try {
      const response = await api.get('/makeup-attendance/acknowledged');
      return response.data;
    } catch (error) {
      console.error('Error fetching acknowledged requests:', error);
      throw error;
    }
  }

  /**
   * Mark a request as completed
   * @param {number} requestId - Request ID
   * @returns {Promise<void>}
   */
  async markRequestAsCompleted(requestId) {
    try {
      await api.post(`/makeup-attendance/${requestId}/complete`);
    } catch (error) {
      console.error('Error marking request as completed:', error);
      throw error;
    }
  }

  /**
   * Get statistics for the current teacher
   * @returns {Promise<Object>} Statistics
   */
  async getMyStatistics() {
    try {
      const response = await api.get('/makeup-attendance/my-statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching my statistics:', error);
      throw error;
    }
  }

  /**
   * Get overall statistics (for managers/admins)
   * @returns {Promise<Object>} Statistics
   */
  async getOverallStatistics() {
    try {
      const response = await api.get('/makeup-attendance/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching overall statistics:', error);
      throw error;
    }
  }

  /**
   * Get recent requests for dashboard
   * @returns {Promise<Array>} List of recent requests
   */
  async getRecentRequests() {
    try {
      const response = await api.get('/makeup-attendance/recent');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent requests:', error);
      throw error;
    }
  }

  /**
   * Get all requests for manager (all statuses combined)
   * @returns {Promise<Array>} List of all requests
   */
  async getAllRequestsForManager() {
    try {
      // Get requests from all statuses
      const [pendingResponse, acknowledgedResponse, completedResponse] = await Promise.all([
        api.get('/makeup-attendance/status/PENDING'),
        api.get('/makeup-attendance/status/ACKNOWLEDGED'),
        api.get('/makeup-attendance/status/COMPLETED')
      ]);

      // Combine all requests
      const allRequests = [
        ...pendingResponse.data,
        ...acknowledgedResponse.data,
        ...completedResponse.data
      ];

      return allRequests;
    } catch (error) {
      console.error('Error fetching all requests:', error);
      throw error;
    }
  }
}

export default new MakeupAttendanceService();
