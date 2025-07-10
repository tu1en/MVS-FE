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
    USERS: "/v1/users",
    USERS_BY_ID: (id) => `/v1/users/${id}`,
    USERS_BY_ROLE: (roleId) => `/v1/users/role/${roleId}`,
    CURRENT_USER: "/users/me",
    USER_REGISTER: "/auth/register",
    USER_LOGIN: "/auth/login",
    USER_VALIDATE: "/auth/validate",

    // Account management endpoints
    ACCOUNTS: "/v1/users",
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
    ASSIGNMENTS: "/v1/assignments",
    ASSIGNMENTS_BY_CLASS: (classId) => `/classrooms/${classId}/assignments`,
    ASSIGNMENTS_BY_ID: (id) => `/v1/assignments/${id}`,// Submission endpoints
    SUBMISSIONS: "/submissions",
    SUBMISSIONS_BY_ASSIGNMENT: (assignmentId) =>
      `/assignments/${assignmentId}/submissions`,
    SUBMISSIONS_BY_STUDENT: (studentId) => `/users/${studentId}/submissions`,
    GRADE_SUBMISSION: (submissionId) => `/submissions/${submissionId}/grade`,

    // Attendance endpoints
    ATTENDANCE: "/v1/attendance",
    ATTENDANCE_SESSIONS: "/v1/attendance/sessions",
    ATTENDANCE_SESSIONS_TEACHER: "/v1/attendance/sessions/teacher",
    ATTENDANCE_TEACHER: "/v1/attendance/teacher",
    ATTENDANCE_STUDENT: "/v1/attendance/student/view",
    ATTENDANCE_SESSION_BY_ID: (sessionId) => `/v1/attendance/sessions/${sessionId}`,
    ATTENDANCE_SESSION_STATUS: (sessionId) => `/v1/attendance/sessions/${sessionId}/status`,
    ATTENDANCE_MARK: (sessionId) => `/v1/attendance/sessions/${sessionId}/mark`,
    
    // Teacher specific endpoints
    TEACHER_SCHEDULE: "/timetable/my-timetable", // Fixed to use the correct endpoint
    TEACHER_COURSES: "/classrooms/current-teacher", 
    TEACHER_DASHBOARD_STATS: "/teacher/dashboard-stats",
    TEACHER_PROFILE: "/teacher/profile",    
    
    // Message endpoints
    MESSAGES_RECEIVED: (recipientId) => `/messages/received/${recipientId}`,
    MESSAGES_SENT: (senderId) => `/messages/sent/${senderId}`,
    MESSAGES_CONVERSATION: (userId1, userId2) => `/student-messages/conversation/${userId1}/${userId2}`,
    MESSAGES_SEND: "/student-messages/send",
    MESSAGES_MARK_READ: (messageId) => `/messages/${messageId}/read`,

    // Classroom by teacher endpoints
    CLASSROOMS_BY_TEACHER: () => `/classrooms/current-teacher`,
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 0,
    DEFAULT_SIZE: 10,
  },
};

export default API_CONFIG;
