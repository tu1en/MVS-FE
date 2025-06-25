import api from './api';

/**
 * Student Data Loader Service
 * Provides centralized data loading functionality for student dashboard and other student pages
 */
class StudentDataLoaderService {
  
  /**
   * Load all essential student dashboard data
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Dashboard data object
   */
  static async loadStudentDashboardData(studentId) {
    try {
      console.log('Loading student dashboard data for ID:', studentId);
      
      // Use Promise.allSettled to handle individual endpoint failures gracefully
      const results = await Promise.allSettled([
        this.loadAssignments(),
        this.loadAttendance(), 
        this.loadCourses(),
        this.loadMessages(),
        this.loadGrades(),
        this.loadSchedule()
      ]);

      // Process results and extract data safely
      const dashboardData = {
        assignments: this.extractData(results[0], []),
        attendance: this.extractData(results[1], []),
        courses: this.extractData(results[2], []),
        messages: this.extractData(results[3], { unread: 0, total: 0 }),
        grades: this.extractData(results[4], []),
        schedule: this.extractData(results[5], []),
        
        // Calculated statistics
        stats: {}
      };

      // Calculate dashboard statistics
      dashboardData.stats = this.calculateStatistics(dashboardData);
      
      console.log('Successfully loaded student dashboard data:', dashboardData);
      return dashboardData;
      
    } catch (error) {
      console.error('Error loading student dashboard data:', error);
      throw new Error('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
    }
  }

  /**
   * Load student assignments
   * @returns {Promise<Array>} List of assignments
   */
  static async loadAssignments() {
    try {
      console.log('Loading student assignments...');
      const response = await api.get('/v1/assignments/student');
      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
      return [];
    }
  }

  /**
   * Load student attendance records
   * @returns {Promise<Array>} List of attendance records
   */
  static async loadAttendance() {
    try {
      console.log('Loading student attendance...');
      const response = await api.get('/attendance/student/view');
      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    } catch (error) {
      console.error('Error loading attendance:', error);
      return [];
    }
  }

  /**
   * Load student courses
   * @returns {Promise<Array>} List of courses
   */
  static async loadCourses() {
    try {
      console.log('Loading student courses...');
      // Try multiple endpoints as fallbacks
      const endpoints = ['/v1/courses/student', '/classrooms/student', '/courses'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
          if (data.length > 0) {
            return data;
          }
        } catch (err) {
          console.warn(`Endpoint ${endpoint} failed:`, err);
          continue;
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error loading courses:', error);
      return [];
    }
  }

  /**
   * Load student messages
   * @returns {Promise<Object>} Messages data with unread count
   */
  static async loadMessages() {
    try {
      console.log('Loading student messages...');
      
      // Try to load unread messages count
      const endpoints = [
        '/messages/unread-count',
        '/student-messages/unread-count', 
        '/v1/messages/unread'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          return {
            unread: response.data.count || response.data.unreadCount || 0,
            total: response.data.total || 0
          };
        } catch (err) {
          console.warn(`Messages endpoint ${endpoint} failed:`, err);
          continue;
        }
      }
      
      return { unread: 0, total: 0 };
    } catch (error) {
      console.error('Error loading messages:', error);
      return { unread: 0, total: 0 };
    }
  }

  /**
   * Load student grades
   * @returns {Promise<Array>} List of grades
   */
  static async loadGrades() {
    try {
      console.log('Loading student grades...');
      
      const endpoints = ['/v1/grades/student', '/grades/student', '/student/grades'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
          if (data.length > 0) {
            return data;
          }
        } catch (err) {
          console.warn(`Grades endpoint ${endpoint} failed:`, err);
          continue;
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error loading grades:', error);
      return [];
    }
  }

  /**
   * Load student schedule
   * @returns {Promise<Array>} List of schedule items
   */
  static async loadSchedule() {
    try {
      console.log('Loading student schedule...');
      
      const endpoints = ['/v1/schedule/student', '/schedule/student', '/timetable/student'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
          if (data.length > 0) {
            return data;
          }
        } catch (err) {
          console.warn(`Schedule endpoint ${endpoint} failed:`, err);
          continue;
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error loading schedule:', error);
      return [];
    }
  }

  /**
   * Extract data from Promise.allSettled result
   * @param {Object} result - Promise result
   * @param {any} fallback - Fallback value if extraction fails
   * @returns {any} Extracted data or fallback
   */
  static extractData(result, fallback) {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.warn('Data extraction failed:', result.reason);
      return fallback;
    }
  }

  /**
   * Calculate dashboard statistics from loaded data
   * @param {Object} data - Dashboard data object
   * @returns {Object} Calculated statistics
   */
  static calculateStatistics(data) {
    const stats = {
      assignmentStats: { total: 0, submitted: 0, pending: 0, graded: 0 },
      attendanceStats: { totalSessions: 0, attended: 0, percentage: 0 },
      courseStats: { totalCourses: 0, activeCourses: 0 },
      messageStats: { unreadMessages: 0 },
      gradeStats: { averageGrade: 0, totalGraded: 0 }
    };

    // Calculate assignment statistics
    if (Array.isArray(data.assignments)) {
      stats.assignmentStats.total = data.assignments.length;
      stats.assignmentStats.submitted = data.assignments.filter(a => 
        a.submissionStatus === 'SUBMITTED' || a.status === 'SUBMITTED'
      ).length;
      stats.assignmentStats.graded = data.assignments.filter(a => 
        a.grade !== null && a.grade !== undefined
      ).length;
      stats.assignmentStats.pending = stats.assignmentStats.total - stats.assignmentStats.submitted;
    }

    // Calculate attendance statistics
    if (Array.isArray(data.attendance)) {
      stats.attendanceStats.totalSessions = data.attendance.length;
      stats.attendanceStats.attended = data.attendance.filter(a => 
        a.status === 'PRESENT' || a.status === 'present'
      ).length;
      
      if (stats.attendanceStats.totalSessions > 0) {
        stats.attendanceStats.percentage = Math.round(
          (stats.attendanceStats.attended / stats.attendanceStats.totalSessions) * 100
        );
      }
    }

    // Calculate course statistics
    if (Array.isArray(data.courses)) {
      stats.courseStats.totalCourses = data.courses.length;
      stats.courseStats.activeCourses = data.courses.filter(c => 
        c.status === 'ACTIVE' || c.status === 'active' || !c.status
      ).length;
    }

    // Extract unique courses from assignments if courses data is empty
    if (stats.courseStats.totalCourses === 0 && Array.isArray(data.assignments)) {
      const uniqueCourseIds = [...new Set(
        data.assignments.map(a => a.classroomId || a.courseId).filter(Boolean)
      )];
      stats.courseStats.totalCourses = uniqueCourseIds.length;
      stats.courseStats.activeCourses = uniqueCourseIds.length;
    }

    // Calculate message statistics
    if (data.messages && typeof data.messages === 'object') {
      stats.messageStats.unreadMessages = data.messages.unread || 0;
    }

    // Calculate grade statistics
    if (Array.isArray(data.grades) && data.grades.length > 0) {
      const validGrades = data.grades.filter(g => 
        g.grade !== null && g.grade !== undefined && !isNaN(g.grade)
      );
      
      if (validGrades.length > 0) {
        const totalGrade = validGrades.reduce((sum, g) => sum + parseFloat(g.grade), 0);
        stats.gradeStats.averageGrade = Math.round((totalGrade / validGrades.length) * 100) / 100;
        stats.gradeStats.totalGraded = validGrades.length;
      }
    }

    return stats;
  }

  /**
   * Load specific data type for student
   * @param {string} dataType - Type of data to load ('assignments', 'attendance', etc.)
   * @returns {Promise<any>} Requested data
   */
  static async loadStudentData(dataType) {
    switch (dataType) {
      case 'assignments':
        return await this.loadAssignments();
      case 'attendance':
        return await this.loadAttendance();
      case 'courses':
        return await this.loadCourses();
      case 'messages':
        return await this.loadMessages();
      case 'grades':
        return await this.loadGrades();
      case 'schedule':
        return await this.loadSchedule();
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
  }

  /**
   * Refresh all student data
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Fresh dashboard data
   */
  static async refreshStudentData(studentId) {
    console.log('Refreshing all student data...');
    return await this.loadStudentDashboardData(studentId);
  }
}

export default StudentDataLoaderService;
