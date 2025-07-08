import api from '../config/axiosInstance';

const adminService = {
    getUsers: (params) => {
        // params = { page: 0, size: 10, sort: 'fullName,asc', keyword: '...' }
        return api.get('/admin/users', { params });
    },
    updateUserStatus: (userId, enabled) => {
        return api.put(`/admin/users/${userId}/status`, { enabled });
    },
    updateUserRoles: (userId, roles) => {
        return api.put(`/admin/users/${userId}/roles`, { roles });
    }
};

export default adminService; 