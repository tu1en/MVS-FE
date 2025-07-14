// Test script to verify assignment and submission data consistency
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

async function testAssignmentSubmissionConsistency() {
  try {
    if (!authToken) {
      await login();
    }

    const headers = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    console.log('\n📋 Testing Assignment-Submission Data Consistency...\n');

    // 1. Get student assignments
    console.log('1️⃣ Fetching student assignments...');
    const assignmentsResponse = await axios.get(`${API_BASE}/assignments/student/me`, { headers });
    const assignments = assignmentsResponse.data;
    console.log(`✅ Found ${assignments.length} assignments`);

    if (assignments.length === 0) {
      console.log('⚠️ No assignments found for student');
      return;
    }

    // 2. For each assignment, check submission status
    console.log('\n2️⃣ Checking submission status for each assignment...\n');
    
    for (const assignment of assignments) {
      console.log(`📝 Assignment: "${assignment.title}" (ID: ${assignment.id})`);
      console.log(`   Due Date: ${assignment.dueDate}`);
      console.log(`   Points: ${assignment.points}`);

      try {
        // Check if student has submitted this assignment
        const submissionResponse = await axios.get(
          `${API_BASE}/submissions/assignment/${assignment.id}/student/1`, // Assuming student ID is 1
          { headers }
        );
        
        const submission = submissionResponse.data;
        console.log(`   ✅ SUBMISSION FOUND:`);
        console.log(`      - Submission ID: ${submission.id}`);
        console.log(`      - Submitted At: ${submission.submittedAt}`);
        console.log(`      - Score: ${submission.score !== null ? submission.score : 'Not graded'}`);
        console.log(`      - Comment: ${submission.comment || 'No comment'}`);
        console.log(`      - Feedback: ${submission.feedback || 'No feedback'}`);
        
        // Check consistency
        const isLate = new Date(submission.submittedAt) > new Date(assignment.dueDate);
        console.log(`      - Is Late: ${isLate ? 'YES' : 'NO'}`);
        
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`   ❌ NO SUBMISSION FOUND`);
        } else {
          console.log(`   ⚠️ Error checking submission: ${error.response?.data?.message || error.message}`);
        }
      }
      
      console.log(''); // Empty line for readability
    }

    // 3. Test specific assignment that shows "submitted" in UI
    console.log('3️⃣ Testing specific assignments that show as "submitted" in UI...\n');
    
    // Look for assignments with specific IDs that were showing as submitted
    const testAssignmentIds = [1, 10044, 10045, 10046, 10047]; // Based on the screenshots
    
    for (const assignmentId of testAssignmentIds) {
      try {
        console.log(`🔍 Testing Assignment ID: ${assignmentId}`);
        
        // Get assignment details
        const assignmentResponse = await axios.get(`${API_BASE}/assignments/${assignmentId}`, { headers });
        const assignment = assignmentResponse.data;
        console.log(`   Assignment: "${assignment.title}"`);
        
        // Check submission
        const submissionResponse = await axios.get(
          `${API_BASE}/submissions/assignment/${assignmentId}/student/1`,
          { headers }
        );
        
        const submission = submissionResponse.data;
        console.log(`   ✅ HAS SUBMISSION - Score: ${submission.score !== null ? submission.score : 'Not graded'}`);
        
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`   ❌ Assignment ${assignmentId} not found or no submission`);
        } else {
          console.log(`   ⚠️ Error: ${error.response?.data?.message || error.message}`);
        }
      }
    }

    console.log('\n✅ Assignment-Submission consistency test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAssignmentSubmissionConsistency().catch(console.error);
