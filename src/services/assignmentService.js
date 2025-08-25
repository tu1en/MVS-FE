import axiosInstance from '../config/axiosInstance';

// Use the configured axios instance instead of creating a new one
const apiClient = axiosInstance;

// Enhanced debugging utility for assignment operations
class AssignmentDebugger {
  static isDebugEnabled = true; // Set to false to disable debugging

  static log(operation, data, level = 'info') {
    if (!this.isDebugEnabled) return;

    const timestamp = new Date().toISOString();
    const prefix = `[ASSIGNMENT-DEBUG ${timestamp}] ${operation}:`;

    switch (level) {
      case 'error':
        console.error(prefix, data);
        break;
      case 'warn':
        console.warn(prefix, data);
        break;
      case 'info':
      default:
        console.log(prefix, data);
        break;
    }
  }

  static logApiCall(method, url, data = null, response = null, error = null) {
    if (!this.isDebugEnabled) return;

    const logData = {
      method: method.toUpperCase(),
      url,
      timestamp: new Date().toISOString(),
      requestData: data,
      responseData: response?.data,
      responseStatus: response?.status,
      responseHeaders: response?.headers,
      error: error ? {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      } : null
    };

    if (error) {
      this.log(`API_CALL_ERROR`, logData, 'error');
    } else {
      this.log(`API_CALL_SUCCESS`, logData);
    }
  }

  static logDataTransformation(operation, input, output, metadata = {}) {
    if (!this.isDebugEnabled) return;

    this.log(`DATA_TRANSFORM_${operation}`, {
      input: {
        type: typeof input,
        isArray: Array.isArray(input),
        length: Array.isArray(input) ? input.length : undefined,
        sample: Array.isArray(input) && input.length > 0 ? input[0] : input
      },
      output: {
        type: typeof output,
        isArray: Array.isArray(output),
        length: Array.isArray(output) ? output.length : undefined,
        sample: Array.isArray(output) && output.length > 0 ? output[0] : output
      },
      metadata
    });
  }

  static logUserContext(operation, userInfo) {
    if (!this.isDebugEnabled) return;

    this.log(`USER_CONTEXT_${operation}`, {
      userId: userInfo?.id,
      userRole: userInfo?.role,
      username: userInfo?.username,
      email: userInfo?.email,
      token: localStorage.getItem('token') ? 'Present' : 'Missing',
      timestamp: new Date().toISOString()
    });
  }

  static logAssignmentOperation(operation, assignmentData, additionalInfo = {}) {
    if (!this.isDebugEnabled) return;

    this.log(`ASSIGNMENT_${operation}`, {
      assignment: {
        id: assignmentData?.id,
        title: assignmentData?.title,
        classroomId: assignmentData?.classroomId,
        dueDate: assignmentData?.dueDate,
        points: assignmentData?.points,
        status: assignmentData?.status
      },
      additionalInfo,
      timestamp: new Date().toISOString()
    });
  }
}

class AssignmentService {
  /**
   * Get all assignments
   * @returns {Promise<Array>} Assignments list
   */
  static async getAllAssignments() {
    const operation = 'GET_ALL_ASSIGNMENTS';
    AssignmentDebugger.log(operation, 'Starting operation');

    try {
      const response = await apiClient.get('/assignments');
      AssignmentDebugger.logApiCall('GET', '/assignments', null, response);

      // Handle different response structures
      let data = response.data;
      const originalData = { ...data };

      if (data && data.data) {
        data = data.data; // If response has nested data property
      }

      AssignmentDebugger.logDataTransformation('RESPONSE_NORMALIZATION', originalData, data, {
        operation,
        hasNestedData: !!(originalData && originalData.data)
      });

      // Ensure we always return an array
      const result = Array.isArray(data) ? data : [];

      AssignmentDebugger.logDataTransformation('ARRAY_VALIDATION', data, result, {
        operation,
        wasArray: Array.isArray(data),
        finalCount: result.length
      });

      AssignmentDebugger.log(operation, `Successfully fetched ${result.length} assignments`);
      return result;
    } catch (error) {
      AssignmentDebugger.logApiCall('GET', '/assignments', null, null, error);
      AssignmentDebugger.log(operation, 'Returning empty array due to error', 'warn');
      // Return empty array instead of throwing error to allow graceful degradation
      return [];
    }
  }

  /**
   * Get assignments by classroom ID
   * @param {number} classroomId - Classroom ID
   * @returns {Promise<Array>} Assignments list
   */
  static async getAssignmentsByClassroom(classroomId) {
    const operation = 'GET_ASSIGNMENTS_BY_CLASSROOM';
    AssignmentDebugger.log(operation, `Starting operation for classroomId: ${classroomId}`);

    try {
      if (!classroomId) {
        AssignmentDebugger.log(operation, 'Missing classroomId parameter', 'error');
        throw new Error('Classroom ID is required');
      }

      const url = `/assignments/classroom/${classroomId}`;
      const response = await apiClient.get(url);
      AssignmentDebugger.logApiCall('GET', url, null, response);

      // Handle different response structures
      let data = response.data;
      const originalData = { ...data };

      if (data && data.data) {
        data = data.data; // If response has nested data property
      }

      AssignmentDebugger.logDataTransformation('RESPONSE_NORMALIZATION', originalData, data, {
        operation,
        classroomId,
        hasNestedData: !!(originalData && originalData.data)
      });

      // Ensure we always return an array
      const result = Array.isArray(data) ? data : [];

      AssignmentDebugger.logDataTransformation('ARRAY_VALIDATION', data, result, {
        operation,
        classroomId,
        wasArray: Array.isArray(data),
        finalCount: result.length
      });

      // Log assignment details for debugging
      if (result.length > 0) {
        AssignmentDebugger.log(operation, `Sample assignment structure:`, {
          sampleAssignment: result[0],
          totalCount: result.length,
          classroomId
        });
      }

      AssignmentDebugger.log(operation, `Successfully fetched ${result.length} assignments for classroom ${classroomId}`);
      return result;
    } catch (error) {
      AssignmentDebugger.logApiCall('GET', `/assignments/classroom/${classroomId}`, null, null, error);
      AssignmentDebugger.log(operation, `Returning empty array due to error for classroom ${classroomId}`, 'warn');
      return [];
    }
  }

  /**
   * Get assignments by student ID
   * @param {number} studentId - Student ID
   * @returns {Promise<Array>} Assignments list
   */
  static async getAssignmentsByStudent(studentId) {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      const response = await apiClient.get(`/assignments/student/${studentId}`);
      
      // Handle both direct array and wrapped object responses
      const responseData = response.data;
      if (responseData && typeof responseData === 'object' && Array.isArray(responseData.data)) {
        return responseData.data;
      }
      
      // Fallback for direct array or other structures
      return Array.isArray(responseData) ? responseData : [];
    } catch (error) {
      console.error(`Error fetching assignments for student ${studentId}:`, error);
      return [];
    }
  }

  /**
   * Create a new assignment
   * @param {Object} assignmentData - Assignment data
   * @returns {Promise<Object>} Created assignment
   */
  static async createAssignment(assignmentData) {
    const operation = 'CREATE_ASSIGNMENT';
    AssignmentDebugger.log(operation, 'Starting assignment creation', {
      assignmentData: {
        title: assignmentData?.title,
        classroomId: assignmentData?.classroomId,
        dueDate: assignmentData?.dueDate,
        points: assignmentData?.points,
        hasDescription: !!assignmentData?.description,
        descriptionLength: assignmentData?.description?.length || 0
      }
    });

    try {
      // Comprehensive validation
      if (!assignmentData) {
        AssignmentDebugger.log(operation, 'Missing assignmentData parameter', 'error');
        throw new Error('Assignment data is required');
      }

      const requiredFields = ['title', 'dueDate', 'classroomId'];
      const missingFields = requiredFields.filter(field => !assignmentData[field]);

      if (missingFields.length > 0) {
        AssignmentDebugger.log(operation, `Missing required fields: ${missingFields.join(', ')}`, 'error', {
          providedFields: Object.keys(assignmentData),
          missingFields
        });
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate due date format
      const dueDate = new Date(assignmentData.dueDate);
      if (isNaN(dueDate.getTime())) {
        AssignmentDebugger.log(operation, 'Invalid due date format', 'error', {
          providedDueDate: assignmentData.dueDate
        });
        throw new Error('Invalid due date format');
      }

      // Check if due date is in the future
      if (dueDate <= new Date()) {
        AssignmentDebugger.log(operation, 'Due date must be in the future', 'warn', {
          providedDueDate: assignmentData.dueDate,
          currentTime: new Date().toISOString()
        });
      }

      const url = '/assignments';
      const response = await apiClient.post(url, assignmentData);
      AssignmentDebugger.logApiCall('POST', url, assignmentData, response);

      AssignmentDebugger.logAssignmentOperation('CREATED', response.data, {
        originalData: assignmentData
      });

      AssignmentDebugger.log(operation, 'Successfully created assignment', {
        createdAssignment: response.data
      });

      return response.data;
    } catch (error) {
      AssignmentDebugger.logApiCall('POST', '/assignments', assignmentData, null, error);
      AssignmentDebugger.log(operation, 'Failed to create assignment', 'error');
      throw error;
    }
  }

  /**
   * Update an existing assignment
   * @param {number} assignmentId - Assignment ID
   * @param {Object} assignmentData - Updated assignment data
   * @returns {Promise<Object>} Updated assignment
   */
  static async updateAssignment(assignmentId, assignmentData) {
    try {
      if (!assignmentId || !assignmentData) {
        throw new Error('Assignment ID and data are required');
      }
      const response = await apiClient.put(`/assignments/${assignmentId}`, assignmentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating assignment ${assignmentId}:`, error);
      throw error;
    }
  }

  /**
   * Delete an assignment
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<void>}
   */
  static async deleteAssignment(assignmentId) {
    try {
      if (!assignmentId) {
        throw new Error('Assignment ID is required');
      }
      await apiClient.delete(`/assignments/${assignmentId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting assignment ${assignmentId}:`, error);
      throw error;
    }
  }

  /**
   * Get submissions for an assignment
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<Array>} Submissions list
   */
  static async getSubmissionsForAssignment(assignmentId) {
    const operation = 'GET_SUBMISSIONS_FOR_ASSIGNMENT';
    AssignmentDebugger.log(operation, `Starting operation for assignmentId: ${assignmentId}`);

    try {
      if (!assignmentId) {
        AssignmentDebugger.log(operation, 'Missing assignmentId parameter', 'error');
        throw new Error('Assignment ID is required');
      }

      // Log the request headers including authorization
      const token = localStorage.getItem('token');
      AssignmentDebugger.log(operation, `Token from localStorage: ${token}`, 'info');

      const url = `/assignments/${assignmentId}/submissions`;
      AssignmentDebugger.log(operation, `Making request to: ${url}`, 'info');

      const response = await apiClient.get(url);
      AssignmentDebugger.logApiCall('GET', url, null, response);

      // Handle different response structures
      let data = response.data;
      const originalData = { ...data };

      if (data && data.data) {
        data = data.data; // If response has nested data property
      }

      AssignmentDebugger.logDataTransformation('RESPONSE_NORMALIZATION', originalData, data, {
        operation,
        assignmentId,
        hasNestedData: !!(originalData && originalData.data)
      });

      // Ensure we always return an array
      const result = Array.isArray(data) ? data : [];

      AssignmentDebugger.logDataTransformation('ARRAY_VALIDATION', data, result, {
        operation,
        assignmentId,
        wasArray: Array.isArray(data),
        finalCount: result.length
      });

      // Log the result summary
      AssignmentDebugger.log(operation, `Retrieved ${result.length} submissions for assignment ${assignmentId}`, {
        submissionCount: result.length,
        assignmentId,
        firstSubmission: result.length > 0 ? {
          id: result[0].id,
          studentName: result[0].studentName,
          studentId: result[0].studentId,
          submissionDate: result[0].submissionDate,
          status: result[0].status,
          grade: result[0].grade
        } : null
      });

      return result;
    } catch (error) {
      AssignmentDebugger.logApiCall('GET', `/assignments/${assignmentId}/submissions`, null, null, error);
      AssignmentDebugger.log(operation, `Error retrieving submissions for assignment ${assignmentId}`, 'error', {
        error: error.message,
        responseStatus: error.response?.status,
        responseData: error.response?.data
      });
      
      // Show detailed error info but return empty array to avoid crashing
      console.error(`Failed to get submissions for assignment ${assignmentId}:`, error);
      return [];
    }
  }

  /**
   * Get submissions for a student
   * @param {number} studentId - Student ID
   * @returns {Promise<Array>} Submissions list
   */
  static async getSubmissionsByStudent(studentId) {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      const response = await apiClient.get(`/submissions/student/${studentId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching submissions for student ${studentId}:`, error);
      return []; // Return empty array for graceful degradation
    }
  }

  /**
   * Submit an assignment
   * @param {Object} submissionData - Submission data
   * @returns {Promise<Object>} Created submission
   */
  static async submitAssignment(submissionData) {
    try {
      if (!submissionData || !submissionData.assignmentId || !submissionData.studentId) {
        throw new Error('Invalid submission data. Assignment ID and student ID are required.');
      }
      const response = await apiClient.post('/submissions', submissionData);
      return response.data;
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw error;
    }
  }

  /**
   * Grade a submission
   * @param {number} assignmentId - Assignment ID
   * @param {number} submissionId - Submission ID
   * @param {Object} gradeData - Grade data (score, feedback)
   * @returns {Promise<Object>} Graded submission data
   */
  static async gradeSubmission(assignmentId, submissionId, gradeData) {
    const operation = 'GRADE_SUBMISSION';
    AssignmentDebugger.log(operation, `Starting grading for assignment ${assignmentId}, submission ${submissionId}`);

    try {
      if (!assignmentId || !submissionId) {
        throw new Error('Assignment ID and Submission ID are required');
      }

      // The new endpoint structure
      const url = `/assignments/${assignmentId}/submissions/${submissionId}/grade`;
      AssignmentDebugger.log(operation, 'Making API call to grade submission', {
        url: url,
        gradeData: gradeData
      });

      const response = await apiClient.post(url, gradeData);
      AssignmentDebugger.logApiCall('POST', url, gradeData, response);

      const responseData = response.data?.data || response.data;
      AssignmentDebugger.logDataTransformation('RESPONSE_NORMALIZATION', response.data, responseData, {
        operation,
        hasNestedData: !!(response.data && response.data.data)
      });
      
      AssignmentDebugger.log(operation, `Successfully graded submission for assignment ${assignmentId}`);
      return responseData;
    } catch (error) {
      AssignmentDebugger.logApiCall('POST', `/assignments/${assignmentId}/submissions/${submissionId}/grade`, gradeData, null, error);
      throw error;
    }
  }

  /**
   * Upload a file
   * @param {File|FormData} fileOrFormData - File object or FormData with file
   * @param {string} folder - Folder to upload to
   * @returns {Promise<Object>} Upload result
   */
  static async uploadFile(fileOrFormData, folder = 'assignments') {
    try {
      let formData;
      
      if (fileOrFormData instanceof FormData) {
        formData = fileOrFormData;
        // Make sure folder is set if not already in the FormData
        if (!formData.has('folder')) {
          formData.append('folder', folder);
        }
      } else {
        // Create FormData if a File object was passed
        formData = new FormData();
        formData.append('file', fileOrFormData);
        formData.append('folder', folder);
      }
      
      console.log('Uploading file with formData:', formData);
      
      const response = await apiClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Get assignments by teacher ID
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<Array>} Assignments list
   */
  static async getAssignmentsByTeacher(teacherId) {
    try {
      if (!teacherId) {
        throw new Error('Teacher ID is required');
      }
      const response = await apiClient.get('/assignments/current-teacher');
      let data = response.data;
      if (data && data.data) {
        data = data.data;
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching assignments for teacher ${teacherId}:`, error);
      return [];
    }
  }

  /**
   * Get assignments for the current logged-in teacher (from JWT token)
   * @returns {Promise<Array>} Assignments list
   */
  static async getCurrentTeacherAssignments() {
    const operation = 'GET_CURRENT_TEACHER_ASSIGNMENTS';
    AssignmentDebugger.log(operation, 'Starting operation');

    // Log authentication context
    const token = localStorage.getItem('token');
    AssignmentDebugger.logUserContext(operation, {
      hasToken: !!token,
      tokenLength: token?.length || 0
    });

    try {
      const url = '/assignments/current-teacher';
      const response = await apiClient.get(url);
      AssignmentDebugger.logApiCall('GET', url, null, response);

      // Handle different response structures
      let data = response.data;
      const originalData = { ...data };

      if (data && data.data) {
        data = data.data; // If response has nested data property
      }

      AssignmentDebugger.logDataTransformation('RESPONSE_NORMALIZATION', originalData, data, {
        operation,
        hasNestedData: !!(originalData && originalData.data)
      });

      // Ensure we always return an array
      const result = Array.isArray(data) ? data : [];

      AssignmentDebugger.logDataTransformation('ARRAY_VALIDATION', data, result, {
        operation,
        wasArray: Array.isArray(data),
        finalCount: result.length
      });

      // Enhanced debugging for assignment structure and date handling
      if (result.length > 0) {
        const firstAssignment = result[0];
        AssignmentDebugger.log(operation, 'Analyzing first assignment structure', {
          assignmentKeys: Object.keys(firstAssignment),
          dueDate: {
            value: firstAssignment.dueDate,
            type: typeof firstAssignment.dueDate,
            isArray: Array.isArray(firstAssignment.dueDate),
            length: Array.isArray(firstAssignment.dueDate) ? firstAssignment.dueDate.length : undefined
          },
          assignment: {
            id: firstAssignment.id,
            title: firstAssignment.title,
            classroomId: firstAssignment.classroomId,
            points: firstAssignment.points
          }
        });

        // Test date conversion with comprehensive error handling
        if (firstAssignment.dueDate) {
          try {
            let testDate;
            let conversionMethod;

            if (Array.isArray(firstAssignment.dueDate)) {
              const [year, month, day, hour, minute, second] = firstAssignment.dueDate;
              testDate = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
              conversionMethod = 'array_destructuring';
            } else {
              testDate = new Date(firstAssignment.dueDate);
              conversionMethod = 'direct_conversion';
            }

            const isValidDate = !isNaN(testDate.getTime());

            AssignmentDebugger.log(operation, 'Date conversion test', {
              originalDate: firstAssignment.dueDate,
              convertedDate: testDate.toISOString(),
              isValid: isValidDate,
              conversionMethod,
              timestamp: testDate.getTime()
            });

          } catch (dateError) {
            AssignmentDebugger.log(operation, 'Date conversion failed', 'error', {
              originalDate: firstAssignment.dueDate,
              error: dateError.message
            });
          }
        }
      }

      AssignmentDebugger.log(operation, `Successfully fetched ${result.length} teacher assignments`);
      return result;
    } catch (error) {
      AssignmentDebugger.logApiCall('GET', '/assignments/current-teacher', null, null, error);
      AssignmentDebugger.log(operation, 'Failed to fetch teacher assignments', 'error', {
        errorStatus: error.response?.status,
        errorData: error.response?.data,
        errorMessage: error.message
      });
      return [];
    }
  }

  /**
   * Get upcoming assignments for a student
   * @param {number} studentId - Student ID
   * @returns {Promise<Array>} Upcoming assignments list
   */
  static async getUpcomingAssignments(studentId) {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      // Get all assignments for student and filter upcoming ones on frontend
      const allAssignments = await this.getAssignmentsByStudent(studentId);
      
      // Ensure we have an array to work with
      if (!Array.isArray(allAssignments)) {
        console.warn('getAssignmentsByStudent did not return an array:', allAssignments);
        return [];
      }
      
      const now = new Date();
      
      // Filter for upcoming assignments (due date is in the future)
      const upcomingAssignments = allAssignments.filter(assignment => {
        if (!assignment.dueDate) return false;
        const dueDate = new Date(assignment.dueDate);
        return dueDate > now;
      });
      
      // Sort by due date ascending (earliest first)
      return upcomingAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } catch (error) {
      console.error(`Error fetching upcoming assignments for student ${studentId}:`, error);
      return [];
    }
  }

  /**
   * Get past assignments for a student
   * @param {number} studentId - Student ID
   * @returns {Promise<Array>} Past assignments list
   */
  static async getPastAssignments(studentId) {
    try {
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      // Get all assignments for student and filter past ones on frontend
      const allAssignments = await this.getAssignmentsByStudent(studentId);
      
      // Ensure we have an array to work with
      if (!Array.isArray(allAssignments)) {
        console.warn('getAssignmentsByStudent did not return an array:', allAssignments);
        return [];
      }
      
      const now = new Date();
      
      // Filter for past assignments (due date is in the past)
      const pastAssignments = allAssignments.filter(assignment => {
        if (!assignment.dueDate) return false;
        const dueDate = new Date(assignment.dueDate);
        return dueDate <= now;
      });
      
      // Sort by due date descending (most recent first)
      return pastAssignments.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    } catch (error) {
      console.error(`Error fetching past assignments for student ${studentId}:`, error);
      return [];
    }
  }

  /**
   * Get assignments for current authenticated student  
   * @returns {Promise<Array>} Current student's assignments
   */
  static async getCurrentStudentAssignments() {
    try {
      const response = await apiClient.get('/assignments/student/me');
      
      // Handle wrapped response
      let data = response.data;
      if (data && data.data) {
        data = data.data;
      }
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching current student assignments:', error);
      return [];
    }
  }

  /**
   * Get assignment by ID
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<Object>} Assignment details
   */
  static async getAssignmentById(assignmentId) {
    try {
      if (!assignmentId) {
        throw new Error('Assignment ID is required');
      }
      const response = await apiClient.get(`/assignments/${assignmentId}`);
      return response.data && response.data.data ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error fetching assignment ${assignmentId}:`, error);
      throw error;
    }
  }

  /**
   * Get submissions for a specific assignment
   * @param {number} assignmentId Assignment ID
   * @returns {Promise<Array>} Submissions list
   */
  static async getSubmissionsByAssignment(assignmentId) {
    try {
      if (!assignmentId) {
        throw new Error('Assignment ID is required');
      }
      const response = await apiClient.get(`/assignments/${assignmentId}/submissions`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching submissions for assignment ${assignmentId}:`, error);
      return [];
    }
  }

  /**
   * Get classes for current authenticated student
   * @returns {Promise<Array>} Student's classes list
   */
  static async getStudentClasses() {
    try {
      const response = await apiClient.get('/student/classes');
      
      // Handle wrapped response
      let data = response.data;
      if (data && data.data) {
        data = data.data;
      }
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching student classes:', error);
      // Return empty array if API fails, so UI doesn't break
      return [];
    }
  }
}

export default AssignmentService;