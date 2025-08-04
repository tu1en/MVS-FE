import api from './api';

/**
 * Service for Accountant Evidence Management
 */
class AccountantEvidenceService {
  
  /**
   * Upload supporting evidence for attendance violations
   * @param {FormData} formData - Form data containing file and metadata
   * @returns {Promise} API response
   */
  async uploadSupportingEvidence(formData) {
    return api.post('/accountant/evidence/upload-supporting', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * Get evidence files uploaded by current accountant
   * @param {Object} filters - Filter parameters
   * @returns {Promise} API response
   */
  async getMyUploads(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.evidenceType) params.append('evidenceType', filters.evidenceType);
    if (filters.status) params.append('status', filters.status);
    
    return api.get(`/accountant/evidence/my-uploads?${params.toString()}`);
  }

  /**
   * Get evidence files by violation ID
   * @param {number} violationId - Violation ID
   * @returns {Promise} API response
   */
  async getEvidenceByViolation(violationId) {
    return api.get(`/accountant/evidence/violation/${violationId}`);
  }

  /**
   * Get evidence files pending accountant review
   * @returns {Promise} API response
   */
  async getPendingReview() {
    return api.get('/accountant/evidence/pending-review');
  }

  /**
   * Add accountant notes to evidence file
   * @param {number} evidenceId - Evidence ID
   * @param {string} notes - Accountant notes
   * @returns {Promise} API response
   */
  async addNotes(evidenceId, notes) {
    const params = new URLSearchParams();
    params.append('notes', notes);
    
    return api.patch(`/accountant/evidence/${evidenceId}/add-notes?${params.toString()}`);
  }

  /**
   * Mark evidence as reviewed by accountant
   * @param {number} evidenceId - Evidence ID
   * @returns {Promise} API response
   */
  async markAsReviewed(evidenceId) {
    return api.patch(`/accountant/evidence/${evidenceId}/mark-reviewed`);
  }

  /**
   * Get evidence statistics for dashboard
   * @param {string} period - Time period (week, month, year)
   * @returns {Promise} API response
   */
  async getStatistics(period = 'month') {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    
    return api.get(`/accountant/evidence/statistics?${params.toString()}`);
  }

  /**
   * Export evidence report
   * @param {string} format - Export format (pdf, excel)
   * @param {Object} filters - Filter parameters
   * @returns {Promise} API response
   */
  async exportReport(format = 'pdf', filters = {}) {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    return api.get(`/accountant/evidence/export-report?${params.toString()}`, {
      responseType: 'blob'
    });
  }

  /**
   * Bulk upload multiple evidence files
   * @param {FormData} formData - Form data containing multiple files
   * @returns {Promise} API response
   */
  async bulkUploadEvidence(formData) {
    return api.post('/accountant/evidence/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * Get evidence files by category
   * @param {string} category - Business category
   * @returns {Promise} API response
   */
  async getEvidenceByCategory(category) {
    return api.get(`/accountant/evidence/by-category/${category}`);
  }

  /**
   * Delete evidence file
   * @param {number} evidenceId - Evidence ID
   * @returns {Promise} API response
   */
  async deleteEvidence(evidenceId) {
    return api.delete(`/accountant/evidence/${evidenceId}`);
  }

  /**
   * Get evidence file templates
   * @returns {Promise} API response
   */
  async getTemplates() {
    return api.get('/accountant/evidence/templates');
  }

  /**
   * Generate download URL for evidence file
   * @param {number} evidenceId - Evidence ID
   * @returns {Promise} API response
   */
  async generateDownloadUrl(evidenceId) {
    return api.get(`/accountant/evidence/${evidenceId}/download-url`);
  }

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @returns {Promise} API response
   */
  async validateFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/accountant/evidence/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * Get evidence upload history
   * @param {number} days - Number of days to look back
   * @returns {Promise} API response
   */
  async getUploadHistory(days = 30) {
    return api.get(`/accountant/evidence/upload-history?days=${days}`);
  }

  /**
   * Get monthly evidence summary
   * @param {number} year - Year
   * @param {number} month - Month
   * @returns {Promise} API response
   */
  async getMonthlyEvidenceSummary(year, month) {
    return api.get(`/accountant/evidence/monthly-summary?year=${year}&month=${month}`);
  }

  /**
   * Update evidence priority
   * @param {number} evidenceId - Evidence ID
   * @param {string} priority - Priority level (HIGH, MEDIUM, LOW)
   * @returns {Promise} API response
   */
  async updateEvidencePriority(evidenceId, priority) {
    const params = new URLSearchParams();
    params.append('priority', priority);
    
    return api.patch(`/accountant/evidence/${evidenceId}/priority?${params.toString()}`);
  }

  /**
   * Get evidence files by priority
   * @param {string} priority - Priority level
   * @returns {Promise} API response
   */
  async getEvidenceByPriority(priority) {
    return api.get(`/accountant/evidence/priority/${priority}`);
  }

  /**
   * Search evidence files
   * @param {Object} searchParams - Search parameters
   * @returns {Promise} API response
   */
  async searchEvidence(searchParams) {
    const params = new URLSearchParams();
    
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key]) {
        params.append(key, searchParams[key]);
      }
    });
    
    return api.get(`/accountant/evidence/search?${params.toString()}`);
  }

  /**
   * Get evidence files needing follow-up
   * @returns {Promise} API response
   */
  async getEvidenceNeedingFollowUp() {
    return api.get('/accountant/evidence/need-followup');
  }

  /**
   * Archive old evidence files
   * @param {number} daysOld - Days old threshold
   * @returns {Promise} API response
   */
  async archiveOldEvidence(daysOld = 365) {
    return api.post(`/accountant/evidence/archive?daysOld=${daysOld}`);
  }

  /**
   * Get file type statistics
   * @returns {Promise} API response
   */
  async getFileTypeStatistics() {
    return api.get('/accountant/evidence/statistics/file-types');
  }

  /**
   * Get evidence files by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} API response
   */
  async getEvidenceByDateRange(startDate, endDate) {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    
    return api.get(`/accountant/evidence/date-range?${params.toString()}`);
  }

  /**
   * Get evidence file details by ID
   * @param {number} evidenceId - Evidence ID
   * @returns {Promise} API response
   */
  async getEvidenceById(evidenceId) {
    return api.get(`/accountant/evidence/${evidenceId}`);
  }

  /**
   * Update evidence metadata
   * @param {number} evidenceId - Evidence ID
   * @param {Object} metadata - Updated metadata
   * @returns {Promise} API response
   */
  async updateEvidenceMetadata(evidenceId, metadata) {
    return api.patch(`/accountant/evidence/${evidenceId}/metadata`, metadata);
  }

  /**
   * Get evidence audit trail
   * @param {number} evidenceId - Evidence ID
   * @returns {Promise} API response
   */
  async getEvidenceAuditTrail(evidenceId) {
    return api.get(`/accountant/evidence/${evidenceId}/audit-trail`);
  }

  /**
   * Batch update evidence files
   * @param {Array} evidenceIds - Array of evidence IDs
   * @param {Object} updates - Updates to apply
   * @returns {Promise} API response
   */
  async batchUpdateEvidence(evidenceIds, updates) {
    return api.patch('/accountant/evidence/batch-update', {
      evidenceIds,
      updates
    });
  }

  /**
   * Get evidence sharing permissions
   * @param {number} evidenceId - Evidence ID
   * @returns {Promise} API response
   */
  async getEvidencePermissions(evidenceId) {
    return api.get(`/accountant/evidence/${evidenceId}/permissions`);
  }

  /**
   * Share evidence with other users
   * @param {number} evidenceId - Evidence ID
   * @param {Array} userIds - Array of user IDs to share with
   * @param {string} permission - Permission level (READ, WRITE)
   * @returns {Promise} API response
   */
  async shareEvidence(evidenceId, userIds, permission = 'READ') {
    return api.post(`/accountant/evidence/${evidenceId}/share`, {
      userIds,
      permission
    });
  }

  /**
   * Get evidence comments/notes history
   * @param {number} evidenceId - Evidence ID
   * @returns {Promise} API response
   */
  async getEvidenceComments(evidenceId) {
    return api.get(`/accountant/evidence/${evidenceId}/comments`);
  }

  /**
   * Add comment to evidence file
   * @param {number} evidenceId - Evidence ID
   * @param {string} comment - Comment text
   * @returns {Promise} API response
   */
  async addEvidenceComment(evidenceId, comment) {
    return api.post(`/accountant/evidence/${evidenceId}/comments`, {
      comment
    });
  }
}

export default new AccountantEvidenceService();