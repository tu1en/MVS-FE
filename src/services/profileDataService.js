/**
 * Profile Data Management Service
 * Handles profile data loading, caching, and synchronization between server and localStorage
 */

import api from './api';
import API_CONFIG from '../config/api-config.js';

class ProfileDataService {
  /**
   * Test backend connectivity
   * @returns {Object} Connection test result
   */
  static async testConnectivity() {
    try {
      console.log('Testing connectivity to:', API_CONFIG.ENDPOINTS.GREETING);
      const response = await api.get(API_CONFIG.ENDPOINTS.GREETING, { timeout: 5000 });
      console.log('Connectivity test successful:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Backend connectivity test failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch user profile with fallback to localStorage
   * @param {string} userType - 'student' or 'teacher'
   * @returns {Object} Profile data
   */
  static async fetchProfileWithFallback(userType = 'student') {
    // Try the new, single authoritative endpoint directly
    try {
        console.log("Fetching profile from /api/users/me");
        const response = await api.get('/users/me'); 
        const profileData = response.data;
        
        console.log("Profile fetch successful:", profileData);
        
        // Save to localStorage for future fallback
        this.saveToLocalStorage(profileData);
        
        return {
          success: true,
          data: profileData,
          source: 'server'
        };
      } catch (error) {
        console.error("Failed to fetch profile from server:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        
        const fallbackData = this.getFromLocalStorage(userType);
        
        return {
          success: false,
          data: fallbackData,
          source: 'localStorage',
          error: error
        };
      }
  }

  /**
   * Update user profile with offline support
   * @param {Object} profileData - Profile data to update
   * @returns {Object} Update result
   */
  static async updateProfileWithFallback(profileData) {
    // Use the single authoritative endpoint for updating the profile
    try {
      console.log("Trying to update via endpoint: /users/me with data:", profileData);
      const response = await api.put('/users/me', profileData);
      
      console.log("Profile update successful:", response.data);
      
      // Save to localStorage on successful update
      this.saveToLocalStorage(profileData);
      
      return {
        success: true,
        message: 'Cập nhật thông tin thành công',
        source: 'server'
      };
    } catch (error) {
      console.error('Update endpoint /users/me failed:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        requestData: profileData
      });
      
      // Save locally as a fallback
      this.saveToLocalStorage(profileData);
      
      return {
        success: false,
        message: 'Server hiện không khả dụng, nhưng thông tin đã được lưu cục bộ. Dữ liệu sẽ được đồng bộ khi server hoạt động trở lại.',
        source: 'localStorage',
        error: error
      };
    }
  }

  /**
   * Save profile data to localStorage
   * @param {Object} profileData - Profile data to save
   */
  static saveToLocalStorage(profileData) {
    try {
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          localStorage.setItem(key, profileData[key].toString());
        }
      });
      
      // Save timestamp for data freshness tracking
      localStorage.setItem('profileLastUpdated', new Date().toISOString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Get profile data from localStorage with defaults
   * @param {string} userType - 'student' or 'teacher'
   * @returns {Object} Profile data with defaults
   */
  static getFromLocalStorage(userType = 'student') {
    const commonDefaults = {
      fullName: localStorage.getItem('fullName') || '',
      email: localStorage.getItem('email') || '',
      phoneNumber: localStorage.getItem('phoneNumber') || '',
      gender: localStorage.getItem('gender') || '',
      address: localStorage.getItem('address') || ''
    };

    if (userType === 'student') {
      return {
        ...commonDefaults,
        studentId: localStorage.getItem('userId') || localStorage.getItem('studentId') || '',
        school: localStorage.getItem('school') || 'Trường Đại học ABC',
        className: localStorage.getItem('className') || 'Lớp 12A1'
      };
    } else if (userType === 'teacher') {
      return {
        ...commonDefaults,
        userId: localStorage.getItem('userId') || '',
        department: localStorage.getItem('department') || 'Khoa Công nghệ thông tin',
        position: localStorage.getItem('position') || 'Giảng viên'
      };
    }

    return commonDefaults;
  }

  /**
   * Check if localStorage profile data is fresh (less than 24 hours old)
   * @returns {boolean} True if data is fresh
   */
  static isLocalDataFresh() {
    const lastUpdated = localStorage.getItem('profileLastUpdated');
    if (!lastUpdated) return false;

    const lastUpdateTime = new Date(lastUpdated);
    const now = new Date();
    const hoursDiff = (now - lastUpdateTime) / (1000 * 60 * 60);

    return hoursDiff < 24; // Data is fresh if less than 24 hours old
  }

  /**
   * Clear profile data from localStorage
   */
  static clearLocalData() {
    const keysToRemove = [
      'fullName', 'email', 'phoneNumber', 'gender', 'address',
      'studentId', 'school', 'className', 'userId', 'department', 
      'position', 'profileLastUpdated'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Sync local changes to server when connection is restored
   * @returns {Object} Sync result
   */
  static async syncToServer() {
    try {
      const userType = localStorage.getItem('role') === 'STUDENT' ? 'student' : 'teacher';
      const localData = this.getFromLocalStorage(userType);
      
      // Only sync if we have local data
      if (Object.values(localData).some(value => value && value.trim())) {
        const result = await this.updateProfileWithFallback(localData);
        
        if (result.success) {
          return {
            success: true,
            message: 'Dữ liệu cục bộ đã được đồng bộ thành công với server'
          };
        }
      }
      
      return {
        success: false,
        message: 'Không có dữ liệu cục bộ để đồng bộ'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi đồng bộ dữ liệu với server',
        error: error
      };
    }
  }
}

export default ProfileDataService;
