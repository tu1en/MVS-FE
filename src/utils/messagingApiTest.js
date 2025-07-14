/**
 * Messaging API Test Utilities
 * 
 * Simple functions to test messaging endpoints and debug loading issues
 */

import apiClient from '../services/apiClient';

/**
 * Test all messaging-related API endpoints
 * @param {number} userId - User ID to test with
 * @param {string} userRole - User role (STUDENT/TEACHER)
 * @returns {Promise<Object>} Test results
 */
export const testMessagingAPIs = async (userId, userRole = 'STUDENT') => {
  console.log(`🧪 Starting messaging API tests for User ${userId} (${userRole})`);
  
  const results = {
    timestamp: new Date().toISOString(),
    userId,
    userRole,
    tests: {},
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    }
  };

  const testEndpoint = async (name, url, description, critical = true) => {
    console.log(`🔍 Testing ${name}: ${url}`);
    results.summary.total++;
    
    const testResult = {
      name,
      url,
      description,
      critical,
      startTime: Date.now()
    };

    try {
      const response = await apiClient.get(url);
      
      testResult.success = true;
      testResult.status = response.status;
      testResult.dataType = Array.isArray(response.data) ? 'array' : typeof response.data;
      testResult.dataLength = Array.isArray(response.data) ? response.data.length : 'N/A';
      testResult.sampleData = Array.isArray(response.data) 
        ? response.data.slice(0, 2) // First 2 items
        : response.data;
      testResult.endTime = Date.now();
      testResult.duration = testResult.endTime - testResult.startTime;
      
      results.summary.passed++;
      console.log(`✅ ${name} passed (${testResult.duration}ms)`);
      
    } catch (error) {
      testResult.success = false;
      testResult.status = error.response?.status || 'Network Error';
      testResult.error = error.message;
      testResult.errorDetails = error.response?.data;
      testResult.endTime = Date.now();
      testResult.duration = testResult.endTime - testResult.startTime;
      
      results.summary.failed++;
      results.summary.errors.push({
        test: name,
        error: error.message,
        critical
      });
      
      console.error(`❌ ${name} failed (${testResult.duration}ms):`, error.message);
    }

    results.tests[name] = testResult;
    return testResult;
  };

  // Test critical endpoints
  await testEndpoint(
    'User Info',
    `/users/${userId}`,
    'Get current user information',
    true
  );

  await testEndpoint(
    'Student Messages',
    `/student-messages/student/${userId}`,
    'Get messages received by student',
    true
  );

  await testEndpoint(
    'Teachers List',
    '/users/teachers',
    'Get list of all teachers for messaging',
    true
  );

  // Test non-critical endpoints
  await testEndpoint(
    'Sent Messages',
    `/student-messages/by-sender/${userId}`,
    'Get messages sent by user',
    false
  );

  await testEndpoint(
    'Student Classrooms',
    `/classrooms/student/${userId}`,
    'Get classrooms for student',
    false
  );

  // Calculate summary
  results.summary.successRate = (results.summary.passed / results.summary.total * 100).toFixed(1);
  results.summary.criticalErrors = results.summary.errors.filter(e => e.critical).length;
  
  console.log(`📊 Test Summary:`, results.summary);
  
  return results;
};

/**
 * Quick test for just the essential messaging endpoints
 * @param {number} userId - User ID to test with
 * @returns {Promise<boolean>} True if essential endpoints work
 */
export const quickMessagingTest = async (userId) => {
  console.log(`⚡ Quick messaging test for User ${userId}`);
  
  try {
    // Test the most critical endpoint
    const messagesResponse = await apiClient.get(`/student-messages/student/${userId}`);
    const teachersResponse = await apiClient.get('/users/teachers');
    
    const messagesOk = Array.isArray(messagesResponse.data);
    const teachersOk = Array.isArray(teachersResponse.data);
    
    console.log(`📨 Messages endpoint: ${messagesOk ? '✅' : '❌'} (${messagesResponse.data?.length || 0} items)`);
    console.log(`👨‍🏫 Teachers endpoint: ${teachersOk ? '✅' : '❌'} (${teachersResponse.data?.length || 0} items)`);
    
    return messagesOk && teachersOk;
    
  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
    return false;
  }
};

/**
 * Debug function to check API connectivity and authentication
 * @returns {Promise<Object>} Connection status
 */
export const checkAPIConnection = async () => {
  console.log('🔗 Checking API connection...');
  
  const result = {
    timestamp: new Date().toISOString(),
    connected: false,
    authenticated: false,
    error: null
  };

  try {
    // Try a simple endpoint that doesn't require auth
    const response = await apiClient.get('/users/teachers');
    
    result.connected = true;
    result.authenticated = response.status === 200;
    result.responseTime = Date.now();
    
    console.log('✅ API connection successful');
    
  } catch (error) {
    result.error = error.message;
    result.status = error.response?.status;
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      result.connected = true;
      result.authenticated = false;
      console.log('🔐 API connected but authentication failed');
    } else {
      result.connected = false;
      console.log('❌ API connection failed');
    }
  }

  return result;
};

/**
 * Generate a detailed report of messaging API status
 * @param {number} userId - User ID to test with
 * @param {string} userRole - User role
 * @returns {Promise<string>} Formatted report
 */
export const generateMessagingReport = async (userId, userRole) => {
  const testResults = await testMessagingAPIs(userId, userRole);
  
  let report = `
🧪 MESSAGING API TEST REPORT
============================
Timestamp: ${testResults.timestamp}
User: ${userId} (${userRole})
Total Tests: ${testResults.summary.total}
Passed: ${testResults.summary.passed}
Failed: ${testResults.summary.failed}
Success Rate: ${testResults.summary.successRate}%
Critical Errors: ${testResults.summary.criticalErrors}

📋 DETAILED RESULTS:
`;

  Object.entries(testResults.tests).forEach(([name, test]) => {
    report += `
${test.success ? '✅' : '❌'} ${name}
   URL: ${test.url}
   Status: ${test.status}
   Duration: ${test.duration}ms
   ${test.success 
     ? `Data: ${test.dataType} (${test.dataLength} items)`
     : `Error: ${test.error}`
   }
`;
  });

  if (testResults.summary.errors.length > 0) {
    report += `
🚨 ERRORS SUMMARY:
`;
    testResults.summary.errors.forEach(error => {
      report += `- ${error.test}: ${error.error} ${error.critical ? '(CRITICAL)' : ''}\n`;
    });
  }

  report += `
💡 RECOMMENDATIONS:
`;

  if (testResults.summary.criticalErrors > 0) {
    report += `- Fix critical API endpoints before proceeding\n`;
  }
  
  if (testResults.summary.successRate < 80) {
    report += `- Check backend server status and authentication\n`;
  }
  
  if (testResults.tests['Student Messages']?.success === false) {
    report += `- Student messages endpoint is failing - this will cause infinite loading\n`;
  }
  
  if (testResults.tests['Teachers List']?.success === false) {
    report += `- Teachers list endpoint is failing - messaging features will be limited\n`;
  }

  console.log(report);
  return report;
};

export default {
  testMessagingAPIs,
  quickMessagingTest,
  checkAPIConnection,
  generateMessagingReport
};
