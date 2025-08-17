import apiClient from './api';

export const announcementNotificationService = {
  // Get unread announcement count for current user
  getUnreadAnnouncementCount: async () => {
    try {
      const role = localStorage.getItem('role');
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      console.log('=== API Debug Info ===');
      console.log('AnnouncementNotificationService: Getting unread count for role:', role, 'userId:', userId, 'type:', typeof role);
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
      
      let totalCount = 0;
      
      // First, try to get admin notifications for this user
      if (userId && userId !== 'undefined' && userId !== 'null' && !isNaN(userId)) {
        try {
          console.log('AnnouncementNotificationService: Checking admin notifications for userId:', userId);
          const adminNotificationsResponse = await apiClient.get(`/notifications/user/${userId}`);
          const adminNotifications = adminNotificationsResponse.data || [];
          const unreadAdminCount = adminNotifications.filter(n => !n.isRead).length;
          console.log('AnnouncementNotificationService: Admin notifications count:', unreadAdminCount);
          totalCount += unreadAdminCount;
        } catch (error) {
          console.log('AnnouncementNotificationService: No admin notifications or error:', error.message);
        }
      } else {
        console.log('AnnouncementNotificationService: Invalid or missing userId:', userId);
      }
      
      // Then, get role-specific announcements
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
        // Manager and Admin - only show admin notifications
        console.log('Manager/Admin role detected - only showing admin notifications');
        console.log('=== End API Debug ===');
        return totalCount;
      } else {
        // Default to public/general endpoint or handle unknown roles  
        console.log('Unknown role detected:', roleStr, '- only showing admin notifications');
        console.log('=== End API Debug ===');
        return totalCount;
      }
      
      console.log('AnnouncementNotificationService: Using endpoint:', endpoint);
      
      try {
        const response = await apiClient.get(endpoint);
        console.log('AnnouncementNotificationService: Response status:', response.status);
        console.log('AnnouncementNotificationService: Response headers:', response.headers);
        console.log('AnnouncementNotificationService: Unread count response:', response.data);
        totalCount += (response.data || 0);
      } catch (error) {
        console.log('AnnouncementNotificationService: Role-specific announcements error:', error.message);
      }
      
      console.log('AnnouncementNotificationService: Total count:', totalCount);
      console.log('=== End API Debug ===');
      return totalCount;
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
  markAnnouncementAsRead: async (announcementId, currentRole) => {
    try {
      // First try to mark as admin notification
      try {
        const response = await apiClient.put(`/notifications/${announcementId}/read`);
        return response.data;
      } catch (adminError) {
        console.log('Not an admin notification, trying role-specific announcement');
        // If that fails, try role-specific announcement endpoint
        const response = await apiClient.post(`/announcements/${announcementId}/mark-read`);
        return response.data;
      }
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      throw error;
    }
  },

  // Get recent unread announcements for current user
  getRecentUnreadAnnouncements: async (limit = 5) => {
    try {
      const role = localStorage.getItem('role');
      const userId = localStorage.getItem('userId');
      
      // Handle both string and number role values
      const roleStr = String(role).toUpperCase().replace('ROLE_', '');
      const isStudent = roleStr === '1' || roleStr === 'STUDENT';
      const isTeacher = roleStr === '2' || roleStr === 'TEACHER';
      const isManager = roleStr === '3' || roleStr === 'MANAGER';
      const isAdmin = roleStr === '4' || roleStr === 'ADMIN';
      const isAccountant = roleStr === '5' || roleStr === 'ACCOUNTANT';
      const isTeachingAssistant = roleStr === '6' || roleStr === 'TEACHING_ASSISTANT';
      const isParent = roleStr === '7' || roleStr === 'PARENT';
      
      let allAnnouncements = [];
      
      // First, get admin notifications for this user
      if (userId && userId !== 'undefined' && userId !== 'null' && !isNaN(userId)) {
        try {
          console.log('AnnouncementNotificationService: Getting recent admin notifications for userId:', userId);
          const adminNotificationsResponse = await apiClient.get(`/notifications/user/${userId}`);
          const adminNotifications = adminNotificationsResponse.data || [];
          const unreadAdminNotifications = adminNotifications
            .filter(n => !n.isRead)
            .map(n => ({
              id: n.id,
              title: n.title || n.message,
              content: n.content || n.message,
              createdAt: n.createdAt,
              priority: n.priority || 'NORMAL',
              type: 'admin'
            }));
          console.log('AnnouncementNotificationService: Admin notifications:', unreadAdminNotifications.length);
          allAnnouncements.push(...unreadAdminNotifications);
        } catch (error) {
          console.log('AnnouncementNotificationService: No admin notifications or error:', error.message);
        }
      } else {
        console.log('AnnouncementNotificationService: Invalid or missing userId:', userId);
      }
      
      // Then, get role-specific announcements
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
        console.log('Manager/Admin role detected - only showing admin notifications');
        return allAnnouncements.slice(0, limit);
      } else {
        console.log('Unknown role detected - only showing admin notifications');
        return allAnnouncements.slice(0, limit);
      }
      
      try {
        const response = await apiClient.get(endpoint);
        const roleAnnouncements = (response.data || []).map(n => ({
          ...n,
          type: 'role'
        }));
        allAnnouncements.push(...roleAnnouncements);
      } catch (error) {
        console.log('AnnouncementNotificationService: Role-specific announcements error:', error.message);
      }
      
      // Sort by creation date (newest first) and limit
      allAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return allAnnouncements.slice(0, limit);
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