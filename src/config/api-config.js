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

    // Classroom endpoints (legacy - physical classrooms)
    CLASSROOMS: "/classrooms", 
    CLASSROOMS_BY_ID: (id) => `/classrooms/${id}`,
    
    // Class endpoints (new - classes created from templates)
    CLASSES: "/classes",
    CLASSES_BY_ID: (id) => `/classes/${id}`,
    CLASSES_LESSONS: (id) => `/classes/${id}/lessons`,
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

    // Course Template endpoints
    COURSE_TEMPLATES: "/course-templates",
    COURSE_TEMPLATES_BY_ID: (id) => `/course-templates/${id}`,
    COURSE_TEMPLATES_IMPORT: "/course-templates/import",
    COURSE_TEMPLATES_SAMPLE: "/course-templates/sample-template",
    COURSE_TEMPLATES_EXPORT: (id) => `/course-templates/${id}/export`,
    COURSE_TEMPLATES_LESSONS: (id) => `/course-templates/${id}/lessons`,
    COURSE_TEMPLATES_SEARCH: "/course-templates/search",

    // Class Management endpoints
    CLASSES_CREATE: "/classes",
    CLASSES_CLONE: (id) => `/classes/${id}/clone`,
    CLASSES_SCHEDULE_CONFLICTS: "/classes/check-schedule-conflicts",
    CLASSES_ROOM_AVAILABILITY: "/classes/room-availability",

    // Rooms endpoints
    ROOMS: "/rooms",
    ROOMS_BY_ID: (id) => `/rooms/${id}`,

    // Teachers endpoints (for class assignment)
    TEACHERS: "/users/teachers",

    // Materials endpoints
    MATERIALS: "/materials",
    MATERIALS_UPLOAD: "/materials/upload",
    MATERIALS_DOWNLOAD: (id) => `/materials/download/${id}`,
    MATERIALS_BY_CLASSROOM: (classroomId) => `/materials/classroom/${classroomId}`,
    MATERIALS_BY_COURSE: (courseId) => `/materials/course/${courseId}`,

    // Lectures endpoints  
    LECTURES: "/lectures",
    LECTURES_BY_CLASSROOM: (classroomId) => `/lectures/classroom/${classroomId}`,
    LECTURES_CREATE: "/lectures",

    // Assignments endpoints (updated)
    ASSIGNMENTS_CREATE: "/assignments",
    ASSIGNMENTS_BY_CLASSROOM: (classroomId) => `/assignments/classroom/${classroomId}`,

    // Public Course endpoints (for Guest users)
    PUBLIC_COURSES: "/public/courses",
    PUBLIC_COURSE_CATALOG: "/public/courses/catalog",
    PUBLIC_COURSE_DETAIL: (id) => `/public/courses/${id}`,

    // Student Course endpoints (for authenticated students)
    STUDENT_COURSES_ENROLLED: "/student/courses/enrolled",
    STUDENT_COURSES_ALL: "/student/courses/all",
    STUDENT_COURSE_DETAIL: (id) => `/student/courses/${id}`,
    STUDENT_COURSE_ENROLL: (id) => `/student/courses/${id}/enroll`,
    STUDENT_COURSE_PROGRESS: (id) => `/student/courses/${id}/progress`,
    STUDENT_COURSES_STATS: "/student/courses/stats",
    STUDENT_COURSES_SEARCH: "/student/courses/search",

    // Teacher Course endpoints (for authenticated teachers)
    TEACHER_COURSE_TEMPLATES: "/teacher/course-templates",
    TEACHER_COURSE_TEMPLATE_DETAIL: (id) => `/teacher/course-templates/${id}`,
    TEACHER_COURSE_TEMPLATE_CREATE: "/teacher/course-templates",
    TEACHER_COURSE_TEMPLATE_UPDATE: (id) => `/teacher/course-templates/${id}`,
    TEACHER_COURSE_ENROLLMENTS: "/teacher/course-enrollments",
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 0,
    DEFAULT_SIZE: 10,
  },
};

export default API_CONFIG;
