// services/notificationService.js - Fixed version
import axiosInstance from '../config/axiosInstance';

export const notificationService = {
  /**
   * Create a new notification
   * @param {Object} notification - Notification data
   * @param {string} notification.title - Notification title
   * @param {string} notification.content - Notification content
   * @param {string} notification.targetAudience - Target audience (students, teachers, all)
   * @param {number} [notification.recipientId] - Specific recipient ID (optional)
   * @returns {Promise<Object>} Created notification response
   */
  async createNotification(notification) {
    try {
      console.log('📢 NotificationService: Creating notification:', notification);
      
      // Validate required fields
      if (!notification.title || !notification.content) {
        throw new Error('Title and content are required');
      }
      
      // Prepare request payload
      const payload = {
        title: notification.title,
        content: notification.content,
        targetAudience: notification.targetAudience || 'students',
        recipientId: notification.recipientId || null,
        type: notification.type || null
      };
      
      console.log('📤 Sending notification payload:', payload);
      
      const response = await axiosInstance.post('/notifications', payload, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Notification created successfully:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ NotificationService error:', error);
      
      // Enhanced error handling
      if (error.response) {
        const { status, data } = error.response;
        console.error(`HTTP ${status}:`, data);
        
        switch (status) {
          case 404:
            throw new Error('Notification service endpoint not found');
          case 400:
            throw new Error(data.message || 'Invalid notification data');
          case 401:
            throw new Error('Unauthorized to create notifications');
          case 403:
            throw new Error('Forbidden to create notifications');
          case 500:
            throw new Error('Server error while creating notification');
          default:
            throw new Error(`HTTP ${status}: ${data.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        console.error('Network error:', error.request);
        throw new Error('Network error - cannot reach notification service');
      } else {
        console.error('Request setup error:', error.message);
        throw new Error('Request setup error: ' + error.message);
      }
    }
  },

  /**
   * Get notifications for current user
   * @param {Object} options - Query options
   * @param {number} [options.page=0] - Page number
   * @param {number} [options.size=20] - Page size
   * @param {boolean} [options.unreadOnly=false] - Only unread notifications
   * @returns {Promise<Object>} Notifications response
   */
  async getNotifications(options = {}) {
    try {
      const { page = 0, size = 20, unreadOnly = false } = options;
      
      console.log('📨 Getting notifications with options:', options);
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        unreadOnly: unreadOnly.toString()
      });
      
      const response = await axiosInstance.get(`/notifications?${params}`, {
        timeout: 10000
      });
      
      console.log('✅ Retrieved notifications:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      throw this.handleError(error, 'Failed to get notifications');
    }
  },

  /**
   * Get notifications for specific user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} List of notifications
   */
  async getNotificationsForUser(userId) {
    try {
      console.log(`📨 Getting notifications for user ${userId}`);
      
      const response = await axiosInstance.get(`/notifications/user/${userId}`, {
        timeout: 10000
      });
      
      console.log(`✅ Retrieved ${response.data.length} notifications for user ${userId}`);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Error getting notifications for user ${userId}:`, error);
      throw this.handleError(error, `Failed to get notifications for user ${userId}`);
    }
  },

  /**
   * Get teacher notifications
   * @returns {Promise<Array>} List of teacher notifications
   */
  async getTeacherNotifications() {
    try {
      console.log('📨 Getting teacher notifications');
      
      const response = await axiosInstance.get('/notifications/teacher', {
        timeout: 10000
      });
      
      console.log(`✅ Retrieved ${response.data.length} teacher notifications`);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error getting teacher notifications:', error);
      throw this.handleError(error, 'Failed to get teacher notifications');
    }
  },

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise<Object>} Success response
   */
  async markAsRead(notificationId) {
    try {
      console.log(`📖 Marking notification ${notificationId} as read`);
      
      const response = await axiosInstance.put(`/notifications/${notificationId}/read`, {}, {
        timeout: 5000
      });
      
      console.log(`✅ Notification ${notificationId} marked as read`);
      return response.data;
      
    } catch (error) {
      console.error(`❌ Error marking notification ${notificationId} as read:`, error);
      throw this.handleError(error, `Failed to mark notification ${notificationId} as read`);
    }
  },

  /**
   * Get all notifications (for debugging)
   * @returns {Promise<Object>} All notifications
   */
  async getAllNotifications() {
    try {
      console.log('📨 Getting all notifications (debug)');
      
      const response = await axiosInstance.get('/notifications/all', {
        timeout: 10000
      });
      
      console.log('✅ Retrieved all notifications:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error getting all notifications:', error);
      throw this.handleError(error, 'Failed to get all notifications');
    }
  },

  /**
   * Centralized error handling
   * @private
   */
  handleError(error, defaultMessage) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 404:
          return new Error('Notification service not found');
        case 400:
          return new Error(data.message || 'Bad request');
        case 401:
          return new Error('Authentication required');
        case 403:
          return new Error('Access forbidden');
        case 500:
          return new Error('Server error');
        default:
          return new Error(`HTTP ${status}: ${data.message || defaultMessage}`);
      }
    } else if (error.request) {
      return new Error('Network error - service unavailable');
    } else {
      return new Error(error.message || defaultMessage);
    }
  },

  /**
   * Check if notification service is available
   * @returns {Promise<boolean>} Service availability
   */
  async isServiceAvailable() {
    try {
      await axiosInstance.get('/notifications/all', { timeout: 5000 });
      return true;
    } catch (error) {
      console.warn('⚠️ Notification service not available:', error.message);
      return false;
    }
  }
};

export default notificationService;