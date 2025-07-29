import api from './api';

const ClassroomService = {
  // ================= CRUD Operations ================= //
  
  async getAllClassrooms(page = 0, size = 10) {
    try {
      const response = await api.get(`/classroom-management/classrooms?page=${page}&size=${size}`);
      return {
        data: response.data.content || response.data,
        totalPages: response.data.totalPages || 1,
        totalElements: response.data.totalElements || (response.data.content ? response.data.content.length : 0)
      };
    } catch (error) {
      console.error('Error fetching all classrooms:', error);
      throw error;
    }
  },

  async getClassroomById(id) {
    try {
      const response = await api.get(`/classroom-management/classrooms/${id}`);
      return { data: response.data };
    } catch (error) {
      console.error(`Error fetching classroom ${id}:`, error);
      throw error;
    }
  },

  async createClassroom(classroomData) {
    try {
      const response = await api.post('/classroom-management/classrooms', classroomData);
      return { data: response.data };
    } catch (error) {
      console.error('Error creating classroom:', error);
      throw error;
    }
  },

  async updateClassroom(id, classroomData) {
    try {
      const response = await api.put(`/classroom-management/classrooms/${id}`, classroomData);
      return { data: response.data };
    } catch (error) {
      console.error(`Error updating classroom ${id}:`, error);
      throw error;
    }
  },

  async deleteClassroom(id) {
    try {
      const response = await api.delete(`/classroom-management/classrooms/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting classroom ${id}:`, error);
      throw error;
    }
  },

  // ================= Search Operations ================= //
  
  async searchClassrooms(keyword, page = 0, size = 10) {
    try {
      const response = await api.get(`/classroom-management/classrooms/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
      return {
        data: response.data.content || response.data,
        totalPages: response.data.totalPages || 1,
        totalElements: response.data.totalElements || (response.data.content ? response.data.content.length : 0)
      };
    } catch (error) {
      console.error('Error searching classrooms:', error);
      throw error;
    }
  },

  // ================= Current User Operations ================= //
  
  /**
   * Get classrooms for current student - Main endpoint used by StudentDashboard
   */
  async getMyStudentCourses() {
    try {
      console.log('Calling API: /classroom-management/classrooms/student/me');
      const response = await api.get('/classroom-management/classrooms/student/me');
      console.log('API Response:', response.data);
      
      // Handle different response formats
      const classrooms = Array.isArray(response.data) ? response.data : 
                        response.data.data ? response.data.data : 
                        response.data.content ? response.data.content : [];
      
      return { 
        data: classrooms,
        totalElements: classrooms.length 
      };
    } catch (error) {
      console.error('Error fetching student courses:', error);
      // Don't throw error, return empty data to prevent dashboard crash
      return { 
        data: [],
        totalElements: 0,
        error: error.message 
      };
    }
  },

  /**
   * **FIX: Add missing getEnrolledCourses method for StudentMaterials**
   * This method is called by StudentMaterials.jsx but was missing
   */
  async getEnrolledCourses() {
    try {
      console.log('🔄 ClassroomService.getEnrolledCourses - Fetching enrolled courses for materials');
      
      // Try the main student endpoint first
      const response = await api.get('/classroom-management/classrooms/student/me');
      console.log('📚 Enrolled courses response:', response.data);
      
      // Handle different response formats
      let classrooms = Array.isArray(response.data) ? response.data : 
                      response.data.data ? response.data.data : 
                      response.data.content ? response.data.content : [];
      
      // Transform the data to match expected format for StudentMaterials
      const enrolledCourses = classrooms.map(classroom => ({
        id: classroom.id,
        classroomName: classroom.name || classroom.className || 'Unnamed Course',
        teacherName: classroom.teacherName || classroom.teacher?.fullName || 'Unknown Teacher',
        description: classroom.description || '',
        subject: classroom.subject || '',
        section: classroom.section || '',
        studentCount: classroom.studentCount || 0,
        status: classroom.status || 'ACTIVE'
      }));
      
      console.log('✅ Transformed enrolled courses:', enrolledCourses);
      return enrolledCourses;
      
    } catch (error) {
      console.error('❌ Error fetching enrolled courses for materials:', error);
      
      // Try alternative endpoint as fallback
      try {
        console.log('🔄 Trying alternative endpoint...');
        const fallbackResponse = await api.get('/classroom-management/classrooms/current-student');
        const fallbackData = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : [];
        
        return fallbackData.map(classroom => ({
          id: classroom.id,
          classroomName: classroom.name || 'Unnamed Course',
          teacherName: classroom.teacherName || 'Unknown Teacher',
          description: classroom.description || '',
          subject: classroom.subject || '',
          section: classroom.section || '',
          studentCount: classroom.studentCount || 0,
          status: classroom.status || 'ACTIVE'
        }));
        
      } catch (fallbackError) {
        console.error('❌ Fallback endpoint also failed:', fallbackError);
        // Return empty array instead of throwing to prevent component crash
        return [];
      }
    }
  },

  /**
   * Alternative endpoint for student classrooms
   */
  async getClassroomsByCurrentStudent() {
    try {
      const response = await api.get('/classroom-management/classrooms/current-student');
      const classrooms = Array.isArray(response.data) ? response.data : 
                        response.data.data ? response.data.data : [];
      
      return { 
        data: classrooms,
        totalElements: classrooms.length 
      };
    } catch (error) {
      console.error('Error fetching classrooms for current student:', error);
      return { 
        data: [],
        totalElements: 0,
        error: error.message 
      };
    }
  },

  /**
   * Get classrooms for current teacher
   */
  async getMyTeacherCourses() {
    try {
      const response = await api.get('/classroom-management/classrooms/teacher/me');
      const classrooms = Array.isArray(response.data) ? response.data : 
                        response.data.data ? response.data.data : [];
      
      return { 
        data: classrooms,
        totalElements: classrooms.length 
      };
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      throw error;
    }
  },

  /**
   * Alternative endpoint for teacher classrooms
   */
  async getClassroomsByCurrentTeacher() {
    try {
      const response = await api.get('/classroom-management/classrooms/current-teacher');
      const classrooms = Array.isArray(response.data) ? response.data : 
                        response.data.data ? response.data.data : [];
      
      return { 
        data: classrooms,
        totalElements: classrooms.length 
      };
    } catch (error) {
      console.error('Error fetching classrooms for current teacher:', error);
      throw error;
    }
  },

  // ================= Classroom Details ================= //
  
  async getClassroomDetails(id) {
    try {
      const response = await api.get(`/classroom-management/classrooms/${id}/details`);
      return { data: response.data };
    } catch (error) {
      console.error(`Error fetching classroom details ${id}:`, error);
      throw error;
    }
  },

  // ================= Enrollment Operations ================= //
  
  async enrollStudent(classroomId, studentId) {
    try {
      const response = await api.post(`/classroom-management/classrooms/${classroomId}/students/${studentId}/enroll`);
      return { success: true };
    } catch (error) {
      console.error(`Error enrolling student ${studentId} in classroom ${classroomId}:`, error);
      throw error;
    }
  },

  async unenrollStudent(classroomId, studentId) {
    try {
      const response = await api.delete(`/classroom-management/classrooms/${classroomId}/students/${studentId}/unenroll`);
      return { success: true };
    } catch (error) {
      console.error(`Error unenrolling student ${studentId} from classroom ${classroomId}:`, error);
      throw error;
    }
  },

  // ================= Student Management ================= //
  
  async getStudentsInClassroom(classroomId) {
    try {
      const response = await api.get(`/classroom-management/classrooms/${classroomId}/students`);
      const students = Array.isArray(response.data) ? response.data : 
                      response.data.data ? response.data.data : [];
      
      return { 
        data: students,
        totalElements: students.length 
      };
    } catch (error) {
      console.error(`Error fetching students in classroom ${classroomId}:`, error);
      throw error;
    }
  },

  async getClassroomsByStudentId(studentId) {
    try {
      const response = await api.get(`/classroom-management/students/${studentId}/classrooms`);
      const classrooms = Array.isArray(response.data) ? response.data : 
                        response.data.data ? response.data.data : [];
      
      return { 
        data: classrooms,
        totalElements: classrooms.length 
      };
    } catch (error) {
      console.error(`Error fetching classrooms for student ${studentId}:`, error);
      throw error;
    }
  },

  // ================= Utility Methods ================= //
  
  /**
   * Helper method to format classroom data for display
   */
  formatClassroomForDisplay(classroom) {
    return {
      id: classroom.id,
      name: classroom.name || 'Untitled Course',
      description: classroom.description || '',
      subject: classroom.subject || '',
      section: classroom.section || '',
      teacherName: classroom.teacherName || classroom.teacher?.fullName || 'Unknown Teacher',
      teacherId: classroom.teacherId || classroom.teacher?.id,
      studentCount: classroom.studentCount || classroom.enrolledStudents?.length || 0,
      assignmentCount: classroom.assignmentCount || classroom.assignments?.length || 0,
      progressPercentage: classroom.progressPercentage || 0,
      status: classroom.status || 'ACTIVE',
      createdAt: classroom.createdAt,
      updatedAt: classroom.updatedAt
    };
  },

  /**
   * Helper method to handle API errors gracefully
   */
  handleApiError(error, defaultMessage = 'An error occurred') {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error || defaultMessage;
      
      switch (status) {
        case 401:
          return 'Authentication required. Please log in again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'Resource not found.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return message;
      }
    } else if (error.request) {
      // Network error
      return 'Network error. Please check your connection.';
    } else {
      // Other error
      return error.message || defaultMessage;
    }
  }
};

export default ClassroomService;