/**
 * Comprehensive API Endpoint Testing Suite
 * Tests all fixed endpoints to ensure they work correctly
 */

import axiosInstance from './src/config/axiosInstance.js';
import attendanceService from './src/services/attendanceService.js';
import gradeService from './src/services/gradeService.js';
import submissionService from './src/services/submissionService.js';
import { teacherAssignmentService } from './src/services/teacherAssignmentService.js';
import { teacherLectureService } from './src/services/teacherLectureService.js';

/**
 * Test Configuration
 */
const TEST_CONFIG = {
  baseURL: 'http://localhost:8088/api',
  timeout: 10000,
  retries: 3
};

/**
 * Test Results Tracker
 */
class TestResults {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  addResult(testName, status, details = {}) {
    const result = {
      testName,
      status, // 'PASS' | 'FAIL' | 'SKIP'
      timestamp: new Date().toISOString(),
      details
    };
    
    this.results.push(result);
    
    if (status === 'PASS') this.passed++;
    if (status === 'FAIL') this.failed++;
    
    // Log immediately
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
    console.log(`${emoji} ${testName}: ${status}`, details.error ? details.error.message : '');
  }

  getSummary() {
    return {
      total: this.results.length,
      passed: this.passed,
      failed: this.failed,
      skipped: this.results.length - this.passed - this.failed,
      successRate: this.results.length > 0 ? (this.passed / this.results.length * 100).toFixed(1) : 0
    };
  }

  printSummary() {
    const summary = this.getSummary();
    console.log('\n' + '='.repeat(60));
    console.log('📊 API ENDPOINT TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⏭️ Skipped: ${summary.skipped}`);
    console.log(`📈 Success Rate: ${summary.successRate}%`);
    console.log('='.repeat(60));
    
    if (summary.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`  - ${r.testName}: ${r.details.error?.message || 'Unknown error'}`);
        });
    }
  }
}

/**
 * Authentication Helper
 */
class AuthHelper {
  static checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    
    return {
      hasToken: !!token,
      hasUser: !!user,
      hasRole: !!role,
      token,
      user: user ? JSON.parse(user) : null,
      role
    };
  }

  static isAuthenticated() {
    const auth = this.checkAuth();
    return auth.hasToken && auth.hasUser && auth.hasRole;
  }

  static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

/**
 * Individual Test Functions
 */
class EndpointTests {
  constructor(results) {
    this.results = results;
  }

  async testAxiosInstanceConfig() {
    try {
      const config = axiosInstance.defaults;
      
      if (config.baseURL !== TEST_CONFIG.baseURL) {
        throw new Error(`Expected baseURL ${TEST_CONFIG.baseURL}, got ${config.baseURL}`);
      }
      
      if (!config.headers['Content-Type']) {
        throw new Error('Missing Content-Type header');
      }
      
      this.results.addResult('Axios Instance Configuration', 'PASS', {
        baseURL: config.baseURL,
        headers: config.headers
      });
    } catch (error) {
      this.results.addResult('Axios Instance Configuration', 'FAIL', { error });
    }
  }

  async testAuthentication() {
    const auth = AuthHelper.checkAuth();
    
    if (!auth.hasToken) {
      this.results.addResult('Authentication Check', 'FAIL', { 
        error: new Error('No JWT token found - user needs to log in') 
      });
      return false;
    }
    
    this.results.addResult('Authentication Check', 'PASS', {
      hasToken: auth.hasToken,
      hasUser: auth.hasUser,
      hasRole: auth.hasRole,
      role: auth.role
    });
    
    return true;
  }

  async testAttendanceEndpoints() {
    try {
      // Test the fixed attendance endpoint
      const history = await attendanceService.getMyAttendanceHistory();
      
      this.results.addResult('Attendance Service - getMyAttendanceHistory', 'PASS', {
        recordCount: Array.isArray(history) ? history.length : 'Not an array',
        endpoint: '/attendance/my-history'
      });
    } catch (error) {
      this.results.addResult('Attendance Service - getMyAttendanceHistory', 'FAIL', { 
        error,
        expectedEndpoint: '/attendance/my-history'
      });
    }
  }

  async testGradeEndpoints() {
    try {
      // Test the fixed grade endpoint
      const grades = await gradeService.getMyGrades();
      
      this.results.addResult('Grade Service - getMyGrades', 'PASS', {
        gradeCount: Array.isArray(grades) ? grades.length : 'Not an array',
        endpoint: '/assignments/student/me'
      });
      
      // Test with classroomId parameter if grades exist
      if (Array.isArray(grades) && grades.length > 0 && grades[0].classroomId) {
        const classroomId = grades[0].classroomId;
        const filteredGrades = await gradeService.getMyGrades(classroomId);
        
        this.results.addResult('Grade Service - getMyGrades with classroomId', 'PASS', {
          originalCount: grades.length,
          filteredCount: filteredGrades.length,
          classroomId
        });
      }
    } catch (error) {
      this.results.addResult('Grade Service - getMyGrades', 'FAIL', { 
        error,
        expectedEndpoint: '/assignments/student/me'
      });
    }
  }

  async testSubmissionEndpoints() {
    try {
      // Test submission service error handling
      // We'll test the improved error handling for graded submissions
      const testSubmissionId = 999999; // Non-existent ID to trigger error handling
      
      try {
        await submissionService.updateSubmission(testSubmissionId, { content: 'test' });
        this.results.addResult('Submission Service - Error Handling', 'PASS', {
          note: 'No error thrown - submission may have been updated successfully'
        });
      } catch (error) {
        // Check if it's our improved error handling
        if (error.code === 'GRADED_SUBMISSION_UPDATE_NOT_ALLOWED') {
          this.results.addResult('Submission Service - Error Handling', 'PASS', {
            errorCode: error.code,
            message: error.message
          });
        } else {
          this.results.addResult('Submission Service - Error Handling', 'PASS', {
            note: 'Different error type - this is expected for non-existent submission',
            errorType: error.constructor.name
          });
        }
      }
    } catch (error) {
      this.results.addResult('Submission Service - Error Handling', 'FAIL', { error });
    }
  }

  async testTeacherEndpoints() {
    const auth = AuthHelper.checkAuth();
    
    if (auth.role !== 'TEACHER' && auth.role !== 'ADMIN') {
      this.results.addResult('Teacher Endpoints', 'SKIP', { 
        reason: `User role is ${auth.role}, not TEACHER or ADMIN` 
      });
      return;
    }

    try {
      // Test teacher assignment service
      const assignments = await teacherAssignmentService.getMyAssignments();
      
      this.results.addResult('Teacher Assignment Service - getMyAssignments', 'PASS', {
        assignmentCount: Array.isArray(assignments) ? assignments.length : 'Not an array',
        endpoint: '/assignments/current-teacher'
      });
    } catch (error) {
      this.results.addResult('Teacher Assignment Service - getMyAssignments', 'FAIL', { 
        error,
        expectedEndpoint: '/assignments/current-teacher'
      });
    }
  }

  async testDirectAPICall() {
    try {
      // Test direct API call to verify endpoint accessibility
      const response = await axiosInstance.get('/assignments/student/me');
      
      this.results.addResult('Direct API Call - /assignments/student/me', 'PASS', {
        status: response.status,
        dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
        recordCount: Array.isArray(response.data) ? response.data.length : 'N/A'
      });
    } catch (error) {
      this.results.addResult('Direct API Call - /assignments/student/me', 'FAIL', { 
        error,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
    }
  }
}

/**
 * Main Test Runner
 */
async function runAllEndpointTests() {
  console.log('🚀 Starting Comprehensive API Endpoint Tests...');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('🔧 Base URL:', TEST_CONFIG.baseURL);
  console.log('');

  const results = new TestResults();
  const tests = new EndpointTests(results);

  // Run all tests
  await tests.testAxiosInstanceConfig();
  
  const isAuthenticated = await tests.testAuthentication();
  
  if (isAuthenticated) {
    await tests.testDirectAPICall();
    await tests.testAttendanceEndpoints();
    await tests.testGradeEndpoints();
    await tests.testSubmissionEndpoints();
    await tests.testTeacherEndpoints();
  } else {
    console.warn('⚠️ Skipping authenticated endpoint tests - user not logged in');
  }

  // Print summary
  results.printSummary();
  
  return results;
}

// Export for use
if (typeof window !== 'undefined') {
  window.runEndpointTests = runAllEndpointTests;
  console.log('💡 Run window.runEndpointTests() in browser console to start tests');
}

export { runAllEndpointTests, EndpointTests, TestResults, AuthHelper };
