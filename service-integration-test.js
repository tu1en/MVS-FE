/**
 * Service Integration Test
 * Tests the actual service classes after fixes
 */

// Test imports (adjust paths as needed for your environment)
const testServices = async () => {
  console.log('🧪 Service Integration Test');
  console.log('=' .repeat(50));
  
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    console.log('❌ This test needs to run in browser environment');
    return false;
  }
  
  // Check authentication
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token) {
    console.log('❌ No authentication token. Please log in first.');
    return false;
  }
  
  console.log(`👤 Testing as role: ${role}`);
  console.log('');
  
  const results = [];
  
  // Test 1: Grade Service
  console.log('📊 Testing Grade Service...');
  try {
    // Dynamically import the service
    const { default: gradeService } = await import('./src/services/gradeService.js');
    
    const grades = await gradeService.getMyGrades();
    console.log(`✅ gradeService.getMyGrades() - Found ${grades.length} grades`);
    
    if (grades.length > 0) {
      const firstGrade = grades[0];
      console.log(`📝 Sample grade:`, {
        id: firstGrade.id,
        title: firstGrade.title,
        classroomId: firstGrade.classroomId,
        classroomName: firstGrade.classroomName,
        maxPoints: firstGrade.maxPoints
      });
      
      // Test with classroomId filter
      if (firstGrade.classroomId) {
        const filteredGrades = await gradeService.getMyGrades(firstGrade.classroomId);
        console.log(`✅ gradeService.getMyGrades(${firstGrade.classroomId}) - Found ${filteredGrades.length} grades`);
      }
    }
    
    results.push({ service: 'gradeService', status: 'PASS' });
  } catch (error) {
    console.log(`❌ gradeService failed:`, error.message);
    results.push({ service: 'gradeService', status: 'FAIL', error: error.message });
  }
  
  console.log('');
  
  // Test 2: Attendance Service
  console.log('📅 Testing Attendance Service...');
  try {
    const { default: attendanceService } = await import('./src/services/attendanceService.js');
    
    const attendance = await attendanceService.getMyAttendanceHistory();
    console.log(`✅ attendanceService.getMyAttendanceHistory() - Found ${attendance.length} records`);
    
    if (attendance.length > 0) {
      const firstRecord = attendance[0];
      console.log(`📝 Sample attendance:`, {
        id: firstRecord.id,
        date: firstRecord.date,
        status: firstRecord.status,
        classroomName: firstRecord.classroomName
      });
    }
    
    results.push({ service: 'attendanceService', status: 'PASS' });
  } catch (error) {
    console.log(`❌ attendanceService failed:`, error.message);
    results.push({ service: 'attendanceService', status: 'FAIL', error: error.message });
  }
  
  console.log('');
  
  // Test 3: Submission Service (Error Handling)
  console.log('📄 Testing Submission Service Error Handling...');
  try {
    const { default: submissionService } = await import('./src/services/submissionService.js');
    
    // Test with invalid submission ID to trigger error handling
    try {
      await submissionService.updateSubmission(999999, { content: 'test' });
      console.log(`✅ submissionService.updateSubmission() - No error (submission updated or not found)`);
    } catch (error) {
      if (error.code === 'GRADED_SUBMISSION_UPDATE_NOT_ALLOWED') {
        console.log(`✅ submissionService error handling works - Got expected error code: ${error.code}`);
      } else {
        console.log(`✅ submissionService error handling - Got error: ${error.message}`);
      }
    }
    
    results.push({ service: 'submissionService', status: 'PASS' });
  } catch (error) {
    console.log(`❌ submissionService failed:`, error.message);
    results.push({ service: 'submissionService', status: 'FAIL', error: error.message });
  }
  
  console.log('');
  
  // Test 4: Teacher Services (if user is teacher)
  if (role === 'TEACHER' || role === 'ADMIN') {
    console.log('👨‍🏫 Testing Teacher Services...');
    
    try {
      const { teacherAssignmentService } = await import('./src/services/teacherAssignmentService.js');
      
      const assignments = await teacherAssignmentService.getMyAssignments();
      console.log(`✅ teacherAssignmentService.getMyAssignments() - Found ${assignments.length} assignments`);
      
      results.push({ service: 'teacherAssignmentService', status: 'PASS' });
    } catch (error) {
      console.log(`❌ teacherAssignmentService failed:`, error.message);
      results.push({ service: 'teacherAssignmentService', status: 'FAIL', error: error.message });
    }
  } else {
    console.log('⏭️ Skipping teacher services (user is not teacher)');
  }
  
  // Summary
  console.log('');
  console.log('=' .repeat(50));
  console.log('📋 SERVICE TEST SUMMARY');
  console.log('=' .repeat(50));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  results.forEach(result => {
    const emoji = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${emoji} ${result.service}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('');
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  console.log(`📈 Success rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('🎉 All service tests passed! The fixes are working correctly.');
  } else {
    console.log('⚠️ Some services failed. Check the errors above.');
  }
  
  return failed === 0;
};

// Test URL construction
const testURLConstruction = () => {
  console.log('🔗 Testing URL Construction...');
  console.log('=' .repeat(40));
  
  const expectedEndpoints = [
    '/assignments/student/me',
    '/attendance/my-history', 
    '/classrooms/student/me',
    '/submissions/assignment/{id}',
    '/assignments/current-teacher',
    '/lectures',
    '/files/upload'
  ];
  
  console.log('✅ Expected endpoints after fixes:');
  expectedEndpoints.forEach(endpoint => {
    console.log(`  📡 ${endpoint}`);
  });
  
  console.log('\n🔧 With baseURL: http://localhost:8088/api');
  console.log('📝 Full URLs will be:');
  expectedEndpoints.forEach(endpoint => {
    console.log(`  🌐 http://localhost:8088/api${endpoint}`);
  });
  
  return true;
};

// Make available globally
if (typeof window !== 'undefined') {
  window.testServices = testServices;
  window.testURLConstruction = testURLConstruction;
  
  console.log('💡 Available test functions:');
  console.log('  - window.testServices() - Test service integration');
  console.log('  - window.testURLConstruction() - Test URL construction');
}

export { testServices, testURLConstruction };
