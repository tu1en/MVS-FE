// Test script for API calls
const testApi = {
  async login(username = 'student', password = 'password') {
    try {
      console.log(`Attempting login with ${username}:${password}`);
      const response = await fetch('http://localhost:8088/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        throw new Error(`Login failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Login successful:', data);
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },
  
  async fetchProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found, please login first');
        return null;
      }
      
      console.log('Fetching profile with token:', token.substring(0, 20) + '...');
      const response = await fetch('http://localhost:8088/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Profile fetch failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Profile data:', data);
      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  },
  
  async testFlow() {
    console.log('Starting API test flow');
    await this.login();
    await this.fetchProfile();
    console.log('Test flow completed');
  }
};

// Make it available globally
window.testApi = testApi;
console.log('API test helper loaded. Use window.testApi to access it');
console.log('Example: window.testApi.testFlow()'); 