/**
 * Configuration for API endpoints and related settings
 */
const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: '/api/v1',
  
  // Endpoints configuration
  ENDPOINTS: {
    // Greeting endpoint
    GREETING: '/greetings/hello',
    
    // User endpoints
    USERS: '/users',
    USERS_BY_ID: (id) => `/users/${id}`,
    CURRENT_USER: '/users/me',
    USER_REGISTER: '/auth/register',
    USER_LOGIN: '/auth/login',
    
    // Classroom endpoints
    CLASSES: '/classrooms',
    CLASSES_BY_ID: (id) => `/classrooms/${id}`,
    CLASS_STUDENTS: (id) => `/classrooms/${id}/students`,
    ENROLL_STUDENT: (classId, studentId) => `/classrooms/${classId}/enroll/${studentId}`,
    
    // Assignment endpoints
    ASSIGNMENTS: '/assignments',
    ASSIGNMENTS_BY_CLASS: (classId) => `/classrooms/${classId}/assignments`,
    ASSIGNMENTS_BY_ID: (id) => `/assignments/${id}`,
    
    // Submission endpoints
    SUBMISSIONS: '/submissions',
    SUBMISSIONS_BY_ASSIGNMENT: (assignmentId) => `/assignments/${assignmentId}/submissions`,
    SUBMISSIONS_BY_STUDENT: (studentId) => `/users/${studentId}/submissions`,
    GRADE_SUBMISSION: (submissionId) => `/submissions/${submissionId}/grade`
  },
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 0,
    DEFAULT_SIZE: 10
  }
};

export default API_CONFIG; 