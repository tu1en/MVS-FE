/**
 * Quick Endpoint Test Script
 * Simple tests for the fixed API endpoints
 */

/**
 * Test the fixed endpoints directly
 */
async function quickEndpointTest() {
  console.log('🧪 Quick API Endpoint Test');
  console.log('=' .repeat(40));
  
  // Check authentication
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ No authentication token found. Please log in first.');
    return false;
  }
  
  const baseURL = 'http://localhost:8088/api';
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  const tests = [
    {
      name: 'Assignments for Current Student',
      url: `${baseURL}/assignments/student/me`,
      method: 'GET'
    },
    {
      name: 'Attendance History',
      url: `${baseURL}/attendance/my-history`,
      method: 'GET'
    },
    {
      name: 'Student Classrooms',
      url: `${baseURL}/classrooms/student/me`,
      method: 'GET'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`\n🔍 Testing: ${test.name}`);
      console.log(`📡 ${test.method} ${test.url}`);
      
      const response = await fetch(test.url, {
        method: test.method,
        headers: headers
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS (${response.status})`);
        console.log(`📊 Data type: ${Array.isArray(data) ? 'Array' : typeof data}`);
        if (Array.isArray(data)) {
          console.log(`📈 Records: ${data.length}`);
        }
        passed++;
      } else {
        console.log(`❌ FAILED (${response.status}): ${response.statusText}`);
        const errorText = await response.text();
        console.log(`🔍 Error: ${errorText.substring(0, 200)}...`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '=' .repeat(40));
  console.log(`📋 Results: ${passed} passed, ${failed} failed`);
  console.log(`📈 Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  return failed === 0;
}

// Make available in browser console
if (typeof window !== 'undefined') {
  window.quickEndpointTest = quickEndpointTest;
  console.log('💡 Run window.quickEndpointTest() to test endpoints');
}

export { quickEndpointTest };
