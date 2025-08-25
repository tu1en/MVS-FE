import API_CONFIG from '../config/api-config.js';
import apiClient from './apiClient';

const classManagementService = {
  /**
   * Get all classes with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.size - Page size
   * @param {string} params.status - Status filter
   * @param {number} params.teacherId - Teacher ID filter
   * @param {number} params.roomId - Room ID filter
   * @param {string} params.dateRange - Date range filter
   * @returns {Promise<Object>} Paginated classes response
   */
  getAllClasses: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.status) queryParams.append('status', params.status);
    if (params.teacherId) queryParams.append('teacherId', params.teacherId);
    if (params.roomId) queryParams.append('roomId', params.roomId);
    if (params.dateRange) queryParams.append('dateRange', params.dateRange);

    const url = `${API_CONFIG.ENDPOINTS.CLASSES}${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiClient.get(url);
  },

  /**
   * Get class by ID
   * @param {number} id - Class ID
   * @returns {Promise<Object>} Class details
   */
  getClassById: (id) => {
    return apiClient.get(API_CONFIG.ENDPOINTS.CLASSES_BY_ID(id));
  },

  /**
   * Lấy danh sách buổi học (class_lessons) của lớp
   */
  getClassLessons: (id) => {
    return apiClient.get(API_CONFIG.ENDPOINTS.CLASSES_LESSONS(id));
  },

  /**
   * Create new class from template
   * @param {Object} classData - Class creation data
   * @param {number} classData.courseTemplateId - Template ID
   * @param {string} classData.className - Class name
   * @param {string} classData.description - Class description
   * @param {number} classData.teacherId - Teacher ID
   * @param {number} classData.roomId - Room ID
   * @param {string} classData.startDate - Start date (ISO string)
   * @param {string} classData.endDate - End date (ISO string)
   * @param {Object} classData.schedule - Schedule configuration
   * @param {number} classData.maxStudents - Maximum students
   * @param {Object} classData.settings - Additional settings
   * @param {number} classData.createdBy - Creator user ID
   * @returns {Promise<Object>} Created class
   */
  createClass: (classData) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.CLASSES_CREATE, classData);
  },

  /**
   * Clone existing class
   * @param {number} id - Class ID to clone
   * @param {Object} cloneData - Clone configuration
   * @param {string} cloneData.newClassName - New class name
   * @param {string} cloneData.startDate - New start date
   * @param {string} cloneData.endDate - New end date
   * @param {number} cloneData.teacherId - New teacher ID (optional)
   * @param {number} cloneData.roomId - New room ID (optional)
   * @returns {Promise<Object>} Cloned class
   */
  cloneClass: (id, cloneData) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.CLASSES_CLONE(id), cloneData);
  },

  /**
   * Check for schedule conflicts
   * @param {Object} scheduleData - Schedule data to check
   * @param {number} scheduleData.roomId - Room ID
   * @param {number} scheduleData.teacherId - Teacher ID (optional)
   * @param {Object} scheduleData.schedule - Schedule configuration
   * @param {string} scheduleData.startDate - Start date
   * @param {string} scheduleData.endDate - End date
   * @returns {Promise<Array>} Array of conflicts
   */
  checkScheduleConflicts: (scheduleData) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.CLASSES_SCHEDULE_CONFLICTS, scheduleData);
  },

  /**
   * Lấy danh sách phòng trống theo điều kiện
   */
  getFreeRooms: ({ startDate, endDate, startTime, endTime, days }) => {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    params.append('startTime', startTime);
    params.append('endTime', endTime);
    if (Array.isArray(days)) {
      days.forEach(d => params.append('days', d));
    }
    const url = `${API_CONFIG.ENDPOINTS.CLASSES_FREE_ROOMS}?${params.toString()}`;
    return apiClient.get(url);
  },

  /**
   * Đổi lịch lớp
   */
  rescheduleClass: (id, payload) => {
    return apiClient.put(API_CONFIG.ENDPOINTS.CLASSES_RESCHEDULE(id), payload);
  },

  /**
   * Lấy giáo viên khả dụng theo môn và lịch
   * @param {Object} payload { subject, schedule, startDate, endDate }
   * @returns {Promise<Array>} Danh sách giáo viên khả dụng
   */
  getAvailableTeachers: (payload) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.CLASSES_AVAILABLE_TEACHERS, payload);
  },

  /**
   * Get room availability
   * @param {number} roomId - Room ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Object>} Room availability data
   */
  getRoomAvailability: (roomId, startDate, endDate) => {
    const params = new URLSearchParams({
      roomId: roomId.toString(),
      startDate,
      endDate
    });
    return apiClient.get(`${API_CONFIG.ENDPOINTS.CLASSES_ROOM_AVAILABILITY}?${params}`);
  },

  /**
   * Update class
   * @param {number} id - Class ID
   * @param {Object} classData - Updated class data
   * @returns {Promise<Object>} Updated class
   */
  updateClass: (id, classData) => {
    return apiClient.put(API_CONFIG.ENDPOINTS.CLASSES_BY_ID(id), classData);
  },

  /**
   * Cập nhật nhanh một phần thông tin lớp (partial fields)
   */
  updateClassPartial: (id, partial) => {
    return apiClient.put(API_CONFIG.ENDPOINTS.CLASSES_BY_ID(id), partial);
  },

  /**
   * Cập nhật nhanh công khai lớp học
   */
  updateClassPublic: (id, isPublic) => {
    return apiClient.put(`${API_CONFIG.ENDPOINTS.CLASSES_BY_ID(id)}`, { isPublic });
  },

  /**
   * Cập nhật nhanh học phí lớp học
   */
  updateClassTuition: (id, tuitionFee) => {
    return apiClient.put(`${API_CONFIG.ENDPOINTS.CLASSES_BY_ID(id)}`, { tuitionFee });
  },

  /**
   * Delete class
   * @param {number} id - Class ID
   * @returns {Promise<void>}
   */
  deleteClass: (id) => {
    return apiClient.delete(API_CONFIG.ENDPOINTS.CLASSES_BY_ID(id));
  },

  /**
   * Get class students
   * @param {number} id - Class ID
   * @returns {Promise<Array>} Array of students
   */
  getClassStudents: (id) => {
    return apiClient.get(API_CONFIG.ENDPOINTS.CLASS_STUDENTS(id));
  },

  /**
   * Enroll student in class
   * @param {number} classId - Class ID
   * @param {number} studentId - Student ID
   * @returns {Promise<Object>} Enrollment result
   */
  enrollStudent: (classId, studentId) => {
    // QUICK FIX: Map Class ID to Classroom ID
    const classToClassroomMapping = {
      1: 7,  // Toán Nâng cao 10-12 - Lớp 01
      2: 8,  // Toán Nâng cao 10-12 - Lớp 02
      3: 9,  // Toán Nâng cao 10-12 - Lớp 03
      4: 10, // Vật lý Chuyên đề - Lớp 01
      // Add more mappings as needed
    };

    const actualClassroomId = classToClassroomMapping[classId] || classId;

    // BE expects: POST /api/classrooms/{classroomId}/enrollments with body { studentId }
    const url = `${API_CONFIG.ENDPOINTS.CLASSROOMS_BY_ID(actualClassroomId)}/enrollments`;

    console.log('🔍 [DEBUG] enrollStudent API call:');
    console.log('🔍 [DEBUG] - Original classId:', classId);
    console.log('🔍 [DEBUG] - Mapped classroomId:', actualClassroomId);
    console.log('🔍 [DEBUG] - studentId:', studentId);
    console.log('🔍 [DEBUG] - URL:', url);
    console.log('🔍 [DEBUG] - Request body:', { studentId });

    return apiClient.post(url, { studentId }).then(response => {
      console.log('🔍 [DEBUG] enrollStudent response:', response);
      return response;
    }).catch(error => {
      console.error('🔍 [DEBUG] enrollStudent error:', error);
      throw error;
    });
  },

  /**
   * Get all available rooms
   * @returns {Promise<Array>} Array of rooms
   */
  getAllRooms: () => {
    return apiClient.get(API_CONFIG.ENDPOINTS.ROOMS);
  },

  /**
   * Get all available teachers
   * @returns {Promise<Array>} Array of teachers
   */
  getAllTeachers: () => {
    return apiClient.get(API_CONFIG.ENDPOINTS.TEACHERS);
  },

  /**
   * Get class statistics
   * @param {number} id - Class ID
   * @returns {Promise<Object>} Class statistics
   */
  getClassStats: (id) => {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.CLASSES_BY_ID(id)}/stats`);
  },

  /**
   * Get dashboard summary
   * @returns {Promise<Object>} Dashboard data with statistics
   */
  getDashboardData: async () => {
    try {
      const [templatesRes, classesRes, teachersRes, roomsRes] = await Promise.all([
        apiClient.get('/course-templates/summary'),
        apiClient.get('/classes/summary'),
        apiClient.get('/users/teachers/summary'),
        apiClient.get('/rooms/summary')
      ]);

      return {
        templates: templatesRes.data,
        classes: classesRes.data,
        teachers: teachersRes.data,
        rooms: roomsRes.data
      };
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      throw error;
    }
  }
};

export default classManagementService;