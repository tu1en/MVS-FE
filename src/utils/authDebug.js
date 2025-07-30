/**
 * Authentication Debug Utilities
 * Utilities để debug JWT token và authentication issues
 */

export const AuthDebug = {
  /**
   * Kiểm tra token hiện tại trong localStorage
   */
  checkToken() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('email');
    
    console.log('🔍 Auth Debug - Current Token Info:');
    console.log('Token exists:', !!token);
    console.log('Token length:', token ? token.length : 0);
    console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('Role:', role);
    console.log('User ID:', userId);
    console.log('Email:', email);
    
    if (token) {
      try {
        // Decode JWT payload (không verify signature)
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Token expires at:', new Date(payload.exp * 1000));
        console.log('Token is expired:', Date.now() > payload.exp * 1000);
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
    
    return {
      hasToken: !!token,
      token,
      role,
      userId,
      email
    };
  },

  /**
   * Test API call với token hiện tại
   */
  async testApiCall(endpoint = '/materials/download/2') {
    const token = localStorage.getItem('token');
    
    console.log(`🧪 Testing API call to: ${endpoint}`);
    console.log('Using token:', token ? `${token.substring(0, 20)}...` : 'null');
    
    try {
      const response = await fetch(`http://localhost:8088/api${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.status === 403) {
        console.error('❌ 403 Forbidden - Token không hợp lệ hoặc không có quyền');
      } else if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Token thiếu hoặc không hợp lệ');
      } else if (response.status === 200) {
        console.log('✅ API call thành công');
      }
      
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok
      };
    } catch (error) {
      console.error('❌ Network error:', error);
      return { error: error.message };
    }
  },

  /**
   * Test với axiosInstance
   */
  async testWithAxios() {
    console.log('🧪 Testing with axiosInstance...');
    
    try {
      // Import axiosInstance dynamically
      const { default: axiosInstance } = await import('../config/axiosInstance');
      
      const response = await axiosInstance.get('/materials/download/2', {
        responseType: 'blob'
      });
      
      console.log('✅ Axios call thành công');
      console.log('Response size:', response.data.size);
      return { success: true, size: response.data.size };
    } catch (error) {
      console.error('❌ Axios call failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return { 
        error: error.message, 
        status: error.response?.status,
        data: error.response?.data 
      };
    }
  },

  /**
   * Kiểm tra debug endpoint
   */
  async testDebugEndpoint() {
    console.log('🧪 Testing debug endpoint...');
    
    try {
      const response = await fetch('http://localhost:8088/api/debug/material/2');
      const data = await response.json();
      
      console.log('Debug endpoint response:', data);
      return data;
    } catch (error) {
      console.error('❌ Debug endpoint failed:', error);
      return { error: error.message };
    }
  },

  /**
   * Chạy tất cả tests
   */
  async runAllTests() {
    console.log('🚀 Running all authentication tests...');
    
    const results = {
      tokenCheck: this.checkToken(),
      apiTest: await this.testApiCall(),
      axiosTest: await this.testWithAxios(),
      debugTest: await this.testDebugEndpoint()
    };
    
    console.log('📊 Test Results Summary:', results);
    return results;
  }
};

// Export để có thể sử dụng trong console
window.AuthDebug = AuthDebug;

export default AuthDebug;
