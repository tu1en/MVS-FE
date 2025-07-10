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
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Timetable Service for handling calendar and scheduling operations
 */
class TimetableService {

  /**
   * Get user's timetable for a specific date range
   * @param {Object} params - Query parameters including startDate, endDate, etc.
   * @returns {Promise<Array>} List of timetable events
   */
  static async getTimetable(params = {}) {
    try {
      const response = await apiClient.get('/timetable', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching timetable:', error);
      throw error;
    }
  }

  /**
   * Get current user's timetable (for students)
   * @param {Object} params - Query parameters including startDate, endDate
   * @returns {Promise<Array>} List of timetable events for current user
   */
  static async getMyTimetable(params = {}) {
    try {
      console.log('📅 TimetableService.getMyTimetable: Fetching with params:', params);
      const response = await apiClient.get('/timetable/my-timetable', { params });
      console.log('📅 TimetableService.getMyTimetable: Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching my timetable:', error);
      console.error('   Status:', error.response?.status);
      console.error('   Data:', error.response?.data);
      throw error;
    }
  }

  /**
   * Get timetable for a specific user
   * @param {number} userId - User ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} User's timetable events
   */
  static async getUserTimetable(userId, params = {}) {
    try {
      const response = await apiClient.get(`/timetable/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user timetable:', error);
      throw error;
    }
  }

  /**
   * Get timetable for a specific course
   * @param {number} courseId - Course ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Course timetable events
   */
  static async getCourseTimetable(courseId, params = {}) {
    try {
      const response = await apiClient.get(`/timetable/course/${courseId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching course timetable:', error);
      throw error;
    }
  }

  /**
   * Create a new timetable event
   * @param {Object} eventData - Event data
   * @returns {Promise<Object>} Created event
   */
  static async createEvent(eventData) {
    try {
      const response = await apiClient.post('/timetable/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating timetable event:', error);
      throw error;
    }
  }

  /**
   * Update a timetable event
   * @param {number} eventId - Event ID
   * @param {Object} eventData - Updated event data
   * @returns {Promise<Object>} Updated event
   */
  static async updateEvent(eventId, eventData) {
    try {
      const response = await apiClient.put(`/timetable/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error updating timetable event:', error);
      throw error;
    }
  }

  /**
   * Delete a timetable event
   * @param {number} eventId - Event ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteEvent(eventId) {
    try {
      const response = await apiClient.delete(`/timetable/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting timetable event:', error);
      throw error;
    }
  }

  /**
   * Get a specific event by ID
   * @param {number} eventId - Event ID
   * @returns {Promise<Object>} Event details
   */
  static async getEvent(eventId) {
    try {
      const response = await apiClient.get(`/timetable/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  /**
   * Create recurring events
   * @param {Object} eventData - Recurring event data
   * @returns {Promise<Array>} Created recurring events
   */
  static async createRecurringEvents(eventData) {
    try {
      const response = await apiClient.post('/timetable/events/recurring', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating recurring events:', error);
      throw error;
    }
  }

  /**
   * Update recurring events
   * @param {number} eventId - Base event ID
   * @param {Object} updateData - Update data
   * @param {string} updateScope - 'single', 'future', or 'all'
   * @returns {Promise<Object>} Update result
   */
  static async updateRecurringEvents(eventId, updateData, updateScope = 'single') {
    try {
      const response = await apiClient.put(`/timetable/events/${eventId}/recurring`, {
        ...updateData,
        updateScope
      });
      return response.data;
    } catch (error) {
      console.error('Error updating recurring events:', error);
      throw error;
    }
  }

  /**
   * Check for scheduling conflicts
   * @param {Object} eventData - Event data to check
   * @returns {Promise<Object>} Conflict check result
   */
  static async checkConflicts(eventData) {
    try {
      const response = await apiClient.post('/timetable/check-conflicts', eventData);
      return response.data;
    } catch (error) {
      console.error('Error checking conflicts:', error);
      throw error;
    }
  }

  /**
   * Get available time slots
   * @param {Object} criteria - Search criteria (date, duration, participants, etc.)
   * @returns {Promise<Array>} Available time slots
   */
  static async getAvailableSlots(criteria) {
    try {
      const response = await apiClient.post('/timetable/available-slots', criteria);
      return response.data;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error;
    }
  }

  /**
   * Get calendar view data
   * @param {string} view - Calendar view type ('day', 'week', 'month', 'agenda')
   * @param {Object} params - View parameters
   * @returns {Promise<Object>} Calendar view data
   */
  static async getCalendarView(view = 'week', params = {}) {
    try {
      const response = await apiClient.get(`/timetable/calendar/${view}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching calendar view:', error);
      throw error;
    }
  }

  /**
   * Subscribe to calendar notifications
   * @param {Object} subscriptionData - Subscription preferences
   * @returns {Promise<Object>} Subscription result
   */
  static async subscribeToNotifications(subscriptionData) {
    try {
      const response = await apiClient.post('/timetable/notifications/subscribe', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      throw error;
    }
  }

  /**
   * Export timetable to external calendar
   * @param {string} format - Export format ('ical', 'outlook', 'google')
   * @param {Object} params - Export parameters
   * @returns {Promise<Blob>} Exported calendar file
   */
  static async exportTimetable(format = 'ical', params = {}) {
    try {
      const response = await apiClient.get(`/timetable/export/${format}`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting timetable:', error);
      throw error;
    }
  }

  /**
   * Import events from external calendar
   * @param {FormData} formData - Calendar file data
   * @returns {Promise<Object>} Import result
   */
  static async importTimetable(formData) {
    try {
      const response = await apiClient.post('/timetable/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error importing timetable:', error);
      throw error;
    }
  }

  /**
   * Get room/resource availability
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Array>} Available rooms/resources
   */
  static async getResourceAvailability(criteria) {
    try {
      const response = await apiClient.post('/timetable/resources/availability', criteria);
      return response.data;
    } catch (error) {
      console.error('Error fetching resource availability:', error);
      throw error;
    }
  }

  /**
   * Book a room/resource
   * @param {Object} bookingData - Booking data
   * @returns {Promise<Object>} Booking result
   */
  static async bookResource(bookingData) {
    try {
      const response = await apiClient.post('/timetable/resources/book', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error booking resource:', error);
      throw error;
    }
  }

  /**
   * Get personal schedule settings
   * @returns {Promise<Object>} Schedule settings
   */
  static async getScheduleSettings() {
    try {
      const response = await apiClient.get('/timetable/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule settings:', error);
      throw error;
    }
  }

  /**
   * Update personal schedule settings
   * @param {Object} settings - Updated settings
   * @returns {Promise<Object>} Updated settings
   */
  static async updateScheduleSettings(settings) {
    try {
      const response = await apiClient.put('/timetable/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating schedule settings:', error);
      throw error;
    }
  }

  /**
   * Get upcoming events/deadlines
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Upcoming events
   */
  static async getUpcomingEvents(params = {}) {
    try {
      const response = await apiClient.get('/timetable/upcoming', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  /**
   * Mark event as attended
   * @param {number} eventId - Event ID
   * @param {Object} attendanceData - Attendance data
   * @returns {Promise<Object>} Attendance record
   */
  static async markAttendance(eventId, attendanceData) {
    try {
      const response = await apiClient.post(`/timetable/events/${eventId}/attendance`, attendanceData);
      return response.data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }

  /**
   * Get attendance report for an event
   * @param {number} eventId - Event ID
   * @returns {Promise<Object>} Attendance report
   */
  static async getAttendanceReport(eventId) {
    try {
      const response = await apiClient.get(`/timetable/events/${eventId}/attendance-report`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      throw error;
    }
  }
}

export default TimetableService;
