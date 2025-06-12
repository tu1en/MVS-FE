/**
 * Configuration for API endpoints and related settings
 */
const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: "http://localhost:8088/api",

  // Endpoints configuration
  ENDPOINTS: {
    // Greeting endpoint
    GREETING: "/greetings/hello",

    // User endpoints
    USERS: "/users",
    USERS_BY_ID: (id) => `/users/${id}`,
    CURRENT_USER: "/users/me",
    USER_REGISTER: "/auth/register",
    USER_LOGIN: "/auth/login",

    // Account management endpoints
    ACCOUNTS: "/users",
    DEPARTMENTS: "/departments",

    // Student accomplishments endpoint
    STUDENT_ACCOMPLISHMENTS: (userId) => `/students/${userId}/accomplishments`,

    // Classroom endpoints
    CLASSES: "/classrooms",
    CLASSES_BY_ID: (id) => `/classrooms/${id}`,
    CLASS_STUDENTS: (id) => `/classrooms/${id}/students`,
    ENROLL_STUDENT: (classId, studentId) =>
      `/classrooms/${classId}/enroll/${studentId}`,

    // Assignment endpoints
    ASSIGNMENTS: "/assignments",
    ASSIGNMENTS_BY_CLASS: (classId) => `/classrooms/${classId}/assignments`,
    ASSIGNMENTS_BY_ID: (id) => `/assignments/${id}`,    // Submission endpoints
    SUBMISSIONS: "/submissions",
    SUBMISSIONS_BY_ASSIGNMENT: (assignmentId) =>
      `/assignments/${assignmentId}/submissions`,
    SUBMISSIONS_BY_STUDENT: (studentId) => `/users/${studentId}/submissions`,
    GRADE_SUBMISSION: (submissionId) => `/submissions/${submissionId}/grade`,

    // Attendance endpoints
    ATTENDANCE: "/attendance",
    ATTENDANCE_SESSIONS: "/attendance/sessions",    ATTENDANCE_SESSIONS_TEACHER: "/attendance/sessions/teacher",
    ATTENDANCE_TEACHER: "/attendance/teacher",
    ATTENDANCE_STUDENT: "/attendance/student",
    ATTENDANCE_SESSION_BY_ID: (sessionId) => `/attendance/sessions/${sessionId}`,
    ATTENDANCE_SESSION_STATUS: (sessionId) => `/attendance/sessions/${sessionId}/status`,
    ATTENDANCE_MARK: (sessionId) => `/attendance/sessions/${sessionId}/mark`,

    // Teacher specific endpoints
    TEACHER_SCHEDULE: "/teacher/schedule",
    TEACHER_COURSES: "/teacher/courses", 
    TEACHER_DASHBOARD_STATS: "/teacher/dashboard-stats",
    TEACHER_PROFILE: "/teacher/profile",
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 0,
    DEFAULT_SIZE: 10,
  },
};

export default API_CONFIG;
