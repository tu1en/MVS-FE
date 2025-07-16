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