import apiClient from './apiClient';

/**
 * Debug Service for API testing and troubleshooting
 * This service helps identify and fix API endpoint issues during development
 */
class DebugService {
  
  /**
   * Test multiple possible endpoints for a specific functionality
   * @param {string} functionality - The functionality being tested (e.g., 'attendance', 'assignments')
   * @param {Array} endpoints - Array of endpoint paths to test
   * @param {string} method - HTTP method ('GET', 'POST', etc.)
   * @param {Object} data - Request data (for POST/PUT requests)
   * @returns {Promise<Object>} Test results
   */
  static async testEndpoints(functionality, endpoints, method = 'GET', data = null) {
    console.log(`🔍 Testing ${functionality} endpoints...`);
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing: ${method} ${endpoint}`);
        
        let response;
        switch (method.toUpperCase()) {
          case 'GET':
            response = await apiClient.get(endpoint);
            break;
          case 'POST':
            response = await apiClient.post(endpoint, data);
            break;
          case 'PUT':
            response = await apiClient.put(endpoint, data);
            break;
          case 'DELETE':
            response = await apiClient.delete(endpoint);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
        
        results.push({
          endpoint,
          status: 'SUCCESS',
          statusCode: response.status,
          dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
          dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
          data: response.data
        });
        
        console.log(`✅ ${endpoint} - SUCCESS (${response.status})`);
        
      } catch (error) {
        results.push({
          endpoint,
          status: 'ERROR',
          statusCode: error.response?.status,
          error: error.response?.data || error.message
        });
        
        console.log(`❌ ${endpoint} - ERROR (${error.response?.status}) ${error.message}`);
      }
    }
    
    return {
      functionality,
      results,
      successfulEndpoints: results.filter(r => r.status === 'SUCCESS'),
      failedEndpoints: results.filter(r => r.status === 'ERROR')
    };
  }
  
  /**
   * Test student attendance endpoints
   */
  static async testAttendanceEndpoints() {
    const endpoints = [
      '/attendance/my-history',           // Current frontend call (failing)
      '/v1/attendance/my-history',       // Backend actual path
      '/attendance/student/history',     // Alternative
      '/student/attendance',             // Alternative
      '/attendance/student/view'         // Alternative from API config
    ];
    
    return await this.testEndpoints('Student Attendance', endpoints);
  }
  
  /**
   * Test student assignments endpoints
   */
  static async testAssignmentEndpoints() {
    const endpoints = [
      '/assignments/student/my-assignments',  // Current frontend call (failing)
      '/assignments/student',                 // Alternative
      '/v1/assignments/student',              // Alternative
      '/assignments/current-student',         // Alternative
      '/student/assignments'                  // Alternative
    ];
    
    return await this.testEndpoints('Student Assignments', endpoints);
  }
  
  /**
   * Test message endpoints
   */
  static async testMessageEndpoints() {
    const endpoints = [
      '/messages/unread',                     // Current frontend call (failing)
      '/messages/unread-count',               // Alternative
      '/student-messages/unread',             // Alternative  
      '/messages/dashboard/unread-count',     // From backend controller
      '/messages/unread/count'                // Alternative
    ];
    
    return await this.testEndpoints('Messages', endpoints);
  }
  
  /**
   * Test classroom endpoints for students
   */
  static async testClassroomEndpoints() {
    const endpoints = [
      '/classrooms/student/me',               // Current frontend call
      '/classrooms/current-student',          // Alternative
      '/student/classrooms',                  // Alternative
      '/classrooms/enrolled'                  // Alternative
    ];
    
    return await this.testEndpoints('Student Classrooms', endpoints);
  }
  
  /**
   * Run comprehensive API diagnosis for student dashboard
   */
  static async diagnoseStudentDashboardAPIs() {
    console.log('🚀 Starting comprehensive API diagnosis for Student Dashboard...');
    
    const testResults = await Promise.allSettled([
      this.testAttendanceEndpoints(),
      this.testAssignmentEndpoints(), 
      this.testMessageEndpoints(),
      this.testClassroomEndpoints()
    ]);
    
    const report = {
      timestamp: new Date().toISOString(),
      tests: testResults.map(result => 
        result.status === 'fulfilled' ? result.value : { error: result.reason }
      )
    };
    
    console.log('📊 API Diagnosis Report:', report);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(report);
    console.log('💡 Recommendations:', recommendations);
    
    return { report, recommendations };
  }
  
  /**
   * Generate recommendations based on test results
   */
  static generateRecommendations(report) {
    const recommendations = [];
    
    report.tests.forEach(test => {
      if (test.successfulEndpoints && test.successfulEndpoints.length > 0) {
        const workingEndpoint = test.successfulEndpoints[0];
        recommendations.push({
          functionality: test.functionality,
          action: 'UPDATE_ENDPOINT',
          currentEndpoint: test.results[0]?.endpoint,
          recommendedEndpoint: workingEndpoint.endpoint,
          reason: `Found working endpoint: ${workingEndpoint.endpoint} (${workingEndpoint.statusCode})`
        });
      } else {
        recommendations.push({
          functionality: test.functionality,
          action: 'MISSING_ENDPOINT',
          reason: 'No working endpoints found - backend implementation needed'
        });
      }
    });
    
    return recommendations;
  }
  
  /**
   * Test a specific endpoint with query parameters
   */
  static async testEndpointWithParams(endpoint, params = {}) {
    try {
      console.log(`Testing ${endpoint} with params:`, params);
      const response = await apiClient.get(endpoint, { params });
      console.log(`✅ Success:`, response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.log(`❌ Error:`, error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }
  
  /**
   * Get current user info for debugging
   */
  static getCurrentUserInfo() {
    return {
      token: localStorage.getItem('token') ? 'Present' : 'Missing',
      userId: localStorage.getItem('userId'),
      role: localStorage.getItem('role'),
      email: localStorage.getItem('email'),
      username: localStorage.getItem('username')
    };
  }
}

// Expose debug functions to window for easy browser console access
window.debugAPI = {
  diagnose: () => DebugService.diagnoseStudentDashboardAPIs(),
  testAttendance: () => DebugService.testAttendanceEndpoints(),
  testAssignments: () => DebugService.testAssignmentEndpoints(),
  testMessages: () => DebugService.testMessageEndpoints(),
  testClassrooms: () => DebugService.testClassroomEndpoints(),
  testEndpoint: (endpoint, params) => DebugService.testEndpointWithParams(endpoint, params),
  userInfo: () => DebugService.getCurrentUserInfo()
};

export default DebugService;
