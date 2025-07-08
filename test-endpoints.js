// Test script to verify the correct API endpoints are being used
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8088/api';

async function testEndpoints() {
  console.log('Testing API endpoints...');
  
  // Test attendance endpoint
  try {
    const attendanceResponse = await axios.get(`${API_BASE_URL}/v1/attendance/my-history?classroomId=1`, {
      headers: {
        'Authorization': 'Bearer ' + (process.env.TEST_TOKEN || 'test_token')
      }
    });
    console.log('✅ Attendance endpoint working:', attendanceResponse.status);
  } catch (error) {
    console.log('❌ Attendance endpoint failed:', error.response?.status || error.message);
  }
  
  // Test assignments endpoint
  try {
    const assignmentsResponse = await axios.get(`${API_BASE_URL}/assignments/student`, {
      headers: {
        'Authorization': 'Bearer ' + (process.env.TEST_TOKEN || 'test_token')
      }
    });
    console.log('✅ Assignments endpoint working:', assignmentsResponse.status);
  } catch (error) {
    console.log('❌ Assignments endpoint failed:', error.response?.status || error.message);
  }
  
  // Test messages endpoint
  try {
    const messagesResponse = await axios.get(`${API_BASE_URL}/messages/dashboard/unread-count`, {
      headers: {
        'Authorization': 'Bearer ' + (process.env.TEST_TOKEN || 'test_token')
      }
    });
    console.log('✅ Messages endpoint working:', messagesResponse.status);
  } catch (error) {
    console.log('❌ Messages endpoint failed:', error.response?.status || error.message);
  }
  
  // Test classrooms endpoint
  try {
    const classroomsResponse = await axios.get(`${API_BASE_URL}/classrooms/student/me`, {
      headers: {
        'Authorization': 'Bearer ' + (process.env.TEST_TOKEN || 'test_token')
      }
    });
    console.log('✅ Classrooms endpoint working:', classroomsResponse.status);
  } catch (error) {
    console.log('❌ Classrooms endpoint failed:', error.response?.status || error.message);
  }
}

testEndpoints().catch(console.error);
