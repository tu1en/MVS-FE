import apiClient from './apiClient';

/**
 * Service for manager-related API operations
 */
export const managerService = {
  /**
   * Get all users for management
   * @param {Object} params - Query parameters (page, size, search, etc.)
   * @returns {Promise<Object>} User list with pagination info
   */
  async getUsers(params = {}) {
    try {
      const response = await apiClient.get('/manager/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Update user status (active/inactive)
   * @param {number} userId - User ID
   * @param {boolean} enabled - Whether user is enabled
   * @returns {Promise<Object>} Updated user
   */
  async updateUserStatus(userId, enabled) {
    try {
      const response = await apiClient.put(`/manager/users/${userId}/status`, { enabled });
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  /**
   * Update user role
   * @param {number} userId - User ID
   * @param {string} role - New role
   * @returns {Promise<Object>} Updated user
   */
  async updateUserRole(userId, role) {
    try {
      const response = await apiClient.put(`/manager/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      const response = await apiClient.post('/manager/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Update user information
   * @param {number} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, userData) {
    try {
      const response = await apiClient.put(`/manager/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Delete a user
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    try {
      await apiClient.delete(`/manager/users/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Get all classrooms/courses
   * @returns {Promise<Array>} List of classrooms
   */
  async getClassrooms() {
    try {
      const response = await apiClient.get('/classrooms');
      return response.data;
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      throw error;
    }
  },

  /**
   * Create a new classroom
   * @param {Object} classroomData - Classroom data
   * @returns {Promise<Object>} Created classroom
   */
  async createClassroom(classroomData) {
    try {
      const response = await apiClient.post('/classrooms', classroomData);
      return response.data;
    } catch (error) {
      console.error('Error creating classroom:', error);
      throw error;
    }
  },

  /**
   * Update classroom information
   * @param {number} classroomId - Classroom ID
   * @param {Object} classroomData - Updated classroom data
   * @returns {Promise<Object>} Updated classroom
   */
  async updateClassroom(classroomId, classroomData) {
    try {
      const response = await apiClient.put(`/classrooms/${classroomId}`, classroomData);
      return response.data;
    } catch (error) {
      console.error('Error updating classroom:', error);
      throw error;
    }
  },

  /**
   * Delete a classroom
   * @param {number} classroomId - Classroom ID
   * @returns {Promise<void>}
   */
  async deleteClassroom(classroomId) {
    try {
      await apiClient.delete(`/classrooms/${classroomId}`);
    } catch (error) {
      console.error('Error deleting classroom:', error);
      throw error;
    }
  },

  /**
   * Get all teachers
   * @returns {Promise<Array>} List of teachers
   */
  async getTeachers() {
    try {
      const response = await apiClient.get('/manager/teachers');
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  },

  /**
   * Create a schedule
   * @param {Object} scheduleData - Schedule data
   * @returns {Promise<Object>} Created schedule
   */
  async createSchedule(scheduleData) {
    try {
      const response = await apiClient.post('/manager/schedules', scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },

  /**
   * Get all schedules
   * @returns {Promise<Array>} List of schedules
   */
  async getSchedules() {
    try {
      const response = await apiClient.get('/manager/schedules');
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  },

  /**
   * Delete a schedule
   * @param {number} scheduleId - Schedule ID
   * @returns {Promise<void>}
   */
  async deleteSchedule(scheduleId) {
    try {
      await apiClient.delete(`/manager/schedules/${scheduleId}`);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  },

  /**
   * Create a global announcement
   * @param {Object} announcementData - Announcement data
   * @returns {Promise<Object>} Created announcement
   */
  async createAnnouncement(announcementData) {
    try {
      const response = await apiClient.post('/announcements', announcementData);
      return response.data;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  /**
   * Get all announcements
   * @returns {Promise<Array>} List of announcements
   */
  async getAnnouncements() {
    try {
      const response = await apiClient.get('/announcements');
      return response.data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  },

  /**
   * Update an announcement
   * @param {number} announcementId - Announcement ID
   * @param {Object} announcementData - Updated announcement data
   * @returns {Promise<Object>} Updated announcement
   */
  async updateAnnouncement(announcementId, announcementData) {
    try {
      const response = await apiClient.put(`/announcements/${announcementId}`, announcementData);
      return response.data;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  },

  /**
   * Delete an announcement
   * @param {number} announcementId - Announcement ID
   * @returns {Promise<void>}
   */
  async deleteAnnouncement(announcementId) {
    try {
      await apiClient.delete(`/announcements/${announcementId}`);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },

  /**
   * Get manager profile
   * @returns {Promise<Object>} Manager profile data
   */
  async getProfile() {
    try {
      const response = await apiClient.get('/manager/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching manager profile:', error);
      throw error;
    }
  },

  /**
   * Update manager profile
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/manager/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating manager profile:', error);
      throw error;
    }
  },

  /**
   * Get system messages
   * @returns {Promise<Array>} List of messages
   */
  async getMessages() {
    try {
      const response = await apiClient.get('/manager/messages');
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  /**
   * Reply to a message
   * @param {number} messageId - Message ID
   * @param {string} content - Reply content
   * @returns {Promise<Object>} Reply message
   */
  async replyToMessage(messageId, content) {
    try {
      const response = await apiClient.post(`/manager/messages/${messageId}/reply`, { content });
      return response.data;
    } catch (error) {
      console.error('Error replying to message:', error);
      throw error;
    }
  },

  /**
   * Mark message as read
   * @param {number} messageId - Message ID
   * @returns {Promise<void>}
   */
  async markMessageAsRead(messageId) {
    try {
      await apiClient.put(`/manager/messages/${messageId}/read`);
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  /**
   * Delete a message
   * @param {number} messageId - Message ID
   * @returns {Promise<void>}
   */
  async deleteMessage(messageId) {
    try {
      await apiClient.delete(`/manager/messages/${messageId}`);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  /**
   * Send a message
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} Sent message
   */
  async sendMessage(messageData) {
    try {
      const response = await apiClient.post('/manager/messages', messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Update a schedule
   * @param {number} scheduleId - Schedule ID
   * @param {Object} scheduleData - Updated schedule data
   * @returns {Promise<Object>} Updated schedule
   */
  async updateSchedule(scheduleId, scheduleData) {
    try {
      const response = await apiClient.put(`/manager/schedules/${scheduleId}`, scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  },

  /**
   * Delete a schedule
   * @param {number} scheduleId - Schedule ID
   * @returns {Promise<void>}
   */
  async deleteSchedule(scheduleId) {
    try {
      await apiClient.delete(`/manager/schedules/${scheduleId}`);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  },

  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/manager/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};

export default managerService;
