import axiosInstance from '../config/axiosInstance';

const API_BASE_URL = '/notifications/admin';

export const adminNotificationService = {
  // Create new admin notification
  createNotification: async (notificationData) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/create`, notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Get all admin notifications
  getAllNotifications: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get scheduled notifications
  getScheduledNotifications: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/scheduled`);
      return response.data;
    } catch (error) {
      console.error('Error fetching scheduled notifications:', error);
      throw error;
    }
  },

  // Update notification
  updateNotification: async (id, notificationData) => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/${id}`, notificationData);
      return response.data;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (id) => {
    try {
      const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Send notification immediately
  sendNotificationNow: async (id) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/${id}/send-now`);
      return response.data;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  },

  // Get notification statistics
  getNotificationStats: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  },

  // Get target audience options
  getTargetAudienceOptions: () => {
    return [
      { value: 'ALL', label: 'Tất cả người dùng', description: 'Gửi cho tất cả người dùng trong hệ thống' },
      { value: 'STUDENTS', label: 'Học sinh', description: 'Gửi cho tất cả học sinh' },
      { value: 'PARENTS', label: 'Phụ huynh', description: 'Gửi cho tất cả phụ huynh' },
      { value: 'TEACHERS', label: 'Giáo viên', description: 'Gửi cho tất cả giáo viên' },
      { value: 'ACCOUNTANTS', label: 'Kế toán', description: 'Gửi cho tất cả nhân viên kế toán' },
      { value: 'MANAGERS', label: 'Quản lý', description: 'Gửi cho tất cả quản lý' },
      { value: 'SPECIFIC_USER', label: 'Người dùng cụ thể', description: 'Gửi cho một người dùng cụ thể (cần ID)' },
      { value: 'SPECIFIC_CLASS', label: 'Lớp học cụ thể', description: 'Gửi cho tất cả học sinh trong một lớp (cần ID lớp)' }
    ];
  },

  // Get priority options
  getPriorityOptions: () => {
    return [
      { value: 'LOW', label: 'Thấp', color: 'gray' },
      { value: 'NORMAL', label: 'Bình thường', color: 'blue' },
      { value: 'HIGH', label: 'Cao', color: 'orange' },
      { value: 'URGENT', label: 'Khẩn cấp', color: 'red' }
    ];
  },

  // Get status options
  getStatusOptions: () => {
    return [
      { value: 'PENDING', label: 'Chờ gửi', color: 'orange' },
      { value: 'SCHEDULED', label: 'Đã lên lịch', color: 'blue' },
      { value: 'SENT', label: 'Đã gửi', color: 'green' },
      { value: 'FAILED', label: 'Thất bại', color: 'red' }
    ];
  },

  // Format notification data for API
  formatNotificationForAPI: (formData) => {
    return {
      title: formData.title,
      content: formData.content,
      targetAudience: formData.targetAudience,
      targetDetails: formData.targetDetails || null,
      scheduledAt: formData.scheduledAt ? formData.scheduledAt.format('YYYY-MM-DDTHH:mm:ss') : null,
      priority: formData.priority || 'NORMAL',
      createdBy: formData.createdBy || 'Admin' // Should be replaced with actual user info
    };
  },

  // Get target options based on audience type
  getTargetOptions: async (audienceType) => {
    try {
      const endpoint = `/notifications/admin/targets/${audienceType.toLowerCase()}`;
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${audienceType} options:`, error);
      throw error;
    }
  },

  // Search users for autocomplete
  searchUsers: async (query, type = '') => {
    try {
      const response = await axiosInstance.get('/notifications/admin/targets/search', {
        params: { query, type }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  // Validate notification data
  validateNotificationData: (data) => {
    const errors = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Tiêu đề không được để trống');
    }

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Nội dung không được để trống');
    }

    if (!data.targetAudience) {
      errors.push('Phải chọn đối tượng nhận thông báo');
    }

    // Only require targetDetails for SPECIFIC_USER and SPECIFIC_CLASS
    if (data.targetAudience === 'SPECIFIC_USER' && (!data.targetDetails || data.targetDetails.trim().length === 0)) {
      errors.push('Phải chọn người dùng cụ thể');
    }
    
    if (data.targetAudience === 'SPECIFIC_CLASS' && (!data.targetDetails || data.targetDetails.trim().length === 0)) {
      errors.push('Phải chọn lớp học cụ thể');
    }

    if (data.scheduledAt) {
      const now = new Date();
      const minAllowedTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
      
      if (data.scheduledAt.isBefore(minAllowedTime)) {
        errors.push('Thời gian lên lịch phải sau ít nhất 10 phút từ bây giờ');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default adminNotificationService;