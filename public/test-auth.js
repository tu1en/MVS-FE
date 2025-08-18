// Test script to verify authentication
// Run this in the browser console on the frontend to test different login scenarios

window.testAuth = {
  // Test with username
  testUsername: async () => {
    try {
      const response = await fetch('http://localhost:8088/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'teacher123',
          password: 'password123'
        })
      });
      
      const data = await response.json();
      // console.log('Username login result:', data);
      return data;
    } catch (error) {
      console.error('Username login error:', error);
      return error;
    }
  },
  
  // Test with email
  testEmail: async () => {
    try {
      const response = await fetch('http://localhost:8088/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'teacher123@test.com',
          password: 'password123'
        })
      });
      
      const data = await response.json();
      // console.log('Email login result:', data);
      return data;
    } catch (error) {
      console.error('Email login error:', error);
      return error;
    }
  },
  
  // Test backend connectivity
  testBackend: async () => {
    try {
      const response = await fetch('http://localhost:8088/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'nonexistent',
          password: 'test'
        })
      });
      
      const data = await response.json();
      // console.log('Backend connectivity test:', data);
      return data;
    } catch (error) {
      console.error('Backend connectivity error:', error);
      return error;
    }
  }
};

// console.log('Test functions available:');
// console.log('- window.testAuth.testUsername() - Test with username');
// console.log('- window.testAuth.testEmail() - Test with email');
// console.log('- window.testAuth.testBackend() - Test backend connectivity');
