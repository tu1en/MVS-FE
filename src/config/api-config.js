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

    // Classroom endpoints - updated to use /classroom-management
    CLASSES: "/classroom-management",
    CLASSES_BY_ID: (id) => `/classroom-management/${id}`,
    CLASS_STUDENTS: (id) => `/classroom-management/${id}/students`,
    ENROLL_STUDENT: (classId, studentId) =>
      `/classroom-management/${classId}/enroll/${studentId}`,

    // Assignment endpoints
    ASSIGNMENTS: "/v1/assignments",
    ASSIGNMENTS_BY_CLASS: (classId) => `/classroom-management/${classId}/assignments`,
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
    
    // Teacher specific endpoints - Corrected to match backend API
    TEACHER_SCHEDULE: "/teacher/schedules", // Updated to match backend
    TEACHER_COURSES: "/teacher/courses", 
    TEACHER_DASHBOARD_STATS: "/teacher/dashboard-stats",
    TEACHER_PROFILE: "/teacher/profile",
    TEACHER_ANNOUNCEMENTS: "/teacher/announcements", // Added missing endpoint
    TEACHER_LEAVE_REQUESTS: "/teacher/leave-requests", // Added missing endpoint
    TEACHER_TEACHING_HISTORY: "/teacher/teaching-history", // Added missing endpoint
    TEACHER_MESSAGES: "/teacher/messages", // Added missing endpoint
    
    // Lecture endpoints
    LECTURES: "/lectures",
    LECTURE_BY_ID: (id) => `/lectures/${id}`,
    LECTURES_BY_CLASSROOM: (classroomId) => `/lectures/classroom/${classroomId}`,
    
    // Material endpoints (updated to match backend)
    MATERIALS: "/materials",
    MATERIALS_BY_LECTURE: (lectureId) => `/materials/lecture/${lectureId}`,
    MATERIAL_UPLOAD: (lectureId) => `/materials/lecture/${lectureId}/upload`,
    MATERIAL_DOWNLOAD: (materialId) => `/materials/download/${materialId}`,
    MATERIAL_DELETE: (materialId) => `/materials/${materialId}`,
    
    // Message endpoints
    MESSAGES_RECEIVED: (recipientId) => `/messages/received/${recipientId}`,
    MESSAGES_SENT: (senderId) => `/messages/sent/${senderId}`,
    MESSAGES_CONVERSATION: (userId1, userId2) => `/student-messages/conversation/${userId1}/${userId2}`,
    MESSAGES_SEND: "/student-messages/send",
    MESSAGES_MARK_READ: (messageId) => `/messages/${messageId}/read`,

    // Classroom by teacher endpoints
    CLASSROOMS_BY_TEACHER: () => `/teacher/courses`,
    TEACHER_CLASSES: "/api/classroom-management/classrooms/current-teacher",
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 0,
    DEFAULT_SIZE: 10,
  },
};

export default API_CONFIG;
