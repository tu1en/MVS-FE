import api from './api';

const ExplanationService = {
  // Submit explanation request
  submitExplanation: async (explanationData) => {
    try {
      console.log('Submitting explanation data:', explanationData);
      const response = await api.post('/attendance-explanations/submit', explanationData);
      console.log('Explanation submitted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting explanation:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      throw error;
    }
  },

  // Get user's explanation history (if needed)
  getUserExplanations: async (userId) => {
    try {
      const response = await api.get(`/attendance-explanations/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user explanations:', error);
      throw error;
    }
  }
};

export default ExplanationService;
