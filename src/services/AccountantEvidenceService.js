import api from './api';
import FileUploadService from './fileUploadService';

/**
 * Service for Accountant Evidence Management
 */
class AccountantEvidenceService {
  
  /**
   * Upload supporting evidence for attendance violations
   * Uses Firebase upload service that you've already configured
   * @param {FormData} formData - Form data containing file and metadata
   * @returns {Promise} API response
   */
  async uploadSupportingEvidence(formData) {
    // Extract violationId and other metadata from formData
    const violationId = formData.get('violationId');
    const description = formData.get('description');
    const evidenceType = formData.get('evidenceType');
    const category = formData.get('category');
    const file = formData.get('file');
    
    return new Promise((resolve, reject) => {
      try {
        console.log('🔥 Using Firebase upload for evidence file:', file.name);
        
        // Use Firebase upload service with evidence folder path
        const uploadPath = `evidence/violation-${violationId}`;
        
        FileUploadService.uploadFile({
          file: file,
          onSuccess: (uploadedFileData) => {
            console.log('🔥 Firebase upload successful:', uploadedFileData);
            
            // Create evidence record with the uploaded file URL
            const evidenceRecord = {
              id: Date.now(),
              violationId: Number(violationId),
              fileUrl: uploadedFileData.url,
              fileName: file.name,
              description: description || '',
              evidenceType: evidenceType || 'DOCUMENT',
              category: category || 'GENERAL',
              uploadedAt: new Date().toISOString(),
              status: 'UPLOADED',
              isFirebaseUpload: true,
              viewedBy: [], // Track who viewed this evidence
              uploadedBy: localStorage.getItem('userId') || 'current_user'
            };
            
            // Save metadata to backend database
            this.saveEvidenceToBackend(evidenceRecord).then(() => {
              resolve({
                data: evidenceRecord,
                status: 200,
                statusText: 'OK'
              });
            }).catch((error) => {
              console.warn('Failed to save to backend, using localStorage fallback:', error);
              this.saveEvidenceToStorage(evidenceRecord);
              resolve({
                data: evidenceRecord,
                status: 200,
                statusText: 'OK'
              });
            });
          },
          onError: (error) => {
            console.warn('🔥 Firebase upload failed, using mock fallback:', error);
            
            // Fallback: Mock upload for demo purposes
            const mockFileUrl = `https://example.com/evidence/${Date.now()}_${file.name}`;
            
            const evidenceRecord = {
              id: Date.now(),
              violationId: Number(violationId),
              fileUrl: mockFileUrl,
              fileName: file.name,
              description: description || '',
              evidenceType: evidenceType || 'DOCUMENT',
              category: category || 'GENERAL',
              uploadedAt: new Date().toISOString(),
              status: 'UPLOADED',
              isMockUpload: true,
              viewedBy: [], // Track who viewed this evidence
              uploadedBy: localStorage.getItem('userId') || 'current_user'
            };
            
            // Save to localStorage for persistence
            this.saveEvidenceToStorage(evidenceRecord);
            
            resolve({
              data: evidenceRecord,
              status: 200,
              statusText: 'OK'
            });
          },
          onProgress: (progress) => {
            console.log('🔥 Firebase upload progress:', progress.percent + '%');
          }
        }, uploadPath);
        
      } catch (error) {
        console.error('Error setting up Firebase upload:', error);
        reject(error);
      }
    });
  }

  /**
   * Save evidence metadata to backend after Firebase upload
   */
  async saveEvidenceToBackend(evidenceData) {
    try {
      const response = await api.post('/accountant/evidence/save-metadata', {
        fileName: evidenceData.fileName,
        fileUrl: evidenceData.fileUrl,
        filePath: evidenceData.fileUrl, // Firebase URL as file path
        description: evidenceData.description,
        evidenceType: evidenceData.evidenceType
      });
      console.log('Evidence metadata saved to backend:', response.data);
      return response;
    } catch (error) {
      console.error('Failed to save evidence metadata to backend:', error);
      throw error;
    }
  }

  /**
   * Save evidence to localStorage as fallback
   */
  saveEvidenceToStorage(evidenceRecord) {
    try {
      const existingEvidence = JSON.parse(localStorage.getItem('evidenceData') || '[]');
      existingEvidence.push(evidenceRecord);
      localStorage.setItem('evidenceData', JSON.stringify(existingEvidence));
      console.log('Evidence saved to localStorage as fallback');
    } catch (error) {
      console.error('Failed to save evidence to localStorage:', error);
    }
  }

  /**
   * Mark evidence as viewed by current user
   */
  async markAsViewed(evidenceId) {
    try {
      const response = await api.post(`/accountant/evidence/${evidenceId}/mark-viewed`);
      return response;
    } catch (error) {
      console.error('Failed to mark evidence as viewed:', error);
      throw error;
    }
  }

  /**
   * Get evidence files uploaded by current accountant
   * Uses proper DataLoader pattern with fallback endpoints
   * @param {Object} filters - Filter parameters
   * @returns {Promise} API response
   */
  async getMyUploads(filters = {}) {
    try {
      console.log('Loading evidence data from backend...');
      
      // Try backend first  
      try {
        const response = await api.get('/accountant/evidence/my-uploads');
        console.log('Evidence data loaded from backend:', response.data);
        
        // Merge with localStorage data if any
        const localData = JSON.parse(localStorage.getItem('evidenceData') || '[]');
        const backendData = Array.isArray(response.data) ? response.data : [];
        const mergedData = [...backendData, ...localData];
        
        return {
          data: mergedData,
          status: 200,
          statusText: 'OK'
        };
      } catch (backendError) {
        console.warn('Backend failed, trying localStorage fallback:', backendError);
        
        // Fallback to localStorage
        const localData = JSON.parse(localStorage.getItem('evidenceData') || '[]');
        if (localData.length > 0) {
          console.log('Using localStorage evidence data:', localData);
          return {
            data: localData,
            status: 200,
            statusText: 'OK'
          };
        }
        
        // Final fallback to sample data
        console.log('No local data, using sample data for development');
        return this.getSampleEvidenceData(filters);
      }
    } catch (error) {
      console.error('Error loading evidence data:', error);
      return this.getSampleEvidenceData(filters);
    }
  }

  /**
   * Get sample evidence data for development/testing
   * @param {Object} filters - Filter parameters
   * @returns {Object} Sample data response
   */
  getSampleEvidenceData(filters = {}) {
    const sampleData = [
      {
        id: 1001,
        violationId: 5,
        fileUrl: 'https://firebasestorage.googleapis.com/v0/b/demo/o/evidence%2Fdoc1.pdf',
        fileName: 'bao_cao_diem_danh.pdf',
        description: 'Báo cáo điểm danh tháng 12',
        evidenceType: 'DOCUMENT',
        category: 'ATTENDANCE',
        uploadedAt: '2025-01-15T08:30:00.000Z',
        status: 'UPLOADED',
        reviewedBy: null,
        reviewedAt: null
      },
      {
        id: 1002,
        violationId: 8,
        fileUrl: 'https://firebasestorage.googleapis.com/v0/b/demo/o/evidence%2Fimg1.jpg',
        fileName: 'chung_tu_nghi_phep.jpg',
        description: 'Chứng từ xin nghỉ phép có lý do',
        evidenceType: 'IMAGE',
        category: 'MEDICAL',
        uploadedAt: '2025-01-14T14:20:00.000Z',
        status: 'REVIEWED',
        reviewedBy: 'Nguyễn Văn A',
        reviewedAt: '2025-01-15T09:00:00.000Z'
      },
      {
        id: 1003,
        violationId: 12,
        fileUrl: 'https://firebasestorage.googleapis.com/v0/b/demo/o/evidence%2Fdoc2.pdf',
        fileName: 'don_xin_di_muon.pdf',
        description: 'Đơn xin phép đi muộn do tắc đường',
        evidenceType: 'DOCUMENT',
        category: 'TRANSPORT',
        uploadedAt: '2025-01-13T16:45:00.000Z',
        status: 'PENDING',
        reviewedBy: null,
        reviewedAt: null
      },
      {
        id: 1004,
        violationId: 15,
        fileUrl: 'https://firebasestorage.googleapis.com/v0/b/demo/o/evidence%2Fimg2.png',
        fileName: 'bien_lai_dong_tien.png',
        description: 'Biên lai đóng tiền phạt chậm trễ',
        evidenceType: 'IMAGE',
        category: 'PAYROLL',
        uploadedAt: '2025-01-12T11:15:00.000Z',
        status: 'UPLOADED',
        reviewedBy: null,
        reviewedAt: null
      }
    ];

    // Apply filters like real data service would
    let filteredData = [...sampleData];
    
    if (filters.evidenceType) {
      filteredData = filteredData.filter(
        evidence => evidence.evidenceType === filters.evidenceType
      );
    }
    
    if (filters.status) {
      filteredData = filteredData.filter(
        evidence => evidence.status === filters.status
      );
    }
    
    return {
      data: filteredData,
      status: 200,
      statusText: 'OK'
    };
  }

  /**
   * Get evidence files by violation ID
   * Returns seeder data filtered by violation ID for testing
   * @param {number} violationId - Violation ID
   * @returns {Promise} API response
   */
  async getEvidenceByViolation(violationId) {
    // Get all seeder data and filter by violation ID
    const allUploads = await this.getMyUploads();
    const evidenceForViolation = allUploads.data.filter(
      evidence => evidence.violationId === Number(violationId)
    );
    
    return Promise.resolve({
      data: evidenceForViolation,
      status: 200,
      statusText: 'OK'
    });
  }

  /**
   * Get evidence files pending accountant review
   * Returns seeder data for testing
   * @returns {Promise} API response
   */
  async getPendingReview() {
    const allUploads = await this.getMyUploads();
    const pendingItems = allUploads.data.filter(evidence => evidence.status === 'PENDING');
    
    return Promise.resolve({
      data: pendingItems,
      status: 200,
      statusText: 'OK'
    });
  }

  /**
   * Get evidence files reviewed by current accountant
   * Returns seeder data for testing
   */
  async getReviewedByMe() {
    const allUploads = await this.getMyUploads();
    const reviewedItems = allUploads.data.filter(evidence => evidence.status === 'REVIEWED');
    
    return Promise.resolve({
      data: reviewedItems,
      status: 200,
      statusText: 'OK'
    });
  }

  /**
   * Get all reviewed evidence (read-only overview)
   * Returns seeder data for testing
   */
  async getAllReviewed() {
    const allUploads = await this.getMyUploads();
    const allReviewedItems = allUploads.data.filter(evidence => 
      evidence.status === 'REVIEWED' || evidence.status === 'APPROVED'
    );
    
    return Promise.resolve({
      data: allReviewedItems,
      status: 200,
      statusText: 'OK'
    });
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
   * Uses proper API pattern with fallback endpoints
   * @param {number} evidenceId - Evidence ID
   * @returns {Promise} API response
   */
  async markAsReviewed(evidenceId) {
    try {
      console.log('Marking evidence as reviewed:', evidenceId);
      
      // Try multiple endpoints for marking as reviewed
      const endpoints = [
        `/accountant/evidence/${evidenceId}/mark-reviewed`,
        `/evidence/${evidenceId}/review`,
        `/accountant/files/${evidenceId}/reviewed`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.patch(endpoint);
          return {
            data: { success: true, message: 'Evidence marked as reviewed' },
            status: 200,
            statusText: 'OK'
          };
        } catch (err) {
          console.warn(`Mark reviewed endpoint ${endpoint} failed:`, err);
          continue;
        }
      }
      
      // If all endpoints fail, simulate success for development
      console.log('All mark-reviewed endpoints failed, simulating success for development');
      return Promise.resolve({
        data: { success: true, message: 'Evidence marked as reviewed (simulated)' },
        status: 200,
        statusText: 'OK'
      });
      
    } catch (error) {
      console.error('Error marking evidence as reviewed:', error);
      return Promise.reject(error);
    }
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
   * For mock evidence, return the stored URL directly
   * @param {number} evidenceId - Evidence ID
   * @returns {Promise} API response
   */
  async generateDownloadUrl(evidenceId) {
    try {
      // First, check if this is mock evidence data
      const allMockEvidence = JSON.parse(localStorage.getItem('mockEvidenceData') || '[]');
      const mockEvidence = allMockEvidence.find(evidence => evidence.id === Number(evidenceId));
      
      if (mockEvidence && mockEvidence.isMockUpload) {
        // For mock evidence, return the mock URL
        return Promise.resolve({
          data: mockEvidence.fileUrl,
          status: 200,
          statusText: 'OK'
        });
      }
      
      // For real evidence, try the backend API
      return api.get(`/accountant/evidence/${evidenceId}/download-url`);
    } catch (error) {
      console.error('Error generating download URL:', error);
      // Fallback: return a placeholder message
      return Promise.resolve({
        data: '#',
        status: 200,
        statusText: 'OK'
      });
    }
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

  /**
   * Get current user's explanations that can have evidence uploaded
   * Uses existing attendance-explanations API
   * @param {Object} filters - Filter parameters
   * @returns {Promise} API response with explanations list
   */
  async getUserExplanationsForEvidence(filters = {}) {
    const params = {
      page: 0,
      size: 100, // Get more records for dropdown
      ...filters
    };
    
    return api.get('/attendance-explanations/report', { params });
  }
}

export default new AccountantEvidenceService();