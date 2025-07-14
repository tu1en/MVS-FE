// Test script to verify API endpoints functionality
const axios = require('axios');

const API_BASE = 'http://localhost:8088/api';

// Test credentials
const TEST_CREDENTIALS = {
  username: 'student',
  password: 'student123'
};

let authToken = null;

async function login() {
  try {
    console.log('🔐 Logging in as student...');
    const response = await axios.post(`${API_BASE}/auth/login`, TEST_CREDENTIALS);
    authToken = response.data.token;
    console.log('✅ Login successful!');
    return authToken;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testAPIEndpoints() {
  try {
    if (!authToken) {
      await login();
    }

    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    console.log('\n🧪 Testing API Endpoints...\n');

    // 1. Test Assignments API
    console.log('1️⃣ Testing Assignments API...');
    try {
      const assignmentsResponse = await axios.get(`${API_BASE}/assignments/student/me`, { headers });
      console.log(`✅ Assignments API: ${assignmentsResponse.data.length} assignments found`);
    } catch (error) {
      console.log(`❌ Assignments API failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // 2. Test Grades API
    console.log('\n2️⃣ Testing Grades API...');
    try {
      // Try different grade endpoints
      const gradeEndpoints = [
        '/grades/student/me',
        '/submissions/student/me',
        '/classrooms/student/me'
      ];
      
      for (const endpoint of gradeEndpoints) {
        try {
          const response = await axios.get(`${API_BASE}${endpoint}`, { headers });
          console.log(`✅ ${endpoint}: Success - ${Array.isArray(response.data) ? response.data.length : 'Object'} items`);
        } catch (error) {
          console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ Grades API failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // 3. Test Attendance API
    console.log('\n3️⃣ Testing Attendance API...');
    try {
      const attendanceEndpoints = [
        '/attendance/my-history',
        '/attendance/student/me',
        '/classrooms/student/me' // To get classroom IDs first
      ];
      
      for (const endpoint of attendanceEndpoints) {
        try {
          const response = await axios.get(`${API_BASE}${endpoint}`, { headers });
          console.log(`✅ ${endpoint}: Success - ${Array.isArray(response.data) ? response.data.length : 'Object'} items`);
          
          // If this is classrooms endpoint, test attendance for first classroom
          if (endpoint.includes('classrooms') && Array.isArray(response.data) && response.data.length > 0) {
            const firstClassroomId = response.data[0].id;
            try {
              const attendanceResponse = await axios.get(`${API_BASE}/attendance/my-history`, { 
                headers,
                params: { classroomId: firstClassroomId }
              });
              console.log(`✅ Attendance for classroom ${firstClassroomId}: ${attendanceResponse.data.length} records`);
            } catch (error) {
              console.log(`❌ Attendance for classroom ${firstClassroomId}: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
            }
          }
        } catch (error) {
          console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ Attendance API failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // 4. Test Timetable API
    console.log('\n4️⃣ Testing Timetable API...');
    try {
      const timetableEndpoints = [
        '/timetable/my-timetable',
        '/timetable/student/me',
        '/events/student/me'
      ];
      
      for (const endpoint of timetableEndpoints) {
        try {
          const response = await axios.get(`${API_BASE}${endpoint}`, { headers });
          console.log(`✅ ${endpoint}: Success - ${Array.isArray(response.data) ? response.data.length : 'Object'} items`);
        } catch (error) {
          console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ Timetable API failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    // 5. Test Submissions API
    console.log('\n5️⃣ Testing Submissions API...');
    try {
      // First get assignments, then test submissions
      const assignmentsResponse = await axios.get(`${API_BASE}/assignments/student/me`, { headers });
      const assignments = assignmentsResponse.data;
      
      if (assignments.length > 0) {
        const firstAssignmentId = assignments[0].id;
        const studentId = 1; // Assuming student ID is 1
        
        try {
          const submissionResponse = await axios.get(
            `${API_BASE}/submissions/assignment/${firstAssignmentId}/student/${studentId}`,
            { headers }
          );
          console.log(`✅ Submission for assignment ${firstAssignmentId}: Found`);
        } catch (error) {
          if (error.response?.status === 404) {
            console.log(`ℹ️ No submission found for assignment ${firstAssignmentId} (expected)`);
          } else {
            console.log(`❌ Submission API failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
          }
        }
      } else {
        console.log('ℹ️ No assignments found to test submissions');
      }
    } catch (error) {
      console.log(`❌ Submissions API failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }

    console.log('\n✅ API endpoints testing completed!');

  } catch (error) {
    console.error('❌ API testing failed:', error.response?.data || error.message);
  }
}

// Run the test
testAPIEndpoints().catch(console.error);
