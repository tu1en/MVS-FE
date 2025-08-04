import api from '../config/axiosInstance';

const adminService = {
    // =================== USER MANAGEMENT ===================

    getUsers: (params) => {
        return api.get('/admin/users', { params });
    },

    updateUserStatus: (userId, enabled) => {
        return api.put(`/admin/users/${userId}/status`, { enabled });
    },

    updateUserRoles: (userId, role) => {
        return api.put(`/admin/users/${userId}/roles`, { roles: [role] });
    },

    createUser: async (userData) => {
        try {
            const response = await api.post('/admin/users', userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create user');
        }
    },

    resetUserPassword: async (userId) => {
        try {
            const response = await api.put(`/admin/users/${userId}/reset-password`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to reset password');
        }
    },

    checkEmailExists: async (email) => {
        try {
            const response = await api.get('/admin/users/check-email', { params: { email } });
            return response.data.exists;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to check email');
        }
    },

    // =================== AUDIT LOGS ===================

    getAuditLogs: async (params = {}) => {
        try {
            const queryParams = {
                page: 0,
                size: 20,
                sortBy: 'timestamp',
                sortDir: 'desc',
                ...params
            };
            const response = await api.get('/admin/audit-logs', { params: queryParams });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || `Failed to fetch audit logs: ${error.message}`);
        }
    },

    getAuditStatistics: async (params) => {
        try {
            let queryParams = {};
            if (typeof params === 'number') {
                queryParams = { days: params };
            } else if (typeof params === 'object' && params !== null) {
                queryParams = { ...params };
            } else {
                queryParams = { days: 7 };
            }
            const response = await api.get('/admin/audit-logs/statistics', { params: queryParams });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || `Failed to fetch audit statistics: ${error.message}`);
        }
    },

    getAuditLogById: async (logId) => {
        try {
            const response = await api.get(`/admin/audit-logs/${logId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch audit log details');
        }
    },

    exportAuditLogs: async (params = {}) => {
        try {
            const queryParams = {
                format: 'csv',
                ...params
            };
            const response = await api.get('/admin/audit-logs/export', {
                params: queryParams,
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to export audit logs');
        }
    },

    // =================== SYSTEM CONFIGURATION ===================

    getSystemConfig: async () => {
        try {
            const response = await api.get('/admin/system/config');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch system configuration');
        }
    },

    updateSystemConfig: async (config) => {
        try {
            const response = await api.put('/admin/system/config', config);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update system configuration');
        }
    },

    // =================== SYSTEM ACTIVITY LOGS ===================

    getSystemLogs: async (page = 0, size = 20) => {
        try {
            const response = await api.get('/admin/system-logs', { 
                params: { page, size } 
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch system logs');
        }
    },

    getSystemLogsByUser: async (userId, page = 0, size = 20) => {
        try {
            const response = await api.get('/admin/system-logs/by-user', { 
                params: { userId, page, size } 
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch system logs by user');
        }
    },

    getSystemLogsByAction: async (action, page = 0, size = 20) => {
        try {
            const response = await api.get('/admin/system-logs/by-action', { 
                params: { action, page, size } 
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch system logs by action');
        }
    },

    // =================== SYSTEM CHARTS ===================

    getSystemCharts: async (page = 0, size = 20) => {
        try {
            const response = await api.get('/admin/system-charts', { 
                params: { page, size } 
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch system charts');
        }
    },

    getSystemChartById: async (chartId) => {
        try {
            const response = await api.get(`/admin/system-charts/${chartId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch system chart');
        }
    },

    createSystemChart: async (chartData) => {
        try {
            const response = await api.post('/admin/system-charts', chartData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create system chart');
        }
    },

    updateSystemChart: async (chartId, chartData) => {
        try {
            const response = await api.put(`/admin/system-charts/${chartId}`, chartData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update system chart');
        }
    },

    deleteSystemChart: async (chartId) => {
        try {
            const response = await api.delete(`/admin/system-charts/${chartId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete system chart');
        }
    },

    // =================== SYSTEM SETTINGS ===================

    getSystemSettings: async () => {
        try {
            const response = await api.get('/admin/system-settings');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch system settings');
        }
    },

    updateSystemSettings: async (settings) => {
        try {
            const response = await api.put('/admin/system-settings', settings);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update system settings');
        }
    },

    testSMTPConnection: async () => {
        try {
            const response = await api.post('/admin/system-settings/test-smtp');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to test SMTP connection');
        }
    }
};

export default adminService;
