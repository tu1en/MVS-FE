import api from './api';

const adminService = {
  
  // =================== WORKFLOW METHODS ===================
  
  /**
   * Lấy tất cả workflows
   */
  getAllWorkflows: async () => {
    try {
      const response = await api.get('/admin/workflows');
      return response;
    } catch (error) {
      console.error('Error getting all workflows:', error);
      throw error;
    }
  },

  /**
   * Lấy workflow theo ID
   */
  getWorkflowById: async (id) => {
    try {
      const response = await api.get(`/admin/workflows/${id}`);
      return response;
    } catch (error) {
      console.error('Error getting workflow by id:', error);
      throw error;
    }
  },

  /**
   * Tạo workflow mới
   */
  createWorkflow: async (workflowData) => {
    try {
      const response = await api.post('/admin/workflows', workflowData);
      return response;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  },

  /**
   * Cập nhật workflow
   */
  updateWorkflow: async (id, workflowData) => {
    try {
      const response = await api.put(`/admin/workflows/${id}`, workflowData);
      return response;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  },

  /**
   * Xóa workflow
   */
  deleteWorkflow: async (id) => {
    try {
      const response = await api.delete(`/admin/workflows/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  },

  /**
   * Lấy workflows active
   */
  getActiveWorkflows: async () => {
    try {
      const response = await api.get('/admin/workflows/active');
      return response;
    } catch (error) {
      console.error('Error getting active workflows:', error);
      throw error;
    }
  },

  /**
   * Duplicate workflow
   */
  duplicateWorkflow: async (id, newName) => {
    try {
      const response = await api.post(`/admin/workflows/${id}/duplicate?newName=${encodeURIComponent(newName)}`);
      return response;
    } catch (error) {
      console.error('Error duplicating workflow:', error);
      throw error;
    }
  },

  /**
   * Export workflow
   */
  exportWorkflow: async (id) => {
    try {
      const response = await api.get(`/admin/workflows/${id}/export`, {
        responseType: 'text' // Vì API trả về JSON string
      });
      return response;
    } catch (error) {
      console.error('Error exporting workflow:', error);
      throw error;
    }
  },

  /**
   * Validate JSON format cho workflow
   */
  validateWorkflowJSON: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      // Kiểm tra structure cần thiết cho React Flow
      return parsed.hasOwnProperty('nodes') && parsed.hasOwnProperty('edges');
    } catch (error) {
      console.error('Invalid JSON:', error);
      return false;
    }
  },

  /**
   * Download file utility
   */
  downloadFile: (data, filename) => {
    try {
      const blob = new Blob([data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },

  // =================== SYSTEM ADMIN METHODS ===================
  
  /**
   * Lấy system health
   */
  getSystemHealth: async () => {
    try {
      const response = await api.get('/admin/health');
      return response;
    } catch (error) {
      console.error('Error getting system health:', error);
      // Return mock response for development with proper error handling
      return {
        data: {
          success: false,
          message: 'API endpoint not found (404). System health monitoring not implemented yet.',
          data: null,
          error: {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
          }
        }
      };
    }
  },

  /**
   * Lấy system info
   */
  getSystemInfo: async () => {
    try {
      const response = await api.get('/admin/system-info');
      return response;
    } catch (error) {
      console.error('Error getting system info:', error);
      // Return mock response for development
      return {
        data: {
          success: false,
          message: 'API endpoint not found (404). System info API not implemented yet.',
          data: null,
          error: {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
          }
        }
      };
    }
  },

  /**
   * Lấy audit statistics
   */
  getAuditStatistics: async (days = 7) => {
    try {
      const response = await api.get(`/admin/audit-logs/statistics?days=${days}`);
      return response;
    } catch (error) {
      console.error('Error getting audit statistics:', error);
      // Return mock response for development
      return {
        data: {
          success: false,
          message: 'API endpoint not found (404). User activity statistics API not implemented yet.',
          data: null,
          error: {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
          }
        }
      };
    }
  },

  /**
   * Lấy monitoring statistics
   */
  getMonitoringStatistics: async () => {
    try {
      const response = await api.get('/admin/monitoring/statistics');
      return response;
    } catch (error) {
      console.error('Error getting monitoring statistics:', error);
      // Return mock response for development
      return {
        data: {
          success: false,
          message: 'API endpoint not found (404). Monitoring statistics API not implemented yet.',
          data: null,
          error: {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
          }
        }
      };
    }
  },

  /**
   * Lấy critical metrics
   */
  getCriticalMetrics: async () => {
    try {
      const response = await api.get('/admin/monitoring/critical');
      return response;
    } catch (error) {
      console.error('Error getting critical metrics:', error);
      // Return mock response for development
      return {
        data: {
          success: false,
          message: 'API endpoint not found (404). Critical metrics API not implemented yet.',
          data: null,
          error: {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
          }
        }
      };
    }
  },

  /**
   * Lấy user activity statistics
   */
  getUserActivityStatistics: async (days = 7) => {
    try {
      const response = await api.get(`/admin/users/activity-statistics?days=${days}`);
      return response;
    } catch (error) {
      console.error('Error getting user activity statistics:', error);
      // Return mock response for development
      return {
        data: {
          success: false,
          message: 'API endpoint not found (404). User activity statistics API not implemented yet.',
          data: null,
          error: {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
          }
        }
      };
    }
  },

  /**
   * Thực hiện health check
   */
  performHealthCheck: async () => {
    try {
      const response = await api.post('/admin/health/check');
      return response;
    } catch (error) {
      console.error('Error performing health check:', error);
      // Return mock response for development
      return {
        data: {
          success: false,
          message: 'API endpoint not found (404). User activity statistics API not implemented yet.',
          data: null,
          error: {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
          }
        }
      };
    }
  },

  // =================== AUDIT LOGS METHODS ===================
  
  /**
   * Lấy audit logs với pagination
   */
  getAuditLogs: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/audit-logs?${queryParams}`);
      return response;
    } catch (error) {
      console.error('Error getting audit logs:', error);
      throw error;
    }
  },

  /**
   * Lấy audit log theo ID
   */
  getAuditLogById: async (id) => {
    try {
      const response = await api.get(`/admin/audit-logs/${id}`);
      return response;
    } catch (error) {
      console.error('Error getting audit log by id:', error);
      throw error;
    }
  },

  /**
   * Export audit logs
   */
  exportAuditLogs: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/audit-logs/export?${queryParams}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  },

  // =================== USER MANAGEMENT METHODS ===================
  
  /**
   * Lấy tất cả users với pagination
   */
  getAllUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/users?${queryParams}`);
      return response;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  /**
   * Lấy user theo ID
   */
  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response;
    } catch (error) {
      console.error('Error getting user by id:', error);
      throw error;
    }
  },

  /**
   * Tạo user mới
   */
  createUser: async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Cập nhật user
   */
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/admin/users/${id}`, userData);
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Xóa user
   */
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Block/Unblock user
   */
  toggleUserStatus: async (id, isActive) => {
    try {
      const response = await api.patch(`/admin/users/${id}/status`, { isActive });
      return response;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },

  /**
   * Reset user password
   */
  resetUserPassword: async (id) => {
    try {
      const response = await api.post(`/admin/users/${id}/reset-password`);
      return response;
    } catch (error) {
      console.error('Error resetting user password:', error);
      throw error;
    }
  },

  // =================== SYSTEM SETTINGS METHODS ===================
  
  /**
   * Lấy system settings
   */
  getSystemSettings: async () => {
    try {
      const response = await api.get('/admin/settings');
      return response;
    } catch (error) {
      console.error('Error getting system settings:', error);
      // Return mock response for development
      return {
        data: {
          success: false,
          message: 'API endpoint not found (404). System settings API not available yet.',
          data: {
            siteName: 'Virtual Classroom System',
            language: 'vi',
            smtpHost: 'localhost',
            smtpPort: '587',
            enable2FA: 'false',
            sessionTimeout: '60',
            maxLoginAttempts: '5',
            lockoutDuration: '30',
            logoUrl: '/assets/logo.png'
          },
          error: {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
          }
        }
      };
    }
  },

  /**
   * Cập nhật system settings
   */
  updateSystemSettings: async (settings) => {
    try {
      const response = await api.put('/admin/settings', settings);
      return response;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  },

  /**
   * Backup database
   */
  backupDatabase: async () => {
    try {
      const response = await api.post('/admin/backup/database');
      return response;
    } catch (error) {
      console.error('Error backing up database:', error);
      throw error;
    }
  },

  /**
   * Restore database
   */
  restoreDatabase: async (backupFile) => {
    try {
      const formData = new FormData();
      formData.append('backup', backupFile);
      
      const response = await api.post('/admin/restore/database', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.error('Error restoring database:', error);
      throw error;
    }
  },

  // =================== UTILITY METHODS ===================
  
  /**
   * Upload file utility
   */
  uploadFile: async (file, path = '') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (path) {
        formData.append('path', path);
      }
      
      const response = await api.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  /**
   * Download blob file utility
   */
  downloadBlobFile: (blob, filename) => {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading blob file:', error);
      throw error;
    }
  },

  /**
   * Format error message
   */
  formatErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Đã xảy ra lỗi không xác định';
  }

};

export default adminService;