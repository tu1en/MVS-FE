import api from '../config/axiosInstance';

const adminService = {
    // User Management
    getUsers: (params) => {
        // params = { page: 0, size: 10, sort: 'fullName,asc', keyword: '...' }
        return api.get('/admin/users', { params });
    },
    updateUserStatus: (userId, enabled) => {
        return api.put(`/admin/users/${userId}/status`, { enabled });
    },
    updateUserRoles: (userId, role) => {
        // Luôn gửi payload là { roles: [role] }
        return api.put(`/admin/users/${userId}/roles`, { roles: [role] });
    },

    // Audit Logs Management
    getAuditLogs: (params) => {
        // params = { page: 0, size: 20, sortBy: 'timestamp', sortDir: 'desc' }
        return api.get('/admin/audit-logs', { params });
    },
    getAuditLogById: (id) => {
        return api.get(`/admin/audit-logs/${id}`);
    },
    getSecurityLogs: (params) => {
        // params = { page: 0, size: 20 }
        return api.get('/admin/audit-logs/security', { params });
    },
    getAuditStatistics: (days = 7) => {
        return api.get('/admin/audit-logs/statistics', { params: { days } });
    },
    cleanupAuditLogs: (daysToKeep = 90) => {
        return api.post('/admin/maintenance/cleanup-audit-logs', { daysToKeep });
    },

    // ================== SYSTEM SETTINGS ==================
    
    /**
     * Lấy tất cả system settings
     */
    getSystemSettings: () => {
        return api.get('/api/admin/system-settings');
    },
    
    /**
     * Cập nhật system settings
     */
    updateSystemSettings: (settings) => {
        return api.put('/api/admin/system-settings', settings);
    },
    
    /**
     * Test kết nối SMTP
     */
    testSMTPConnection: () => {
        return api.post('/api/admin/system-settings/test-smtp');
    },
    
    /**
     * Lấy setting cụ thể theo key
     */
    getSetting: (key) => {
        return api.get(`/api/admin/system-settings/${key}`);
    },
    
    /**
     * Lấy settings theo prefix
     */
    getSettingsByPrefix: (prefix) => {
        return api.get(`/api/admin/system-settings/prefix/${prefix}`);
    },
    
    /**
     * Xóa setting
     */
    deleteSetting: (key) => {
        return api.delete(`/api/admin/system-settings/${key}`);
    },

    // ================== WORKFLOWS ==================
    
    /**
     * Lấy tất cả workflows
     */
    getAllWorkflows: () => {
        return api.get('/api/admin/workflows');
    },
    
    /**
     * Lấy workflow theo ID
     */
    getWorkflow: (id) => {
        return api.get(`/api/admin/workflows/${id}`);
    },
    
    /**
     * Tạo workflow mới
     */
    createWorkflow: (workflowData) => {
        return api.post('/api/admin/workflows', workflowData);
    },
    
    /**
     * Cập nhật workflow
     */
    updateWorkflow: (id, workflowData) => {
        return api.put(`/api/admin/workflows/${id}`, workflowData);
    },
    
    /**
     * Xóa workflow
     */
    deleteWorkflow: (id) => {
        return api.delete(`/api/admin/workflows/${id}`);
    },
    
    /**
     * Lấy workflows active
     */
    getActiveWorkflows: () => {
        return api.get('/api/admin/workflows/active');
    },
    
    /**
     * Duplicate workflow
     */
    duplicateWorkflow: (id, newName) => {
        return api.post(`/api/admin/workflows/${id}/duplicate?newName=${encodeURIComponent(newName)}`);
    },
    
    /**
     * Export workflow as JSON
     */
    exportWorkflow: (id) => {
        return api.get(`/api/admin/workflows/${id}/export`, {
            responseType: 'blob',
        });
    },

    // ================== HELPER METHODS ==================
    
    /**
     * Validate workflow JSON data
     */
    validateWorkflowJSON: (jsonString) => {
        try {
            const data = JSON.parse(jsonString);
            return data.nodes && data.edges && Array.isArray(data.nodes) && Array.isArray(data.edges);
        } catch {
            return false;
        }
    },
    
    /**
     * Download file từ blob response
     */
    downloadFile: (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create user');
  }
};

// Reset user password to default
export const resetUserPassword = async (userId) => {
  try {
    const response = await api.post(`/admin/users/${userId}/reset-password`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reset password');
  }
};

export default adminService; 