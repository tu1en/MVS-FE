import apiClient from './apiClient';

const roomService = {
  /**
   * Get all rooms with optional filtering
   * @param {Object} params - Query parameters
   * @param {string} params.building - Building filter
   * @param {string} params.type - Room type filter
   * @param {string} params.status - Status filter
   * @returns {Promise<Array>} List of rooms
   */
  getAllRooms: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.building) queryParams.append('building', params.building);
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);

    const url = `/rooms${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiClient.get(url);
  },

  /**
   * Get room by ID
   * @param {number} id - Room ID
   * @returns {Promise<Object>} Room details
   */
  getRoomById: (id) => {
    return apiClient.get(`/rooms/${id}`);
  },

  /**
   * Check room availability for a time slot
   * @param {Object} params - Availability check parameters
   * @param {number} params.roomId - Room ID
   * @param {string} params.date - Date (YYYY-MM-DD)
   * @param {string} params.startTime - Start time (HH:mm)
   * @param {string} params.endTime - End time (HH:mm)
   * @param {number} params.excludeClassId - Class ID to exclude from conflict check
   * @returns {Promise<Object>} Availability result
   */
  checkRoomAvailability: (params) => {
    return apiClient.post('/rooms/check-availability', params);
  },

  /**
   * Get room schedule for a date range
   * @param {number} roomId - Room ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Room schedule
   */
  getRoomSchedule: (roomId, startDate, endDate) => {
    return apiClient.get(`/rooms/${roomId}/schedule`, {
      params: { startDate, endDate }
    });
  },

  /**
   * Get available rooms for a time slot
   * @param {Object} params - Search parameters
   * @param {string} params.date - Date (YYYY-MM-DD)
   * @param {string} params.startTime - Start time (HH:mm)
   * @param {string} params.endTime - End time (HH:mm)
   * @param {number} params.minCapacity - Minimum room capacity
   * @param {string} params.building - Building preference
   * @param {string} params.type - Room type preference
   * @returns {Promise<Array>} Available rooms
   */
  getAvailableRooms: (params) => {
    return apiClient.post('/rooms/search-available', params);
  },

  /**
   * Create new room
   * @param {Object} roomData - Room data
   * @returns {Promise<Object>} Created room
   */
  createRoom: (roomData) => {
    return apiClient.post('/rooms', roomData);
  },

  /**
   * Update room
   * @param {number} id - Room ID
   * @param {Object} roomData - Updated room data
   * @returns {Promise<Object>} Updated room
   */
  updateRoom: (id, roomData) => {
    return apiClient.put(`/rooms/${id}`, roomData);
  },

  /**
   * Delete room
   * @param {number} id - Room ID
   * @returns {Promise<void>}
   */
  deleteRoom: (id) => {
    return apiClient.delete(`/rooms/${id}`);
  },

  /**
   * Book room for a class
   * @param {Object} bookingData - Booking data
   * @param {number} bookingData.roomId - Room ID
   * @param {number} bookingData.classId - Class ID
   * @param {string} bookingData.date - Date (YYYY-MM-DD)
   * @param {string} bookingData.startTime - Start time (HH:mm)
   * @param {string} bookingData.endTime - End time (HH:mm)
   * @param {string} bookingData.notes - Booking notes
   * @returns {Promise<Object>} Booking result
   */
  bookRoom: (bookingData) => {
    return apiClient.post('/rooms/book', bookingData);
  },

  /**
   * Cancel room booking
   * @param {number} bookingId - Booking ID
   * @returns {Promise<void>}
   */
  cancelBooking: (bookingId) => {
    return apiClient.delete(`/rooms/bookings/${bookingId}`);
  },

  /**
   * Get room usage statistics
   * @param {Object} params - Query parameters
   * @param {string} params.startDate - Start date
   * @param {string} params.endDate - End date
   * @param {string} params.building - Building filter
   * @returns {Promise<Object>} Usage statistics
   */
  getRoomUsageStats: (params = {}) => {
    return apiClient.get('/rooms/statistics', { params });
  }
};

export default roomService;