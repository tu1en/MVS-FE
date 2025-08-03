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
      
      // Handle both string and number role values
      const roleStr = String(role).toUpperCase();
      const isTeacher = roleStr === '2' || roleStr === 'TEACHER';
      const endpoint = isTeacher ? '/announcements/teacher/unread-count' : '/announcements/student/unread-count';
      
      console.log('AnnouncementNotificationService: Using endpoint:', endpoint);
      
      const response = await apiClient.get(endpoint);
      console.log('AnnouncementNotificationService: Response status:', response.status);
      console.log('AnnouncementNotificationService: Response headers:', response.headers);
      console.log('AnnouncementNotificationService: Unread count response:', response.data);
      console.log('=== End API Debug ===');
      return response.data || 0;
    } catch (error) {
      console.error('=== API Error Debug ===');
      console.error('AnnouncementNotificationService: Error fetching unread announcement count:', error);
      console.error('AnnouncementNotificationService: Error status:', error.response?.status);
      console.error('AnnouncementNotificationService: Error data:', error.response?.data);
      console.error('AnnouncementNotificationService: Error headers:', error.response?.headers);
      console.error('AnnouncementNotificationService: Full error:', error);
      console.error('=== End API Error Debug ===');
      return 0;
    }
  },

  // Mark announcement as read
  markAnnouncementAsRead: async (announcementId) => {
    try {
      const response = await apiClient.post(`/announcements/${announcementId}/mark-read`);
      return response.data;
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      throw error;
    }
  },

  // Get recent unread announcements for current user
  getRecentUnreadAnnouncements: async (limit = 5) => {
    try {
      const role = localStorage.getItem('role');
      // Handle both string and number role values
      const roleStr = String(role).toUpperCase();
      const isTeacher = roleStr === '2' || roleStr === 'TEACHER';
      const endpoint = isTeacher ? `/announcements/teacher/recent-unread?limit=${limit}` : `/announcements/student/recent-unread?limit=${limit}`;
      const response = await apiClient.get(endpoint);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent unread announcements:', error);
      return [];
    }
  },

  // Mark all announcements as read for current user
  markAllAnnouncementsAsRead: async () => {
    try {
      const role = localStorage.getItem('role');
      // Handle both string and number role values
      const roleStr = String(role).toUpperCase();
      const isTeacher = roleStr === '2' || roleStr === 'TEACHER';
      const endpoint = isTeacher ? '/announcements/teacher/mark-all-read' : '/announcements/student/mark-all-read';
      const response = await apiClient.post(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error marking all announcements as read:', error);
      throw error;
    }
  }
};

export default announcementNotificationService;
