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
 * Progress Service for handling student progress tracking and analytics
 */
class ProgressService {

  /**
   * Get overall student progress
   * @param {number} studentId - Student ID (optional, defaults to current user)
   * @returns {Promise<Object>} Student progress overview
   */
  static async getStudentProgress(studentId = null) {
    try {
      const endpoint = studentId ? `/students/${studentId}/progress` : '/students/my-progress';
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching student progress:', error);
      throw error;
    }
  }

  /**
   * Get progress for a specific course
   * @param {number} courseId - Course ID
   * @param {number} studentId - Student ID (optional)
   * @returns {Promise<Object>} Course progress details
   */
  static async getCourseProgress(courseId, studentId = null) {
    try {
      const endpoint = studentId 
        ? `/students/${studentId}/courses/${courseId}/progress`
        : `/students/courses/${courseId}/progress`;
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      throw error;
    }
  }

  /**
   * Get assignment progress
   * @param {number} assignmentId - Assignment ID
   * @param {number} studentId - Student ID (optional)
   * @returns {Promise<Object>} Assignment progress details
   */
  static async getAssignmentProgress(assignmentId, studentId = null) {
    try {
      const endpoint = studentId 
        ? `/students/${studentId}/assignments/${assignmentId}/progress`
        : `/students/assignments/${assignmentId}/progress`;
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching assignment progress:', error);
      throw error;
    }
  }

  /**
   * Update learning progress for a topic/module
   * @param {Object} progressData - Progress update data
   * @returns {Promise<Object>} Updated progress
   */
  static async updateLearningProgress(progressData) {
    try {
      const response = await apiClient.post('/students/progress/update', progressData);
      return response.data;
    } catch (error) {
      console.error('Error updating learning progress:', error);
      throw error;
    }
  }

  /**
   * Get learning analytics for a student
   * @param {number} studentId - Student ID (optional)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Learning analytics data
   */
  static async getLearningAnalytics(studentId = null, params = {}) {
    try {
      const endpoint = studentId 
        ? `/students/${studentId}/analytics`
        : '/students/my-analytics';
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching learning analytics:', error);
      throw error;
    }
  }

  /**
   * Get course completion statistics
   * @param {number} courseId - Course ID
   * @returns {Promise<Object>} Course completion stats
   */
  static async getCourseCompletionStats(courseId) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/completion-stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course completion stats:', error);
      throw error;
    }
  }

  /**
   * Get achievement/badge data
   * @param {number} studentId - Student ID (optional)
   * @returns {Promise<Array>} List of achievements
   */
  static async getAchievements(studentId = null) {
    try {
      const endpoint = studentId 
        ? `/students/${studentId}/achievements`
        : '/students/my-achievements';
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  }

  /**
   * Get learning path progress
   * @param {number} pathId - Learning path ID
   * @param {number} studentId - Student ID (optional)
   * @returns {Promise<Object>} Learning path progress
   */
  static async getLearningPathProgress(pathId, studentId = null) {
    try {
      const endpoint = studentId 
        ? `/students/${studentId}/learning-paths/${pathId}/progress`
        : `/students/learning-paths/${pathId}/progress`;
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching learning path progress:', error);
      throw error;
    }
  }

  /**
   * Get skill development tracking
   * @param {number} studentId - Student ID (optional)
   * @returns {Promise<Object>} Skill development data
   */
  static async getSkillDevelopment(studentId = null) {
    try {
      const endpoint = studentId 
        ? `/students/${studentId}/skills`
        : '/students/my-skills';
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching skill development:', error);
      throw error;
    }
  }

  /**
   * Get study time analytics
   * @param {Object} params - Query parameters (dateRange, courseId, etc.)
   * @param {number} studentId - Student ID (optional)
   * @returns {Promise<Object>} Study time analytics
   */
  static async getStudyTimeAnalytics(params = {}, studentId = null) {
    try {
      const endpoint = studentId 
        ? `/students/${studentId}/study-time`
        : '/students/my-study-time';
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching study time analytics:', error);
      throw error;
    }
  }

  /**
   * Log study session
   * @param {Object} sessionData - Study session data
   * @returns {Promise<Object>} Logged session
   */
  static async logStudySession(sessionData) {
    try {
      const response = await apiClient.post('/students/study-sessions', sessionData);
      return response.data;
    } catch (error) {
      console.error('Error logging study session:', error);
      throw error;
    }
  }

  /**
   * Get performance trends
   * @param {Object} params - Query parameters
   * @param {number} studentId - Student ID (optional)
   * @returns {Promise<Object>} Performance trend data
   */
  static async getPerformanceTrends(params = {}, studentId = null) {
    try {
      const endpoint = studentId 
        ? `/students/${studentId}/performance-trends`
        : '/students/my-performance-trends';
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching performance trends:', error);
      throw error;
    }
  }

  /**
   * Get goal tracking data
   * @param {number} studentId - Student ID (optional)
   * @returns {Promise<Array>} List of goals and progress
   */
  static async getGoalTracking(studentId = null) {
    try {
      const endpoint = studentId 
        ? `/students/${studentId}/goals`
        : '/students/my-goals';
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching goal tracking:', error);
      throw error;
    }
  }

  /**
   * Set learning goal
   * @param {Object} goalData - Goal data
   * @returns {Promise<Object>} Created goal
   */
  static async setLearningGoal(goalData) {
    try {
      const response = await apiClient.post('/students/goals', goalData);
      return response.data;
    } catch (error) {
      console.error('Error setting learning goal:', error);
      throw error;
    }
  }

  /**
   * Update learning goal
   * @param {number} goalId - Goal ID
   * @param {Object} goalData - Updated goal data
   * @returns {Promise<Object>} Updated goal
   */
  static async updateLearningGoal(goalId, goalData) {
    try {
      const response = await apiClient.put(`/students/goals/${goalId}`, goalData);
      return response.data;
    } catch (error) {
      console.error('Error updating learning goal:', error);
      throw error;
    }
  }

  /**
   * Get competency assessment results
   * @param {number} studentId - Student ID (optional)
   * @returns {Promise<Object>} Competency assessment data
   */
  static async getCompetencyAssessment(studentId = null) {
    try {
      const endpoint = studentId 
        ? `/students/${studentId}/competency`
        : '/students/my-competency';
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching competency assessment:', error);
      throw error;
    }
  }

  /**
   * Get learning recommendations
   * @param {number} studentId - Student ID (optional)
   * @returns {Promise<Array>} List of personalized recommendations
   */
  static async getLearningRecommendations(studentId = null) {
    try {
      const endpoint = studentId 
        ? `/students/${studentId}/recommendations`
        : '/students/my-recommendations';
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching learning recommendations:', error);
      throw error;
    }
  }

  /**
   * Export progress report
   * @param {Object} params - Report parameters
   * @param {string} format - Export format (pdf, xlsx, csv)
   * @param {number} studentId - Student ID (optional)
   * @returns {Promise<Blob>} Exported report file
   */
  static async exportProgressReport(params = {}, format = 'pdf', studentId = null) {
    try {
      const endpoint = studentId 
        ? `/students/${studentId}/progress/export`
        : '/students/my-progress/export';
      const response = await apiClient.get(endpoint, {
        params: { ...params, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting progress report:', error);
      throw error;
    }
  }

  /**
   * Get learning streak information
   * @param {number} studentId - Student ID (optional)
   * @returns {Promise<Object>} Learning streak data
   */
  static async getLearningStreak(studentId = null) {
    try {
      const endpoint = studentId 
        ? `/students/${studentId}/streak`
        : '/students/my-streak';
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching learning streak:', error);
      throw error;
    }
  }

  /**
   * Get class/course rankings
   * @param {number} courseId - Course ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Ranking data
   */
  static async getCourseRankings(courseId, params = {}) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/rankings`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching course rankings:', error);
      throw error;
    }
  }

  /**
   * Get attendance progress
   * @param {Object} params - Query parameters
   * @param {number} studentId - Student ID (optional)
   * @returns {Promise<Object>} Attendance progress data
   */
  static async getAttendanceProgress(params = {}, studentId = null) {
    try {
      const endpoint = studentId 
        ? `/students/${studentId}/attendance`
        : '/students/my-attendance';
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance progress:', error);
      throw error;
    }
  }
}

export default ProgressService;
