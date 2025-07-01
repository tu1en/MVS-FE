import axios from 'axios';
import API_CONFIG from '../config/api-config.js';

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Do not force logout here; let frontend handle 401 gracefully
    return Promise.reject(error);
  }
);

/**
 * Announcement Service for handling announcements and notifications
 */
class AnnouncementService {

  /**
   * Get announcements for current user
   * @param {Object} params - Query parameters including filter, search, etc.
   * @returns {Promise<Array>} List of announcements
   */
  static async getAnnouncements(params = {}) {
    try {
      const response = await apiClient.get('/announcements', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  }

  /**
   * Get announcements for a specific user
   * @param {number} userId - User ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} User's announcements
   */
  static async getUserAnnouncements(userId, params = {}) {
    try {
      const response = await apiClient.get(`/announcements/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user announcements:', error);
      throw error;
    }
  }

  /**
   * Get announcements for a specific course
   * @param {number} courseId - Course ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Course announcements
   */
  static async getCourseAnnouncements(courseId, params = {}) {
    try {
      const response = await apiClient.get(`/announcements/course/${courseId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching course announcements:', error);
      throw error;
    }
  }

  /**
   * Create a new announcement
   * @param {Object} announcementData - Announcement data
   * @returns {Promise<Object>} Created announcement
   */
  static async createAnnouncement(announcementData) {
    try {
      const response = await apiClient.post('/announcements', announcementData);
      return response.data;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  /**
   * Update an announcement
   * @param {number} announcementId - Announcement ID
   * @param {Object} announcementData - Updated announcement data
   * @returns {Promise<Object>} Updated announcement
   */
  static async updateAnnouncement(announcementId, announcementData) {
    try {
      const response = await apiClient.put(`/announcements/${announcementId}`, announcementData);
      return response.data;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  }

  /**
   * Delete an announcement
   * @param {number} announcementId - Announcement ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteAnnouncement(announcementId) {
    try {
      const response = await apiClient.delete(`/announcements/${announcementId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }

  /**
   * Mark announcement as read
   * @param {number} announcementId - Announcement ID
   * @returns {Promise<Object>} Read status update result
   */
  static async markAsRead(announcementId) {
    try {
      const response = await apiClient.post(`/announcements/${announcementId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      throw error;
    }
  }

  /**
   * Mark announcement as unread
   * @param {number} announcementId - Announcement ID
   * @returns {Promise<Object>} Read status update result
   */
  static async markAsUnread(announcementId) {
    try {
      const response = await apiClient.post(`/announcements/${announcementId}/unread`);
      return response.data;
    } catch (error) {
      console.error('Error marking announcement as unread:', error);
      throw error;
    }
  }

  /**
   * Mark all announcements as read
   * @returns {Promise<Object>} Bulk read status update result
   */
  static async markAllAsRead() {
    try {
      const response = await apiClient.post('/announcements/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all announcements as read:', error);
      throw error;
    }
  }

  /**
   * Get unread announcements count
   * @returns {Promise<Object>} Unread count data
   */
  static async getUnreadCount() {
    try {
      const response = await apiClient.get('/announcements/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * Search announcements
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Search results
   */
  static async searchAnnouncements(query, filters = {}) {
    try {
      const params = { query, ...filters };
      const response = await apiClient.get('/announcements/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching announcements:', error);
      throw error;
    }
  }

  /**
   * Get announcement categories
   * @returns {Promise<Array>} List of categories
   */
  static async getCategories() {
    try {
      const response = await apiClient.get('/announcements/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching announcement categories:', error);
      throw error;
    }
  }

  /**
   * Pin an announcement
   * @param {number} announcementId - Announcement ID
   * @returns {Promise<Object>} Pin result
   */
  static async pinAnnouncement(announcementId) {
    try {
      const response = await apiClient.post(`/announcements/${announcementId}/pin`);
      return response.data;
    } catch (error) {
      console.error('Error pinning announcement:', error);
      throw error;
    }
  }

  /**
   * Unpin an announcement
   * @param {number} announcementId - Announcement ID
   * @returns {Promise<Object>} Unpin result
   */
  static async unpinAnnouncement(announcementId) {
    try {
      const response = await apiClient.post(`/announcements/${announcementId}/unpin`);
      return response.data;
    } catch (error) {
      console.error('Error unpinning announcement:', error);
      throw error;
    }
  }

  /**
   * Get pinned announcements
   * @returns {Promise<Array>} List of pinned announcements
   */
  static async getPinnedAnnouncements() {
    try {
      const response = await apiClient.get('/announcements/pinned');
      return response.data;
    } catch (error) {
      console.error('Error fetching pinned announcements:', error);
      throw error;
    }
  }

  /**
   * Archive an announcement
   * @param {number} announcementId - Announcement ID
   * @returns {Promise<Object>} Archive result
   */
  static async archiveAnnouncement(announcementId) {
    try {
      const response = await apiClient.post(`/announcements/${announcementId}/archive`);
      return response.data;
    } catch (error) {
      console.error('Error archiving announcement:', error);
      throw error;
    }
  }

  /**
   * Get archived announcements
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of archived announcements
   */
  static async getArchivedAnnouncements(params = {}) {
    try {
      const response = await apiClient.get('/announcements/archived', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching archived announcements:', error);
      throw error;
    }
  }

  /**
   * Subscribe to announcement notifications
   * @param {Object} subscriptionData - Subscription preferences
   * @returns {Promise<Object>} Subscription result
   */
  static async subscribeToNotifications(subscriptionData) {
    try {
      const response = await apiClient.post('/announcements/subscribe', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences
   * @returns {Promise<Object>} Notification preferences
   */
  static async getNotificationPreferences() {
    try {
      const response = await apiClient.get('/announcements/notification-preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   * @param {Object} preferences - Updated preferences
   * @returns {Promise<Object>} Updated preferences
   */
  static async updateNotificationPreferences(preferences) {
    try {
      const response = await apiClient.put('/announcements/notification-preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }
}

export default AnnouncementService;
