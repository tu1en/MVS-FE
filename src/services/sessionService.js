import axiosInstance from '../config/axiosInstance';

const API_URL = '/api/classroom-management/sessions';

/**
 * Service cho Session Management API calls
 */
const sessionService = {
  // Get all sessions with pagination
  getAllSessions: async (params = {}) => {
    try {
      const response = await axiosInstance.get(API_URL, {
        params: {
          page: params.page || 0,
          size: params.size || 10,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },

  // Get session by ID
  getSessionById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching session:', error);
      throw error;
    }
  },

  // Create new session
  createSession: async (sessionData) => {
    try {
      const response = await axiosInstance.post(API_URL, sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  // Update session
  updateSession: async (id, sessionData) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/${id}`, sessionData);
      return response.data;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  // Delete session
  deleteSession: async (id) => {
    try {
      const response = await axiosInstance.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  // Get sessions by classroom ID
  getSessionsByClassroom: async (classroomId) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/classroom/${classroomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classroom sessions:', error);
      throw error;
    }
  },

  // Get sessions by date
  getSessionsByDate: async (date) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/date/${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions by date:', error);
      throw error;
    }
  },

  // Update session status
  updateSessionStatus: async (id, status) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  },
};

export default sessionService;
