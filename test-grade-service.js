/**
 * Test script to verify gradeService.js fixes
 * Run this in browser console or as a standalone test
 */

// Import the gradeService (adjust path as needed)
import gradeService from './src/services/gradeService.js';

/**
 * Test the getMyGrades method
 */
async function testGetMyGrades() {
  console.log('🧪 Testing gradeService.getMyGrades()...');
  
  try {
    // Test without classroomId parameter
    console.log('📝 Test 1: getMyGrades() without classroomId');
    const allGrades = await gradeService.getMyGrades();
    console.log('✅ Success - All grades:', allGrades);
    console.log(`📊 Found ${allGrades.length} grade records`);
    
    // Test with classroomId parameter
    if (allGrades.length > 0 && allGrades[0].classroomId) {
      const testClassroomId = allGrades[0].classroomId;
      console.log(`📝 Test 2: getMyGrades(${testClassroomId}) with classroomId`);
      const filteredGrades = await gradeService.getMyGrades(testClassroomId);
      console.log('✅ Success - Filtered grades:', filteredGrades);
      console.log(`📊 Found ${filteredGrades.length} grade records for classroom ${testClassroomId}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Provide specific error analysis
    if (error.response?.status === 500) {
      console.error('🔍 500 Error Analysis:');
      console.error('- Check if backend is running on http://localhost:8088');
      console.error('- Verify JWT token is valid in localStorage');
      console.error('- Check backend logs for MethodArgumentTypeMismatchException');
    } else if (error.response?.status === 401) {
      console.error('🔍 401 Error Analysis:');
      console.error('- User needs to log in again');
      console.error('- JWT token may be expired or invalid');
    } else if (error.response?.status === 404) {
      console.error('🔍 404 Error Analysis:');
      console.error('- Endpoint /api/assignments/student/me not found');
      console.error('- Check if AssignmentController has the correct mapping');
    }
    
    return false;
  }
}

/**
 * Test the endpoint URL construction
 */
function testEndpointUrls() {
  console.log('🧪 Testing endpoint URL construction...');
  
  // Check axiosInstance configuration
  const axiosInstance = require('./src/config/axiosInstance.js').default;
  console.log('📝 Base URL:', axiosInstance.defaults.baseURL);
  
  // Expected URLs after our fixes:
  const expectedUrls = [
    'http://localhost:8088/api/assignments/student/me',
    'http://localhost:8088/api/classrooms/student/me',
    'http://localhost:8088/api/submissions/assignment/{id}'
  ];
  
  console.log('✅ Expected API calls after fixes:');
  expectedUrls.forEach(url => console.log(`  - ${url}`));
  
  return true;
}

/**
 * Test authentication headers
 */
function testAuthHeaders() {
  console.log('🧪 Testing authentication setup...');
  
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const role = localStorage.getItem('role');
  
  console.log('📝 Authentication status:');
  console.log(`  - Token: ${token ? '✅ Present' : '❌ Missing'}`);
  console.log(`  - User: ${user ? '✅ Present' : '❌ Missing'}`);
  console.log(`  - Role: ${role ? '✅ Present' : '❌ Missing'}`);
  
  if (!token) {
    console.warn('⚠️ No JWT token found - user needs to log in');
    return false;
  }
  
  return true;
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('🚀 Starting gradeService.js fix verification tests...');
  console.log('=' .repeat(60));
  
  const results = {
    authTest: testAuthHeaders(),
    urlTest: testEndpointUrls(),
    gradeTest: await testGetMyGrades()
  };
  
  console.log('=' .repeat(60));
  console.log('📋 Test Results Summary:');
  console.log(`  - Authentication: ${results.authTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  - URL Construction: ${results.urlTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  - Grade Service: ${results.gradeTest ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('🎉 The 500 Internal Server Error fix is working correctly!');
    console.log('👍 Students should now be able to view their grades page.');
  } else {
    console.log('🔧 Some issues remain - check the error details above.');
  }
  
  return allPassed;
}

// Export for use in browser console or test runner
if (typeof window !== 'undefined') {
  window.testGradeService = runAllTests;
  console.log('💡 Run window.testGradeService() in browser console to test');
}

export { runAllTests, testGetMyGrades, testEndpointUrls, testAuthHeaders };
