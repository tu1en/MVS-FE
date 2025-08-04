// import axiosInstance from '../config/axiosInstance';

// const API_URL = '/classrooms';

// const ClassroomService = {
//   /**
//    * Get all classrooms
//    * @returns {Promise<any>}
//    */
//   getAllClassrooms: () => {
//     return axiosInstance.get(API_URL);
//   },

//   /**
//    * Get a single classroom by its ID
//    * @param {number} id The ID of the classroom
//    * @returns {Promise<any>}
//    */
//   getClassroomById: (id) => {
//     return axiosInstance.get(`${API_URL}/${id}`);
//   },

//   /**
//    * Get classrooms for the current teacher
//    * @returns {Promise<any>}
//    */
//   getClassroomsByCurrentTeacher: async () => {
//     try {
//       const response = await axiosInstance.get(`${API_URL}/current-teacher`);
//       if (response.data && response.data.data) {
//         return response.data.data;
//       } else if (Array.isArray(response.data)) {
//         return response.data;
//       } else {
//         console.warn('Unexpected response format from API:', response.data);
//         // Fallback to mock data if API response format is unexpected
//         return [
//           { id: 1, name: "Toán Cao Cấp", section: "A", subject: "MATH101" },
//           { id: 2, name: "Lập Trình Cơ Bản", section: "B", subject: "CS101" }
//         ];
//       }
//     } catch (error) {
//       console.error('Error fetching classrooms for current teacher:', error);
//       // Provide mock data in case of error
//       console.log('Using mock classroom data due to API error');
//       return [
//         { id: 1, name: "Toán Cao Cấp", section: "A", subject: "MATH101" },
//         { id: 2, name: "Lập Trình Cơ Bản", section: "B", subject: "CS101" }
//       ];
//     }
//   },

//   /**
//    * Create a new classroom
//    * @param {object} classroomData The data for the new classroom
//    * @returns {Promise<any>}
//    */
//   createClassroom: (classroomData) => {
//     return axiosInstance.post(API_URL, classroomData);
//   },

//   /**
//    * Update an existing classroom
//    * @param {number} id The ID of the classroom to update
//    * @param {object} classroomData The updated data for the classroom
//    * @returns {Promise<any>}
//    */
//   updateClassroom: (id, classroomData) => {
//     return axiosInstance.put(`${API_URL}/${id}`, classroomData);
//   },

//   /**
//    * Delete a classroom
//    * @param {number} id The ID of the classroom to delete
//    * @returns {Promise<any>}
//    */
//   deleteClassroom: (id) => {
//     return axiosInstance.delete(`${API_URL}/${id}`);
//   },

//   /**
//    * Enroll a student in a classroom
//    * @param {number} classroomId The ID of the classroom
//    * @param {number} studentId The ID of the student
//    * @returns {Promise<any>}
//    */
//   enrollStudent: (classroomId, studentId) => {
//     return axiosInstance.post(`${API_URL}/${classroomId}/enrollments`, { studentId });
//   },

//   /**
//    * Get the list of students in a classroom
//    * @param {number} classroomId The ID of the classroom
//    * @returns {Promise<any>}
//    */
//   getStudentsInClassroom: (classroomId) => {
//     return axiosInstance.get(`${API_URL}/${classroomId}/students`);
//   },

//   /**
//    * Remove a student from a classroom
//    * @param {number} classroomId The ID of the classroom
//    * @param {number} studentId The ID of the student to remove
//    * @returns {Promise<any>}
//    */
//   removeStudent: (classroomId, studentId) => {
//     return axiosInstance.delete(`${API_URL}/${classroomId}/enrollments/${studentId}`);
//   },

//   getStudentCourses: (studentId) => {
//     return axiosInstance.get(`${API_URL}/student/${studentId}`);
//   },

//   /**
//    * FIXED: Get courses for the current logged-in student with multiple fallback strategies
//    * @returns {Promise<any>}
//    */
//   getMyStudentCourses: async () => {
//     const strategies = [
//       // Strategy 1: Try /student/me endpoint
//       async () => {
//         console.log('🔄 Trying strategy 1: /student/me');
//         const response = await axiosInstance.get(`${API_URL}/student/me`);
//         return response;
//       },
      
//       // Strategy 2: Try getting current user info first, then use student/{id}
//       async () => {
//         console.log('🔄 Trying strategy 2: Get user info then /student/{id}');
        
//         // First get current user info
//         const userResponse = await axiosInstance.get('/auth/me');
//         const userId = userResponse.data?.id || userResponse.data?.data?.id;
        
//         if (!userId) {
//           throw new Error('Cannot get current user ID');
//         }
        
//         console.log(`📋 Using userId: ${userId}`);
//         const response = await axiosInstance.get(`${API_URL}/student/${userId}`);
//         return response;
//       },
      
//       // Strategy 3: Try direct user endpoint and extract from token
//       async () => {
//         console.log('🔄 Trying strategy 3: Extract from token');
        
//         // Try to get user info from different endpoints
//         const endpoints = ['/users/me', '/auth/current-user', '/profile'];
        
//         for (const endpoint of endpoints) {
//           try {
//             const userResponse = await axiosInstance.get(endpoint);
//             const userId = userResponse.data?.id || userResponse.data?.data?.id;
            
//             if (userId) {
//               console.log(`📋 Found userId from ${endpoint}: ${userId}`);
//               const response = await axiosInstance.get(`${API_URL}/student/${userId}`);
//               return response;
//             }
//           } catch (error) {
//             console.log(`⚠️ Endpoint ${endpoint} failed:`, error.message);
//             continue;
//           }
//         }
        
//         throw new Error('Cannot determine user ID from any endpoint');
//       }
//     ];

//     // Try each strategy in sequence
//     for (let i = 0; i < strategies.length; i++) {
//       try {
//         const response = await strategies[i]();
//         console.log(`✅ Strategy ${i + 1} succeeded:`, response.data);
        
//         // Normalize response format
//         if (response.data && response.data.data) {
//           return { data: response.data.data };
//         } else if (Array.isArray(response.data)) {
//           return { data: response.data };
//         } else if (response.data) {
//           return { data: response.data };
//         } else {
//           return { data: [] };
//         }
        
//       } catch (error) {
//         console.warn(`❌ Strategy ${i + 1} failed:`, error.message);
        
//         // If this is the last strategy, throw the error
//         if (i === strategies.length - 1) {
//           console.error('🚨 All strategies failed, throwing error');
//           throw new Error(`All enrollment fetching strategies failed. Last error: ${error.message}`);
//         }
        
//         // Otherwise, continue to next strategy
//         continue;
//       }
//     }
//   },

//   /**
//    * Get classroom details by ID
//    * @param {number} id The ID of the classroom
//    * @returns {Promise<any>}
//    */
//   getClassroomDetails: (id) => {
//     return axiosInstance.get(`${API_URL}/${id}/details`);
//   },

//   /**
//    * IMPROVED: Get courses that the current student is enrolled in
//    * @returns {Promise<Array>} Enrolled courses
//    */
//   getEnrolledCourses: async () => {
//     try {
//       console.log('🎓 Getting enrolled courses...');
//       const response = await ClassroomService.getMyStudentCourses();
      
//       // Handle different response structures
//       let courses = [];
      
//       if (response.data && Array.isArray(response.data)) {
//         courses = response.data;
//       } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
//         courses = response.data.data;
//       } else if (Array.isArray(response)) {
//         courses = response;
//       }
      
//       console.log(`✅ Found ${courses.length} enrolled courses:`, courses);
//       return courses;
      
//     } catch (error) {
//       console.error('❌ Error fetching enrolled courses:', error);
//       throw error;
//     }
//   },

//   /**
//    * BONUS: Debug method to test all endpoints
//    * @returns {Promise<Object>} Debug info
//    */
//   debugStudentCourses: async () => {
//     const debug = {
//       timestamp: new Date().toISOString(),
//       results: {},
//       recommendations: []
//     };

//     const testEndpoints = [
//       { name: 'student/me', url: `${API_URL}/student/me` },
//       { name: 'auth/me', url: '/auth/me' },
//       { name: 'users/me', url: '/users/me' },
//       { name: 'profile', url: '/profile' },
//       { name: 'auth/current-user', url: '/auth/current-user' }
//     ];

//     for (const endpoint of testEndpoints) {
//       try {
//         const response = await axiosInstance.get(endpoint.url);
//         debug.results[endpoint.name] = {
//           success: true,
//           status: response.status,
//           dataStructure: typeof response.data,
//           hasData: !!response.data?.data,
//           isArray: Array.isArray(response.data),
//           keys: response.data ? Object.keys(response.data) : []
//         };
//       } catch (error) {
//         debug.results[endpoint.name] = {
//           success: false,
//           error: error.message,
//           status: error.response?.status
//         };
//       }
//     }

//     // Generate recommendations
//     if (debug.results['student/me']?.success) {
//       debug.recommendations.push('Use /student/me endpoint - it works!');
//     } else if (debug.results['auth/me']?.success) {
//       debug.recommendations.push('Use /auth/me to get user ID, then /student/{id}');
//     } else {
//       debug.recommendations.push('Check backend implementation for student course endpoints');
//     }

//     console.table(debug.results);
//     return debug;
//   }
// };

// export default ClassroomService;
import api from './api';
import axiosInstance from '../config/axiosInstance';

// Configuration object to handle different API configurations
const CONFIG = {
  // You can switch between different API configurations
  USE_CLASSROOM_MANAGEMENT_API: true, // Set to false to use simple /classrooms endpoint
  
  get baseUrl() {
    return this.USE_CLASSROOM_MANAGEMENT_API 
      ? '/classroom-management/classrooms' 
      : '/classrooms';
  },
  
  get apiClient() {
    return this.USE_CLASSROOM_MANAGEMENT_API ? api : axiosInstance;
  }
};

const ClassroomService = {
  // ================= CONFIGURATION ================= //
  
  /**
   * Switch API configuration
   * @param {boolean} useClassroomManagement - Whether to use classroom-management API
   */
  setApiConfiguration(useClassroomManagement = true) {
    CONFIG.USE_CLASSROOM_MANAGEMENT_API = useClassroomManagement;
    console.log(`API Configuration switched to: ${CONFIG.baseUrl}`);
  },

  // ================= CRUD Operations ================= //
  
  /**
   * Get all classrooms with optional pagination
   * @param {number} page - Page number (default: 0)
   * @param {number} size - Page size (default: 10)
   * @returns {Promise<Object>}
   */
  async getAllClassrooms(page = 0, size = 10) {
    try {
      let response;
      
      if (CONFIG.USE_CLASSROOM_MANAGEMENT_API) {
        // Use pagination for classroom-management API
        response = await CONFIG.apiClient.get(`${CONFIG.baseUrl}?page=${page}&size=${size}`);
        return {
          data: response.data.content || response.data,
          totalPages: response.data.totalPages || 1,
          totalElements: response.data.totalElements || (response.data.content ? response.data.content.length : 0)
        };
      } else {
        // Simple API without pagination
        response = await CONFIG.apiClient.get(CONFIG.baseUrl);
        const data = Array.isArray(response.data) ? response.data : 
                    response.data.data ? response.data.data : [];
        return {
          data,
          totalPages: 1,
          totalElements: data.length
        };
      }
    } catch (error) {
      console.error('Error fetching all classrooms:', error);
      throw error;
    }
  },

  /**
   * Get a single classroom by its ID
   * @param {number|string} id - The ID of the classroom
   * @returns {Promise<Object>}
   */
  async getClassroomById(id) {
    try {
      const response = await CONFIG.apiClient.get(`${CONFIG.baseUrl}/${id}`);
      return { data: response.data };
    } catch (error) {
      console.error(`Error fetching classroom ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new classroom
   * @param {Object} classroomData - The data for the new classroom
   * @returns {Promise<Object>}
   */
  async createClassroom(classroomData) {
    try {
      const response = await CONFIG.apiClient.post(CONFIG.baseUrl, classroomData);
      return { data: response.data };
    } catch (error) {
      console.error('Error creating classroom:', error);
      throw error;
    }
  },

  /**
   * Update an existing classroom
   * @param {number|string} id - The ID of the classroom to update
   * @param {Object} classroomData - The updated data for the classroom
   * @returns {Promise<Object>}
   */
  async updateClassroom(id, classroomData) {
    try {
      const response = await CONFIG.apiClient.put(`${CONFIG.baseUrl}/${id}`, classroomData);
      return { data: response.data };
    } catch (error) {
      console.error(`Error updating classroom ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a classroom
   * @param {number|string} id - The ID of the classroom to delete
   * @returns {Promise<Object>}
   */
  async deleteClassroom(id) {
    try {
      await CONFIG.apiClient.delete(`${CONFIG.baseUrl}/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting classroom ${id}:`, error);
      throw error;
    }
  },

  // ================= Search Operations ================= //
  
  /**
   * Search classrooms by keyword
   * @param {string} keyword - Search keyword
   * @param {number} page - Page number (default: 0)
   * @param {number} size - Page size (default: 10)
   * @returns {Promise<Object>}
   */
  async searchClassrooms(keyword, page = 0, size = 10) {
    try {
      const encodedKeyword = encodeURIComponent(keyword);
      const response = await CONFIG.apiClient.get(
        `${CONFIG.baseUrl}/search?keyword=${encodedKeyword}&page=${page}&size=${size}`
      );
      
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
   * Get classrooms for current student - Enhanced with multiple strategies
   * @returns {Promise<Object>}
   */
  async getMyStudentCourses() {
    const strategies = [
      // Strategy 1: Classroom Management API
      async () => {
        console.log('🔄 Strategy 1: /classroom-management/classrooms/student/me');
        const response = await api.get('/classroom-management/classrooms/student/me');
        return response;
      },
      
      // Strategy 2: Simple API
      async () => {
        console.log('🔄 Strategy 2: /classrooms/student/me');
        const response = await axiosInstance.get('/classrooms/student/me');
        return response;
      },
      
      // Strategy 3: Get user info first, then use student/{id}
      async () => {
        console.log('🔄 Strategy 3: Get user info then /student/{id}');
        
        const userEndpoints = ['/auth/me', '/users/me', '/auth/current-user', '/profile'];
        
        for (const endpoint of userEndpoints) {
          try {
            const userResponse = await CONFIG.apiClient.get(endpoint);
            const userId = userResponse.data?.id || userResponse.data?.data?.id;
            
            if (userId) {
              console.log(`📋 Using userId from ${endpoint}: ${userId}`);
              const response = await CONFIG.apiClient.get(`${CONFIG.baseUrl}/student/${userId}`);
              return response;
            }
          } catch (error) {
            continue;
          }
        }
        
        throw new Error('Cannot determine user ID from any endpoint');
      },
      
      // Strategy 4: Current student endpoint
      async () => {
        console.log('🔄 Strategy 4: /current-student');
        const response = await CONFIG.apiClient.get(`${CONFIG.baseUrl}/current-student`);
        return response;
      }
    ];

    // Try each strategy in sequence
    for (let i = 0; i < strategies.length; i++) {
      try {
        const response = await strategies[i]();
        console.log(`✅ Strategy ${i + 1} succeeded:`, response.data);
        
        // Handle different response formats
        const classrooms = Array.isArray(response.data) ? response.data : 
                          response.data.data ? response.data.data : 
                          response.data.content ? response.data.content : [];
        
        return { 
          data: classrooms,
          totalElements: classrooms.length 
        };
        
      } catch (error) {
        console.warn(`❌ Strategy ${i + 1} failed:`, error.message);
        
        // If this is the last strategy, return empty data instead of throwing
        if (i === strategies.length - 1) {
          console.error('🚨 All strategies failed, returning empty data');
          return { 
            data: [],
            totalElements: 0,
            error: 'All enrollment fetching strategies failed'
          };
        }
        
        continue;
      }
    }
  },

  /**
   * Get enrolled courses for StudentMaterials component
   * @returns {Promise<Array>}
   */
  async getEnrolledCourses() {
    try {
      console.log('🔄 ClassroomService.getEnrolledCourses - Fetching enrolled courses for materials');
      
      const result = await this.getMyStudentCourses();
      const classrooms = result.data || [];
      
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
      return [];
    }
  },

  /**
   * Get classrooms for current teacher - Enhanced with fallback
   * @returns {Promise<Object>}
   */
  async getMyTeacherCourses() {
    try {
      let response;
      
      if (CONFIG.USE_CLASSROOM_MANAGEMENT_API) {
        response = await api.get('/classroom-management/classrooms/teacher/me');
      } else {
        response = await axiosInstance.get('/classrooms/current-teacher');
      }
      
      // Handle different response formats with mock fallback
      let classrooms;
      if (response.data && response.data.data) {
        classrooms = response.data.data;
      } else if (Array.isArray(response.data)) {
        classrooms = response.data;
      } else {
        console.warn('Unexpected response format, using mock data');
        classrooms = [
          { id: 1, name: "Toán Cao Cấp", section: "A", subject: "MATH101" },
          { id: 2, name: "Lập Trình Cơ Bản", section: "B", subject: "CS101" }
        ];
      }
      
      return { 
        data: classrooms,
        totalElements: classrooms.length 
      };
      
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      
      // Provide mock data as fallback
      console.log('Using mock classroom data due to API error');
      const mockData = [
        { id: 1, name: "Toán Cao Cấp", section: "A", subject: "MATH101" },
        { id: 2, name: "Lập Trình Cơ Bản", section: "B", subject: "CS101" }
      ];
      
      return {
        data: mockData,
        totalElements: mockData.length,
        error: error.message
      };
    }
  },

  /**
   * Alternative method for getting teacher classrooms
   * @returns {Promise<Object>}
   */
  async getClassroomsByCurrentTeacher() {
    return this.getMyTeacherCourses();
  },

  /**
   * Alternative method for getting student classrooms
   * @returns {Promise<Object>}
   */
  async getClassroomsByCurrentStudent() {
    return this.getMyStudentCourses();
  },

  // ================= Classroom Details ================= //
  
  /**
   * Get detailed classroom information
   * @param {number|string} id - Classroom ID
   * @returns {Promise<Object>}
   */
  async getClassroomDetails(id) {
    try {
      const response = await CONFIG.apiClient.get(`${CONFIG.baseUrl}/${id}/details`);
      return { data: response.data };
    } catch (error) {
      console.error(`Error fetching classroom details ${id}:`, error);
      throw error;
    }
  },

  // ================= Enrollment Operations ================= //
  
  /**
   * Enroll a student in a classroom - Enhanced to handle both API formats
   * @param {number|string} classroomId - The ID of the classroom
   * @param {number|string} studentId - The ID of the student
   * @returns {Promise<Object>}
   */
  async enrollStudent(classroomId, studentId) {
    try {
      let response;
      
      if (CONFIG.USE_CLASSROOM_MANAGEMENT_API) {
        response = await CONFIG.apiClient.post(
          `${CONFIG.baseUrl}/${classroomId}/students/${studentId}/enroll`
        );
      } else {
        response = await CONFIG.apiClient.post(
          `${CONFIG.baseUrl}/${classroomId}/enrollments`, 
          { studentId }
        );
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error enrolling student ${studentId} in classroom ${classroomId}:`, error);
      throw error;
    }
  },

  /**
   * Unenroll a student from a classroom - Enhanced to handle both API formats
   * @param {number|string} classroomId - The ID of the classroom
   * @param {number|string} studentId - The ID of the student
   * @returns {Promise<Object>}
   */
  async unenrollStudent(classroomId, studentId) {
    try {
      let response;
      
      if (CONFIG.USE_CLASSROOM_MANAGEMENT_API) {
        response = await CONFIG.apiClient.delete(
          `${CONFIG.baseUrl}/${classroomId}/students/${studentId}/unenroll`
        );
      } else {
        response = await CONFIG.apiClient.delete(
          `${CONFIG.baseUrl}/${classroomId}/enrollments/${studentId}`
        );
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Error unenrolling student ${studentId} from classroom ${classroomId}:`, error);
      throw error;
    }
  },

  // ================= Student Management ================= //
  
  /**
   * Get students in a classroom
   * @param {number|string} classroomId - Classroom ID
   * @returns {Promise<Object>}
   */
  async getStudentsInClassroom(classroomId) {
    try {
      const response = await CONFIG.apiClient.get(`${CONFIG.baseUrl}/${classroomId}/students`);
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

  /**
   * Get classrooms by student ID
   * @param {number|string} studentId - Student ID
   * @returns {Promise<Object>}
   */
  async getClassroomsByStudentId(studentId) {
    try {
      let response;
      
      if (CONFIG.USE_CLASSROOM_MANAGEMENT_API) {
        response = await CONFIG.apiClient.get(`/classroom-management/students/${studentId}/classrooms`);
      } else {
        response = await CONFIG.apiClient.get(`${CONFIG.baseUrl}/student/${studentId}`);
      }
      
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

  /**
   * Legacy method for backward compatibility
   * @param {number|string} studentId - Student ID
   * @returns {Promise<any>}
   */
  getStudentCourses(studentId) {
    return this.getClassroomsByStudentId(studentId);
  },

  /**
   * Remove a student from a classroom (alias for unenrollStudent)
   * @param {number|string} classroomId - Classroom ID
   * @param {number|string} studentId - Student ID
   * @returns {Promise<Object>}
   */
  removeStudent(classroomId, studentId) {
    return this.unenrollStudent(classroomId, studentId);
  },

  // ================= Debug & Utility Methods ================= //
  
  /**
   * Debug method to test all endpoints
   * @returns {Promise<Object>} Debug info
   */
  async debugStudentCourses() {
    const debug = {
      timestamp: new Date().toISOString(),
      currentConfig: {
        baseUrl: CONFIG.baseUrl,
        useClassroomManagement: CONFIG.USE_CLASSROOM_MANAGEMENT_API
      },
      results: {},
      recommendations: []
    };

    const testEndpoints = [
      { name: 'classroom-mgmt/student/me', url: '/classroom-management/classrooms/student/me', client: api },
      { name: 'classrooms/student/me', url: '/classrooms/student/me', client: axiosInstance },
      { name: 'auth/me', url: '/auth/me', client: CONFIG.apiClient },
      { name: 'users/me', url: '/users/me', client: CONFIG.apiClient },
      { name: 'profile', url: '/profile', client: CONFIG.apiClient },
      { name: 'auth/current-user', url: '/auth/current-user', client: CONFIG.apiClient }
    ];

    for (const endpoint of testEndpoints) {
      try {
        const response = await endpoint.client.get(endpoint.url);
        debug.results[endpoint.name] = {
          success: true,
          status: response.status,
          dataStructure: typeof response.data,
          hasData: !!response.data?.data,
          isArray: Array.isArray(response.data),
          keys: response.data ? Object.keys(response.data) : []
        };
      } catch (error) {
        debug.results[endpoint.name] = {
          success: false,
          error: error.message,
          status: error.response?.status
        };
      }
    }

    // Generate recommendations
    if (debug.results['classroom-mgmt/student/me']?.success) {
      debug.recommendations.push('Use classroom-management API with /student/me endpoint');
    } else if (debug.results['classrooms/student/me']?.success) {
      debug.recommendations.push('Use simple API with /student/me endpoint');
    } else if (debug.results['auth/me']?.success) {
      debug.recommendations.push('Use /auth/me to get user ID, then /student/{id}');
    } else {
      debug.recommendations.push('Check backend implementation for student course endpoints');
    }

    console.table(debug.results);
    return debug;
  },

  /**
   * Helper method to format classroom data for display
   * @param {Object} classroom - Raw classroom data
   * @returns {Object} Formatted classroom data
   */
  formatClassroomForDisplay(classroom) {
    return {
      id: classroom.id,
      name: classroom.name || classroom.className || 'Untitled Course',
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
   * @param {Error} error - The error object
   * @param {string} defaultMessage - Default error message
   * @returns {string} User-friendly error message
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