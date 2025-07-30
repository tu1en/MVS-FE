import axiosInstance from '../config/axiosInstance';

const API_URL = '/users';

const UserService = {
  /**
   * Get users by role
   * @param {string} roleName - Role name ('TEACHER', 'STUDENT', 'MANAGER', 'ADMIN')
   * @returns {Promise<Array>} List of users with the specified role
   */
  getUsersByRole: async (roleName) => {
    try {
      // Map role names to role IDs as per backend
      const roleMapping = {
        'ADMIN': 0,
        'STUDENT': 1, 
        'TEACHER': 2,
        'MANAGER': 3
      };
      
      const roleId = roleMapping[roleName?.toString().toUpperCase()];
      if (roleId === undefined) {
        throw new Error(`Invalid role: ${roleName}`);
      }
      
      const response = await axiosInstance.get(`${API_URL}/role/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} Current user data
   */
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/me`);
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} User data
   */
  getUserById: async (id) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {number} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user data
   */
  updateUser: async (id, userData) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<void>}
   */
  deleteUser: async (id) => {
    try {
      await axiosInstance.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Get all teachers (convenience method)
   * @returns {Promise<Array>} List of teachers
   */
  getTeachers: async () => {
    return UserService.getUsersByRole('TEACHER');
  },

  /**
   * Get all students (convenience method)
   * @returns {Promise<Array>} List of students
   */
  getStudents: async () => {
    return UserService.getUsersByRole('STUDENT');
  }
};

export default UserService;
