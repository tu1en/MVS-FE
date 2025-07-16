import apiClient from './apiClient';

/**
 * Service for HR Management operations
 * Handles work shifts and shift assignments
 */
class HRService {
  
  // ==================== WORK SHIFTS ====================
  
  /**
   * Create a new work shift
   * @param {Object} shiftData - Shift data
   * @returns {Promise} API response
   */
  async createShift(shiftData) {
    try {
      const response = await apiClient.post('/hr/shifts', shiftData);
      return response.data;
    } catch (error) {
      console.error('Error creating work shift:', error);
      throw error;
    }
  }

  /**
   * Update an existing work shift
   * @param {number} id - Shift ID
   * @param {Object} shiftData - Updated shift data
   * @returns {Promise} API response
   */
  async updateShift(id, shiftData) {
    try {
      const response = await apiClient.put(`/hr/shifts/${id}`, shiftData);
      return response.data;
    } catch (error) {
      console.error('Error updating work shift:', error);
      throw error;
    }
  }

  /**
   * Get work shift by ID
   * @param {number} id - Shift ID
   * @returns {Promise} API response
   */
  async getShiftById(id) {
    try {
      const response = await apiClient.get(`/hr/shifts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting work shift:', error);
      throw error;
    }
  }

  /**
   * Get all work shifts with pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getShifts(params = {}) {
    try {
      const response = await apiClient.get('/hr/shifts', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting work shifts:', error);
      throw error;
    }
  }

  /**
   * Get all active work shifts (for dropdown)
   * @returns {Promise} API response
   */
  async getActiveShifts() {
    try {
      const response = await apiClient.get('/hr/shifts/active');
      return response.data;
    } catch (error) {
      console.error('Error getting active work shifts:', error);
      throw error;
    }
  }

  /**
   * Delete a work shift
   * @param {number} id - Shift ID
   * @returns {Promise} API response
   */
  async deleteShift(id) {
    try {
      const response = await apiClient.delete(`/hr/shifts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting work shift:', error);
      throw error;
    }
  }

  /**
   * Toggle shift status (activate/deactivate)
   * @param {number} id - Shift ID
   * @param {boolean} isActive - New active status
   * @returns {Promise} API response
   */
  async toggleShiftStatus(id, isActive) {
    try {
      const response = await apiClient.patch(`/hr/shifts/${id}/status`, null, {
        params: { isActive }
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling shift status:', error);
      throw error;
    }
  }

  /**
   * Check if shift name is available
   * @param {string} name - Shift name
   * @param {number} excludeId - ID to exclude (for updates)
   * @returns {Promise} API response
   */
  async checkShiftName(name, excludeId = null) {
    try {
      const params = { name };
      if (excludeId) params.excludeId = excludeId;
      
      const response = await apiClient.get('/hr/shifts/check-name', { params });
      return response.data;
    } catch (error) {
      console.error('Error checking shift name:', error);
      throw error;
    }
  }

  // ==================== SHIFT ASSIGNMENTS ====================

  /**
   * Create shift assignments for multiple users
   * @param {Object} assignmentData - Assignment data
   * @returns {Promise} API response
   */
  async createShiftAssignments(assignmentData) {
    try {
      const response = await apiClient.post('/hr/shift-assignments', assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating shift assignments:', error);
      throw error;
    }
  }

  /**
   * Update a shift assignment
   * @param {number} id - Assignment ID
   * @param {Object} assignmentData - Updated assignment data
   * @returns {Promise} API response
   */
  async updateShiftAssignment(id, assignmentData) {
    try {
      const response = await apiClient.put(`/hr/shift-assignments/${id}`, assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error updating shift assignment:', error);
      throw error;
    }
  }

  /**
   * Get shift assignment by ID
   * @param {number} id - Assignment ID
   * @returns {Promise} API response
   */
  async getAssignmentById(id) {
    try {
      const response = await apiClient.get(`/hr/shift-assignments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting shift assignment:', error);
      throw error;
    }
  }

  /**
   * Get all shift assignments with pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async getAssignments(params = {}) {
    try {
      const response = await apiClient.get('/hr/shift-assignments', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting shift assignments:', error);
      throw error;
    }
  }

  /**
   * Get assignments by user
   * @param {number} userId - User ID
   * @param {boolean} activeOnly - Whether to return only active assignments
   * @returns {Promise} API response
   */
  async getAssignmentsByUser(userId, activeOnly = true) {
    try {
      const response = await apiClient.get(`/hr/shift-assignments/user/${userId}`, {
        params: { activeOnly }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting assignments by user:', error);
      throw error;
    }
  }

  /**
   * Get assignments by shift
   * @param {number} shiftId - Shift ID
   * @param {boolean} activeOnly - Whether to return only active assignments
   * @returns {Promise} API response
   */
  async getAssignmentsByShift(shiftId, activeOnly = true) {
    try {
      const response = await apiClient.get(`/hr/shift-assignments/shift/${shiftId}`, {
        params: { activeOnly }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting assignments by shift:', error);
      throw error;
    }
  }

  /**
   * Get assignments for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise} API response
   */
  async getAssignmentsForDate(date) {
    try {
      const response = await apiClient.get(`/hr/shift-assignments/date/${date}`);
      return response.data;
    } catch (error) {
      console.error('Error getting assignments for date:', error);
      throw error;
    }
  }

  /**
   * Get eligible users for shift assignment
   * @returns {Promise} API response
   */
  async getEligibleUsers() {
    try {
      const response = await apiClient.get('/hr/shift-assignments/eligible-users');
      return response.data;
    } catch (error) {
      console.error('Error getting eligible users:', error);
      throw error;
    }
  }

  /**
   * Check for overlapping assignments
   * @param {number} userId - User ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {number} excludeId - ID to exclude (for updates)
   * @returns {Promise} API response
   */
  async checkOverlappingAssignments(userId, startDate, endDate, excludeId = null) {
    try {
      const params = { userId, startDate, endDate };
      if (excludeId) params.excludeId = excludeId;
      
      const response = await apiClient.get('/hr/shift-assignments/check-overlap', { params });
      return response.data;
    } catch (error) {
      console.error('Error checking overlapping assignments:', error);
      throw error;
    }
  }

  /**
   * Delete a shift assignment
   * @param {number} id - Assignment ID
   * @returns {Promise} API response
   */
  async deleteAssignment(id) {
    try {
      const response = await apiClient.delete(`/hr/shift-assignments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting shift assignment:', error);
      throw error;
    }
  }

  /**
   * Toggle assignment status
   * @param {number} id - Assignment ID
   * @param {boolean} isActive - New active status
   * @returns {Promise} API response
   */
  async toggleAssignmentStatus(id, isActive) {
    try {
      const response = await apiClient.patch(`/hr/shift-assignments/${id}/status`, null, {
        params: { isActive }
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling assignment status:', error);
      throw error;
    }
  }
}

// Export singleton instance
const hrService = new HRService();
export default hrService;
