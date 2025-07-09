import axios from 'axios';
import API_CONFIG from '../config/api-config.js';

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000, // Longer timeout for video operations
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
 * Lecture Service for handling lecture operations
 */
class LectureService {

  /**
   * Create a new lecture
   * @param {number} classroomId - Classroom ID
   * @param {Object} lectureData - Lecture data
   * @returns {Promise<Object>} Created lecture
   */
  static async createLecture(classroomId, lectureData) {
    try {
      const response = await apiClient.post(`/lectures/classrooms/${classroomId}`, lectureData);
      return response.data;
    } catch (error) {
      console.error("Error creating lecture:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update lecture
   * @param {number} lectureId - Lecture ID
   * @param {Object} lectureData - Updated lecture data
   * @returns {Promise<Object>} Updated lecture
   */
  static async updateLecture(lectureId, lectureData) {
    try {
      const response = await apiClient.put(`/lectures/${lectureId}`, lectureData);
      return response.data;
    } catch (error) {
      console.error('Error updating lecture:', error);
      throw error;
    }
  }

  /**
   * Get lecture by ID
   * @param {number} lectureId - Lecture ID
   * @returns {Promise<Object>} Lecture details
   */
  static async getLecture(lectureId) {
    try {
      const response = await apiClient.get(`/lectures/${lectureId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lecture:', error);
      throw error;
    }
  }

  /**
   * Get lectures by course
   * @param {number} courseId - Course ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Course lectures
   */
  static async getLecturesByCourse(courseId, params = {}) {
    try {
      const response = await apiClient.get(`/lectures/classrooms/${courseId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching course lectures:', error);
      throw error;
    }
  }

  /**
   * Delete lecture
   * @param {number} lectureId - Lecture ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteLecture(lectureId) {
    try {
      const response = await apiClient.delete(`/lectures/${lectureId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting lecture:', error);
      throw error;
    }
  }

  /**
   * Start live streaming
   * @param {number} lectureId - Lecture ID
   * @param {Object} streamConfig - Streaming configuration
   * @returns {Promise<Object>} Stream details
   */
  static async startLiveStream(lectureId, streamConfig) {
    try {
      const response = await apiClient.post(`/lectures/${lectureId}/stream/start`, streamConfig);
      return response.data;
    } catch (error) {
      console.error('Error starting live stream:', error);
      throw error;
    }
  }

  /**
   * Stop live streaming
   * @param {number} lectureId - Lecture ID
   * @returns {Promise<Object>} Stop result
   */
  static async stopLiveStream(lectureId) {
    try {
      const response = await apiClient.post(`/lectures/${lectureId}/stream/stop`);
      return response.data;
    } catch (error) {
      console.error('Error stopping live stream:', error);
      throw error;
    }
  }

  /**
   * Get stream status
   * @param {number} lectureId - Lecture ID
   * @returns {Promise<Object>} Stream status
   */
  static async getStreamStatus(lectureId) {
    try {
      const response = await apiClient.get(`/lectures/${lectureId}/stream/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stream status:', error);
      throw error;
    }
  }

  /**
   * Start recording
   * @param {number} lectureId - Lecture ID
   * @param {Object} recordingConfig - Recording configuration
   * @returns {Promise<Object>} Recording details
   */
  static async startRecording(lectureId, recordingConfig) {
    try {
      const response = await apiClient.post(`/lectures/${lectureId}/recording/start`, recordingConfig);
      return response.data;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording
   * @param {number} lectureId - Lecture ID
   * @returns {Promise<Object>} Recording result
   */
  static async stopRecording(lectureId) {
    try {
      const response = await apiClient.post(`/lectures/${lectureId}/recording/stop`);
      return response.data;
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  /**
   * Get recording details
   * @param {number} lectureId - Lecture ID
   * @returns {Promise<Object>} Recording details
   */
  static async getRecording(lectureId) {
    try {
      const response = await apiClient.get(`/lectures/${lectureId}/recording`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recording:', error);
      throw error;
    }
  }

  /**
   * Upload lecture material
   * @param {number} lectureId - Lecture ID
   * @param {FormData} formData - File data
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Upload result
   */
  static async uploadLectureMaterial(lectureId, formData, onProgress = null) {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        };
      }

      const response = await apiClient.post(`/lectures/${lectureId}/materials`, formData, config);
      return response.data;
    } catch (error) {
      console.error('Error uploading lecture material:', error);
      throw error;
    }
  }

  /**
   * Get lecture materials
   * @param {number} lectureId - Lecture ID
   * @returns {Promise<Array>} Lecture materials
   */
  static async getLectureMaterials(lectureId) {
    try {
      const response = await apiClient.get(`/lectures/${lectureId}/materials`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lecture materials:', error);
      throw error;
    }
  }

  /**
   * Create lecture assessment
   * @param {number} lectureId - Lecture ID
   * @param {Object} assessmentData - Assessment data
   * @returns {Promise<Object>} Created assessment
   */
  static async createLectureAssessment(lectureId, assessmentData) {
    try {
      const response = await apiClient.post(`/lectures/${lectureId}/assessments`, assessmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating lecture assessment:', error);
      throw error;
    }
  }

  /**
   * Get lecture assessments
   * @param {number} lectureId - Lecture ID
   * @returns {Promise<Array>} Lecture assessments
   */
  static async getLectureAssessments(lectureId) {
    try {
      const response = await apiClient.get(`/lectures/${lectureId}/assessments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lecture assessments:', error);
      throw error;
    }
  }

  /**
   * Get lecture attendance
   * @param {number} lectureId - Lecture ID
   * @returns {Promise<Object>} Attendance data
   */
  static async getLectureAttendance(lectureId) {
    try {
      const response = await apiClient.get(`/lectures/${lectureId}/attendance`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lecture attendance:', error);
      throw error;
    }
  }

  /**
   * Mark student attendance
   * @param {number} lectureId - Lecture ID
   * @param {Object} attendanceData - Attendance data
   * @returns {Promise<Object>} Attendance record
   */
  static async markAttendance(lectureId, attendanceData) {
    try {
      const response = await apiClient.post(`/lectures/${lectureId}/attendance`, attendanceData);
      return response.data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }

  /**
   * Get lecture analytics
   * @param {number} lectureId - Lecture ID
   * @returns {Promise<Object>} Lecture analytics
   */
  static async getLectureAnalytics(lectureId) {
    try {
      const response = await apiClient.get(`/lectures/${lectureId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lecture analytics:', error);
      throw error;
    }
  }

  /**
   * Schedule lecture
   * @param {number} lectureId - Lecture ID
   * @param {Object} scheduleData - Schedule data
   * @returns {Promise<Object>} Schedule result
   */
  static async scheduleLecture(lectureId, scheduleData) {
    try {
      const response = await apiClient.post(`/lectures/${lectureId}/schedule`, scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error scheduling lecture:', error);
      throw error;
    }
  }

  /**
   * Get lecture chat messages
   * @param {number} lectureId - Lecture ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Chat messages
   */
  static async getLectureChat(lectureId, params = {}) {
    try {
      const response = await apiClient.get(`/lectures/${lectureId}/chat`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching lecture chat:', error);
      throw error;
    }
  }

  /**
   * Send chat message
   * @param {number} lectureId - Lecture ID
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} Sent message
   */
  static async sendChatMessage(lectureId, messageData) {
    try {
      const response = await apiClient.post(`/lectures/${lectureId}/chat`, messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  /**
   * Get lecture whiteboard data
   * @param {number} lectureId - Lecture ID
   * @returns {Promise<Object>} Whiteboard data
   */
  static async getLectureWhiteboard(lectureId) {
    try {
      const response = await apiClient.get(`/lectures/${lectureId}/whiteboard`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lecture whiteboard:', error);
      throw error;
    }
  }

  /**
   * Save whiteboard data
   * @param {number} lectureId - Lecture ID
   * @param {Object} whiteboardData - Whiteboard data
   * @returns {Promise<Object>} Save result
   */
  static async saveLectureWhiteboard(lectureId, whiteboardData) {
    try {
      const response = await apiClient.post(`/lectures/${lectureId}/whiteboard`, whiteboardData);
      return response.data;
    } catch (error) {
      console.error('Error saving lecture whiteboard:', error);
      throw error;
    }
  }

  /**
   * Generate lecture summary
   * @param {number} lectureId - Lecture ID
   * @returns {Promise<Object>} Generated summary
   */
  static async generateLectureSummary(lectureId) {
    try {
      const response = await apiClient.post(`/lectures/${lectureId}/summary/generate`);
      return response.data;
    } catch (error) {
      console.error('Error generating lecture summary:', error);
      throw error;
    }
  }

  /**
   * Search lectures
   * @param {string} query - Search query
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} Search results
   */
  static async searchLectures(query, filters = {}) {
    try {
      const params = { query, ...filters };
      const response = await apiClient.get('/lectures/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching lectures:', error);
      throw error;
    }
  }

  /**
   * Get upcoming lectures
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Upcoming lectures
   */
  static async getUpcomingLectures(params = {}) {
    try {
      const response = await apiClient.get('/lectures/upcoming', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming lectures:', error);
      throw error;
    }
  }

  /**
   * Export lecture data
   * @param {number} lectureId - Lecture ID
   * @param {string} format - Export format
   * @returns {Promise<Blob>} Exported file
   */
  static async exportLectureData(lectureId, format = 'pdf') {
    try {
      const response = await apiClient.get(`/lectures/${lectureId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting lecture data:', error);
      throw error;
    }
  }
}

export default LectureService;
