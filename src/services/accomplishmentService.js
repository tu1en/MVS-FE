import API_CONFIG from '../config/api-config';

export const accomplishmentService = {
  /**
   * Get user ID by email
   * @param {string} email - The email of the student
   * @returns {Promise<number>} - A promise that resolves to the user ID
   */
  getUserIdByEmail: async (email) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/email/${encodeURIComponent(email)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Error fetching user ID:", error);
      throw error;
    }
  },

  /**
   * Get all accomplishments for a student
   * @param {string} userId - The ID of the student
   * @returns {Promise} - A promise that resolves to an array of accomplishments
   */
  getStudentAccomplishments: async (userId) => {
    try {
      console.log('Fetching accomplishments for userId:', userId);
      const endpoint = API_CONFIG.ENDPOINTS.STUDENT_ACCOMPLISHMENTS(userId);
      console.log('API Endpoint:', endpoint);
      console.log('Full URL:', `${API_CONFIG.BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response data:', data);
      
      // Handle both array and object responses
      return Array.isArray(data) ? data : data.content || [];
    } catch (error) {
      console.error("Error fetching accomplishments:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },
};

export default accomplishmentService;
