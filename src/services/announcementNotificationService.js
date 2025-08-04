import apiClient from './api';

export const announcementNotificationService = {
  // Get unread announcement count for current user
  getUnreadAnnouncementCount: async () => {
    try {
      const role = localStorage.getItem('role');
      const token = localStorage.getItem('token');
      console.log('=== API Debug Info ===');
      console.log('AnnouncementNotificationService: Getting unread count for role:', role, 'type:', typeof role);
      console.log('AnnouncementNotificationService: Token exists:', !!token);
      console.log('AnnouncementNotificationService: Token preview:', token ? token.substring(0, 20) + '...' : 'null');

      const roleStr = String(role).toUpperCase();

      let endpoint;
      switch (roleStr) {
        case '2':
        case 'TEACHER':
          endpoint = '/announcements/teacher/unread-count';
          break;
        case '5':
        case 'ACCOUNTANT':
          endpoint = '/announcements/accountant/unread-count';
          break;
        case '4':
        case 'ADMIN':
          endpoint = '/announcements/admin/unread-count';
          break;
        default:
          endpoint = '/announcements/student/unread-count';
      }

      console.log('AnnouncementNotificationService: Using endpoint:', endpoint);

      const response = await apiClient.get(endpoint);
      console.log('AnnouncementNotificationService: Unread count response:', response.data);
      console.log('=== End API Debug ===');
      return response.data || 0;
    } catch (error) {
      console.error('=== API Error Debug ===');
      console.error('AnnouncementNotificationService: Error fetching unread announcement count:', error);
      console.error('AnnouncementNotificationService: Error status:', error.response?.status);
      console.error('AnnouncementNotificationService: Error data:', error.response?.data);
      console.error('AnnouncementNotificationService: Error headers:', error.response?.headers);
      console.error('=== End API Error Debug ===');
      return 0;
    }
  },

  markAnnouncementAsRead: async (announcementId) => {
    try {
      const response = await apiClient.post(`/announcements/${announcementId}/mark-read`);
      return response.data;
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      throw error;
    }
  },

  getRecentUnreadAnnouncements: async (limit = 5) => {
    try {
      const role = localStorage.getItem('role');
      const roleStr = String(role).toUpperCase();

      let endpoint;
      switch (roleStr) {
        case '2':
        case 'TEACHER':
          endpoint = `/announcements/teacher/recent-unread?limit=${limit}`;
          break;
        case '5':
        case 'ACCOUNTANT':
          endpoint = `/announcements/accountant/recent-unread?limit=${limit}`;
          break;
        case '4':
        case 'ADMIN':
          endpoint = `/announcements/admin/recent-unread?limit=${limit}`;
          break;
        default:
          endpoint = `/announcements/student/recent-unread?limit=${limit}`;
      }

      const response = await apiClient.get(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent unread announcements:', error);
      return [];
    }
  },

  markAllAnnouncementsAsRead: async () => {
    try {
      const role = localStorage.getItem('role');
      const roleStr = String(role).toUpperCase();

      let endpoint;
      switch (roleStr) {
        case '2':
        case 'TEACHER':
          endpoint = '/announcements/teacher/mark-all-read';
          break;
        case '5':
        case 'ACCOUNTANT':
          endpoint = '/announcements/accountant/mark-all-read';
          break;
        case '4':
        case 'ADMIN':
          endpoint = '/announcements/admin/mark-all-read';
          break;
        default:
          endpoint = '/announcements/student/mark-all-read';
      }

      const response = await apiClient.post(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error marking all announcements as read:', error);
      throw error;
    }
  }
};

export default announcementNotificationService;
