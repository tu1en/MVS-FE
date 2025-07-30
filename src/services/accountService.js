import axios from 'axios';
import API_CONFIG from '../config/api-config';
import { ROLE } from '../constants/constants';

const { BASE_URL, ENDPOINTS } = API_CONFIG;

// Map role_id to role names
const ROLE_ID_MAP = {
  1: ROLE.STUDENT,
  2: ROLE.TEACHER,
  3: ROLE.MANAGER,
  4: ROLE.ADMIN,
  5: ROLE.ACCOUNTANT
};

export const accountService = {
  // Get all accounts with optional filters
  getAllAccounts: async (filters = {}) => {
    try {
      const { role, department, search } = filters;
      const queryParams = new URLSearchParams();
      
      if (role && role !== 'all') queryParams.append('role', role);
      if (department && department !== 'all') queryParams.append('department', department);
      if (search) queryParams.append('search', search);
      
      const response = await axios.get(`${BASE_URL}${ENDPOINTS.USERS}?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Get current user role
      const userRole = localStorage.getItem('role')?.toUpperCase();
      let data = response.data;

      // Transform the data to match our frontend structure
      data = data.map(user => {
        // Handle date formatting
        let formattedDate = 'N/A';
        if (user.createdAt) {
          try {
            // Replace space with T to make it ISO format
            const isoDate = user.createdAt.replace(' ', 'T');
            formattedDate = new Date(isoDate).toLocaleString();
          } catch (error) {
            console.error('Error parsing date:', user.createdAt);
            formattedDate = 'Invalid Date';
          }
        }

        return {
          id: user.id,
          full_name: user.fullName,
          email: user.email,
          username: user.username,
          role: ROLE_ID_MAP[user.roleId] || 'Unknown',
          department: user.department || 'N/A',
          status: user.status || 'inactive',
          created_at: formattedDate
        };
      });

      // If user is a manager, filter out admin accounts and accounts from other departments
      if (userRole === ROLE.MANAGER) {
        const userDepartment = localStorage.getItem('department');
        data = data.filter(account => {
          const accountRole = account.role?.toUpperCase();
          return accountRole !== ROLE.ADMIN && 
                 accountRole !== ROLE.MANAGER && 
                 (!userDepartment || account.department === userDepartment);
        });
      }

      console.log('Transformed accounts data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  },

  // Get departments list
  getDepartments: async () => {
    try {
      const response = await axios.get(`${BASE_URL}${ENDPOINTS.DEPARTMENTS}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  },
}; 