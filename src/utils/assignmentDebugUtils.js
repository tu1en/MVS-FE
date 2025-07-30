/**
 * Comprehensive debugging utilities for assignment functionality
 * This file provides tools to test and debug assignment operations
 */

import AssignmentService from '../services/assignmentService';

class AssignmentDebugUtils {

  /**
   * Test all assignment service methods with real API calls
   */
  static async runComprehensiveTest() {
    if (!AssignmentDebugUtils.isDebugMode) return;

    console.log('🚀 Starting comprehensive assignment functionality test...');
    
    const testResults = {
      getAllAssignments: null,
      getCurrentTeacherAssignments: null,
      getCurrentStudentAssignments: null,
      createAssignment: null,
      gradeSubmission: null,
      getSubmissions: null,
      errors: []
    };

    try {
      // Test 1: Get all assignments
      console.log('📋 Testing getAllAssignments...');
      testResults.getAllAssignments = await AssignmentService.getAllAssignments();
      console.log('✅ getAllAssignments result:', testResults.getAllAssignments);
    } catch (error) {
      console.error('❌ getAllAssignments failed:', error);
      testResults.errors.push({ method: 'getAllAssignments', error: error.message });
    }

    try {
      // Test 2: Get current teacher assignments
      console.log('👨‍🏫 Testing getCurrentTeacherAssignments...');
      testResults.getCurrentTeacherAssignments = await AssignmentService.getCurrentTeacherAssignments();
      console.log('✅ getCurrentTeacherAssignments result:', testResults.getCurrentTeacherAssignments);
    } catch (error) {
      console.error('❌ getCurrentTeacherAssignments failed:', error);
      testResults.errors.push({ method: 'getCurrentTeacherAssignments', error: error.message });
    }

    try {
      // Test 3: Get current student assignments
      console.log('👨‍🎓 Testing getCurrentStudentAssignments...');
      testResults.getCurrentStudentAssignments = await AssignmentService.getCurrentStudentAssignments();
      console.log('✅ getCurrentStudentAssignments result:', testResults.getCurrentStudentAssignments);
    } catch (error) {
      console.error('❌ getCurrentStudentAssignments failed:', error);
      testResults.errors.push({ method: 'getCurrentStudentAssignments', error: error.message });
    }

    // Test submissions if we have assignments
    if (testResults.getAllAssignments && testResults.getAllAssignments.length > 0) {
      const firstAssignment = testResults.getAllAssignments[0];
      
      try {
        console.log(`📝 Testing getSubmissionsForAssignment for assignment ${firstAssignment.id}...`);
        testResults.getSubmissions = await AssignmentService.getSubmissionsForAssignment(firstAssignment.id);
        console.log('✅ getSubmissionsForAssignment result:', testResults.getSubmissions);
      } catch (error) {
        console.error('❌ getSubmissionsForAssignment failed:', error);
        testResults.errors.push({ method: 'getSubmissionsForAssignment', error: error.message });
      }
    }

    console.log('🏁 Comprehensive test completed. Results:', testResults);
    return testResults;
  }

  /**
   * Test assignment creation with various data scenarios
   */
  static async testAssignmentCreation(classroomId) {
    if (!AssignmentDebugUtils.isDebugMode) return;

    console.log('🆕 Testing assignment creation scenarios...');
    
    const testCases = [
      {
        name: 'Valid assignment',
        data: {
          title: 'Debug Test Assignment',
          description: 'This is a test assignment created by debug utils',
          classroomId: classroomId,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          points: 100
        }
      },
      {
        name: 'Assignment with missing title',
        data: {
          description: 'Assignment without title',
          classroomId: classroomId,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          points: 100
        }
      },
      {
        name: 'Assignment with invalid due date',
        data: {
          title: 'Invalid Date Assignment',
          description: 'Assignment with past due date',
          classroomId: classroomId,
          dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          points: 100
        }
      }
    ];

    const results = [];

    for (const testCase of testCases) {
      try {
        console.log(`🧪 Testing: ${testCase.name}`);
        const result = await AssignmentService.createAssignment(testCase.data);
        console.log(`✅ ${testCase.name} succeeded:`, result);
        results.push({ testCase: testCase.name, success: true, result });
      } catch (error) {
        console.error(`❌ ${testCase.name} failed:`, error);
        results.push({ testCase: testCase.name, success: false, error: error.message });
      }
    }

    console.log('🏁 Assignment creation tests completed:', results);
    return results;
  }

  /**
   * Test grading functionality with various scenarios
   */
  static async testGradingFunctionality(assignmentId, submissionId) {
    if (!AssignmentDebugUtils.isDebugMode) return;

    console.log('📊 Testing grading functionality...');

    const testCases = [
      {
        name: 'Valid grade',
        data: {
          submissionId: submissionId,
          score: 85,
          feedback: 'Good work! Well done on this assignment.'
        }
      },
      {
        name: 'Grade with no feedback',
        data: {
          submissionId: submissionId,
          score: 90,
          feedback: ''
        }
      },
      {
        name: 'Invalid score (negative)',
        data: {
          submissionId: submissionId,
          score: -10,
          feedback: 'This should fail'
        }
      },
      {
        name: 'Invalid score (too high)',
        data: {
          submissionId: submissionId,
          score: 150,
          feedback: 'This should also fail'
        }
      }
    ];

    const results = [];

    for (const testCase of testCases) {
      try {
        console.log(`🧪 Testing grading: ${testCase.name}`);
        const result = await AssignmentService.gradeSubmission(assignmentId, testCase.data);
        console.log(`✅ ${testCase.name} succeeded:`, result);
        results.push({ testCase: testCase.name, success: true, result });
      } catch (error) {
        console.error(`❌ ${testCase.name} failed:`, error);
        results.push({ testCase: testCase.name, success: false, error: error.message });
      }
    }

    console.log('🏁 Grading tests completed:', results);
    return results;
  }

  /**
   * Analyze assignment data structure and identify potential issues
   */
  static analyzeAssignmentData(assignments) {
    if (!AssignmentDebugUtils.isDebugMode) return;

    console.log('🔍 Analyzing assignment data structure...');

    if (!Array.isArray(assignments)) {
      console.error('❌ Assignments is not an array:', typeof assignments);
      return { valid: false, issues: ['Not an array'] };
    }

    if (assignments.length === 0) {
      console.warn('⚠️ No assignments found');
      return { valid: true, issues: ['Empty array'], count: 0 };
    }

    const analysis = {
      valid: true,
      issues: [],
      count: assignments.length,
      fieldAnalysis: {},
      dateIssues: [],
      missingFields: []
    };

    // Analyze first assignment structure
    const sampleAssignment = assignments[0];
    const expectedFields = ['id', 'title', 'description', 'dueDate', 'points', 'classroomId'];
    
    expectedFields.forEach(field => {
      if (!(field in sampleAssignment)) {
        analysis.missingFields.push(field);
      } else {
        analysis.fieldAnalysis[field] = {
          type: typeof sampleAssignment[field],
          value: sampleAssignment[field]
        };
      }
    });

    // Analyze date fields
    assignments.forEach((assignment, index) => {
      if (assignment.dueDate) {
        const date = new Date(assignment.dueDate);
        if (isNaN(date.getTime())) {
          analysis.dateIssues.push({
            index,
            assignmentId: assignment.id,
            dueDate: assignment.dueDate,
            issue: 'Invalid date format'
          });
        }
      }
    });

    if (analysis.missingFields.length > 0) {
      analysis.issues.push(`Missing fields: ${analysis.missingFields.join(', ')}`);
    }

    if (analysis.dateIssues.length > 0) {
      analysis.issues.push(`Date format issues in ${analysis.dateIssues.length} assignments`);
    }

    console.log('📊 Assignment data analysis:', analysis);
    return analysis;
  }

  /**
   * Monitor assignment operations in real-time
   */
  static startOperationMonitoring() {
    if (!AssignmentDebugUtils.isDebugMode) return;

    console.log('👀 Starting assignment operation monitoring...');

    // Override console methods to capture assignment-related logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const operationLog = [];

    console.log = (...args) => {
      if (args.some(arg => typeof arg === 'string' && arg.includes('ASSIGNMENT'))) {
        operationLog.push({
          type: 'log',
          timestamp: new Date().toISOString(),
          args: args
        });
      }
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      if (args.some(arg => typeof arg === 'string' && arg.includes('ASSIGNMENT'))) {
        operationLog.push({
          type: 'error',
          timestamp: new Date().toISOString(),
          args: args
        });
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      if (args.some(arg => typeof arg === 'string' && arg.includes('ASSIGNMENT'))) {
        operationLog.push({
          type: 'warn',
          timestamp: new Date().toISOString(),
          args: args
        });
      }
      originalWarn.apply(console, args);
    };

    // Return function to stop monitoring and get results
    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      
      console.log('📋 Assignment operation monitoring results:', operationLog);
      return operationLog;
    };
  }

  /**
   * Generate a comprehensive debug report
   */
  static async generateDebugReport() {
    if (!AssignmentDebugUtils.isDebugMode) return;

    console.log('📄 Generating comprehensive assignment debug report...');

    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      localStorage: {
        token: !!localStorage.getItem('token'),
        role: localStorage.getItem('role'),
        userId: localStorage.getItem('userId')
      },
      tests: {}
    };

    // Run all tests
    report.tests.comprehensive = await this.runComprehensiveTest();
    
    // Analyze data if available
    if (report.tests.comprehensive.getAllAssignments) {
      report.dataAnalysis = this.analyzeAssignmentData(report.tests.comprehensive.getAllAssignments);
    }

    console.log('📊 Complete debug report:', report);
    return report;
  }
}

// Set debug mode property
AssignmentDebugUtils.isDebugMode = true;

// Export for use in other files
export default AssignmentDebugUtils;

// Auto-run basic test in development mode
if (process.env.NODE_ENV === 'development') {
  // Wait a bit for the app to initialize, then run basic tests
  setTimeout(() => {
    AssignmentDebugUtils.runComprehensiveTest();
  }, 5000);
}
