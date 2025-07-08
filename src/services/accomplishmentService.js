import api from '../config/axiosInstance';

export const accomplishmentService = {
  
  /**
   * Get all accomplishments for the current logged-in user
   * @returns {Promise} - A promise that resolves to an array of accomplishments
   */
  getMyAccomplishments: () => {
    return api.get(`/accomplishments/my-accomplishments`);
  },

  /**
   * Create a new accomplishment
   * @param {object} accomplishmentData The data for the new accomplishment
   * @returns {Promise<any>}
   */
  createAccomplishment: (accomplishmentData) => {
    return api.post('/accomplishments', accomplishmentData);
  },

  /**
   * Update an existing accomplishment
   * @param {number} id The ID of the accomplishment to update
   * @param {object} accomplishmentData The updated data for the accomplishment
   * @returns {Promise<any>}
   */
  updateAccomplishment: (id, accomplishmentData) => {
    return api.put(`/accomplishments/${id}`, accomplishmentData);
  },

  /**
   * Delete an accomplishment
   * @param {number} id The ID of the accomplishment to delete
   * @returns {Promise<any>}
   */
  deleteAccomplishment: (id) => {
    return api.delete(`/accomplishments/${id}`);
  },
};

export default accomplishmentService;
