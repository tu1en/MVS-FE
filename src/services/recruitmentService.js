import apiClient from '../config/axiosInstance';

const API_URL = '/api/recruitment-applications';

export const recruitmentService = {
  // Lấy thông tin CV của ứng viên
  getCvInfo: async (applicationId) => {
    try {
      const response = await apiClient.get(`${API_URL}/${applicationId}/cv`);
      return response.data;
    } catch (error) {
      console.error('Error fetching CV info:', error);
      throw error;
    }
  },

  // Lấy danh sách tất cả ứng viên
  getAllApplications: async () => {
    try {
      const response = await apiClient.get(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  // Lấy danh sách ứng viên đã duyệt
  getApprovedApplications: async () => {
    try {
      const response = await apiClient.get(`${API_URL}/approved`);
      return response.data;
    } catch (error) {
      console.error('Error fetching approved applications:', error);
      throw error;
    }
  },

  // Lấy chi tiết ứng viên
  getApplication: async (id) => {
    try {
      const response = await apiClient.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  },

  // Duyệt ứng viên
  approveApplication: async (id) => {
    try {
      const response = await apiClient.post(`${API_URL}/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving application:', error);
      throw error;
    }
  },

  // Từ chối ứng viên
  rejectApplication: async (id, reason) => {
    try {
      const response = await apiClient.post(`${API_URL}/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting application:', error);
      throw error;
    }
  },

  // Xóa ứng viên
  deleteApplication: async (id) => {
    try {
      const response = await apiClient.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  }
}; 