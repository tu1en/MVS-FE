import axiosInstance from '../config/axiosInstance';

const API_URL = '/api/classroom-management/slots';

/**
 * Service cho Slot Management API calls
 */
const slotService = {
  // Get all slots with pagination
  getAllSlots: async (params = {}) => {
    try {
      const response = await axiosInstance.get(API_URL, {
        params: {
          page: params.page || 0,
          size: params.size || 10,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching slots:', error);
      throw error;
    }
  },

  // Get slot by ID
  getSlotById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching slot:', error);
      throw error;
    }
  },

  // Create new slot
  createSlot: async (slotData) => {
    try {
      const response = await axiosInstance.post(API_URL, slotData);
      return response.data;
    } catch (error) {
      console.error('Error creating slot:', error);
      throw error;
    }
  },

  // Update slot
  updateSlot: async (id, slotData) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/${id}`, slotData);
      return response.data;
    } catch (error) {
      console.error('Error updating slot:', error);
      throw error;
    }
  },

  // Delete slot
  deleteSlot: async (id) => {
    try {
      const response = await axiosInstance.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting slot:', error);
      throw error;
    }
  },

  // Get slots by session ID
  getSlotsBySession: async (sessionId) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching session slots:', error);
      throw error;
    }
  },

  // Get slots by session ID with pagination
  getSlotsBySessionPaged: async (sessionId, params = {}) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/session/${sessionId}/paged`, {
        params: {
          page: params.page || 0,
          size: params.size || 10,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching session slots with pagination:', error);
      throw error;
    }
  },

  // Update slot status
  updateSlotStatus: async (id, status) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating slot status:', error);
      throw error;
    }
  },
};

export default slotService;
