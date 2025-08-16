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
      // Normalize role: support numeric, plain text, or ROLE_ prefixed strings
      const roleStr = String(role).toUpperCase().replace('ROLE_', '');
      const isStudent = roleStr === '1' || roleStr === 'STUDENT';
      const isTeacher = roleStr === '2' || roleStr === 'TEACHER';
      const isManager = roleStr === '3' || roleStr === 'MANAGER';
      const isAdmin = roleStr === '4' || roleStr === 'ADMIN';
      const isAccountant = roleStr === '5' || roleStr === 'ACCOUNTANT';
      const isTeachingAssistant = roleStr === '6' || roleStr === 'TEACHING_ASSISTANT';
      const isParent = roleStr === '7' || roleStr === 'PARENT';
      
      let endpoint;
      if (isTeacher || isTeachingAssistant) {
        endpoint = '/announcements/teacher/unread-count';
      } else if (isAccountant) {
        endpoint = '/announcements/accountant/unread-count';
      } else if (isStudent) {
        endpoint = '/announcements/student/unread-count';
      } else if (isParent) {
        endpoint = '/announcements/parent/unread-count';
      } else if (isManager || isAdmin) {
        // Manager and Admin - temporarily disable announcements or use fallback
        console.log('Manager/Admin role detected - skipping announcement check');
        return 0; // Return 0 count for now
      } else {
        // Default to public/general endpoint or handle unknown roles  
        console.log('Unknown role detected:', roleStr, '- skipping announcement check');
        return 0;
      }
      
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
      const roleStr = String(role).toUpperCase().replace('ROLE_', '');
      const isStudent = roleStr === '1' || roleStr === 'STUDENT';
      const isTeacher = roleStr === '2' || roleStr === 'TEACHER';
      const isManager = roleStr === '3' || roleStr === 'MANAGER';
      const isAdmin = roleStr === '4' || roleStr === 'ADMIN';
      const isAccountant = roleStr === '5' || roleStr === 'ACCOUNTANT';
      const isTeachingAssistant = roleStr === '6' || roleStr === 'TEACHING_ASSISTANT';
      const isParent = roleStr === '7' || roleStr === 'PARENT';
      
      let endpoint;
      if (isTeacher || isTeachingAssistant) {
        endpoint = `/announcements/teacher/recent-unread?limit=${limit}`;
      } else if (isAccountant) {
        endpoint = `/announcements/accountant/recent-unread?limit=${limit}`;
      } else if (isStudent) {
        endpoint = `/announcements/student/recent-unread?limit=${limit}`;
      } else if (isParent) {
        endpoint = `/announcements/parent/recent-unread?limit=${limit}`;
      } else if (isManager || isAdmin) {
        console.log('Manager/Admin role detected - returning empty announcements');
        return [];
      } else {
        console.log('Unknown role detected - returning empty announcements');
        return [];
      }
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
      const roleStr = String(role).toUpperCase().replace('ROLE_', '');
      const isStudent = roleStr === '1' || roleStr === 'STUDENT';
      const isTeacher = roleStr === '2' || roleStr === 'TEACHER';
      const isManager = roleStr === '3' || roleStr === 'MANAGER';
      const isAdmin = roleStr === '4' || roleStr === 'ADMIN';
      const isAccountant = roleStr === '5' || roleStr === 'ACCOUNTANT';
      const isTeachingAssistant = roleStr === '6' || roleStr === 'TEACHING_ASSISTANT';
      const isParent = roleStr === '7' || roleStr === 'PARENT';
      
      let endpoint;
      if (isTeacher || isTeachingAssistant) {
        endpoint = '/announcements/teacher/mark-all-read';
      } else if (isAccountant) {
        endpoint = '/announcements/accountant/mark-all-read';
      } else if (isStudent) {
        endpoint = '/announcements/student/mark-all-read';
      } else if (isParent) {
        endpoint = '/announcements/parent/mark-all-read';
      } else if (isManager || isAdmin) {
        console.log('Manager/Admin role detected - no mark all read needed');
        return { success: true };
      } else {
        console.log('Unknown role detected - no mark all read needed');
        return { success: true };
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