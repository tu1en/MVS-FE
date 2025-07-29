import axios from 'axios';
import API_CONFIG from '../config/api-config.js';
import AssignmentModel from '../models/AssignmentModel';
import ClassroomModel from '../models/ClassroomModel';
import SubmissionModel from '../models/SubmissionModel';
import UserModel from '../models/UserModel';

// Tạo một instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor cho requests
apiClient.interceptors.request.use(
  config => {
    // Lấy token từ localStorage nếu có
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor cho responses
apiClient.interceptors.response.use(
  response => {
    // Bạn có thể xử lý dữ liệu phản hồi ở đây trước khi trả về
    return response;
  },
  error => {
    // Xử lý các lỗi chung
    if (error.response && error.response.status === 401) {
      // Xử lý lỗi xác thực (đã hết hạn token)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Api Service với các phương thức HTTP tiêu chuẩn và các phương thức tiện ích
 */

// Basic HTTP methods for direct API calls
const api = {
  /**
   * HTTP GET request
   * @param {String} url - The endpoint URL
   * @param {Object} config - Additional axios config
   * @returns {Promise} Axios response promise
   */
  get: (url, config = {}) => apiClient.get(url, config),
  
  /**
   * HTTP POST request
   * @param {String} url - The endpoint URL
   * @param {Object} data - The data to send
   * @param {Object} config - Additional axios config
   * @returns {Promise} Axios response promise
   */
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  
  /**
   * HTTP PUT request
   * @param {String} url - The endpoint URL
   * @param {Object} data - The data to send
   * @param {Object} config - Additional axios config
   * @returns {Promise} Axios response promise
   */
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),  
  /**
   * HTTP DELETE request
   * @param {String} url - The endpoint URL
   * @param {Object} config - Additional axios config
   * @returns {Promise} Axios response promise
   */
  delete: (url, config = {}) => apiClient.delete(url, config),
  
  /**
   * HTTP PATCH request
   * @param {String} url - The endpoint URL
   * @param {Object} data - The data to send
   * @param {Object} config - Additional axios config
   * @returns {Promise} Axios response promise
   */
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  // High-level API methods
  getTeacherDashboardStats: () => apiClient.get('/teacher/dashboard-stats'), // Thêm phương thức mới
  getAttendanceByUser: (userId) => ApiService.GetAttendanceByUser(userId),
  
  /**
   * Get users by role ID
   * @param {number} roleId - The role ID to filter by (1 for students, 2 for teachers)
   * @returns {Promise<Array<UserModel>>} Users with the specified role
   */
  GetUsersByRole: async (roleId) => {
    try {
      // The backend endpoint is /api/users/role/{roleId}
      // The apiClient has a baseURL of /api, so we just need to call /users/role/{roleId}
      console.log(`GetUsersByRole: Fetching users with role ID ${roleId} using endpoint /users/role/${roleId}`);
      const response = await apiClient.get(`/users/role/${roleId}`);
      
      console.log(`GetUsersByRole: Successfully fetched ${response.data.length} users.`);
      // Ensure the response is mapped to the UserModel
      return response.data.map(user => new UserModel(user));
    } catch (error) {
      console.error(`GetUsersByRole: Error fetching users with role ${roleId}:`, error);
      // It's better to throw the error so the caller component (e.g., TeacherMessagesPage) can handle it
      throw error;
    }
  },
  
  /**
   * Get students in a classroom
   * @param {number} classroomId - The ID of the classroom
   * @returns {Promise} Students in the classroom
   */
  GetClassStudents: async (classroomId) => {
    try {
      console.log(`GetClassStudents: Fetching students for classroom ${classroomId}`);
      const response = await apiClient.get(`/classrooms/${classroomId}/students`);
      console.log(`GetClassStudents: Found ${response.data.length} students in classroom ${classroomId}`);
      return response.data;
    } catch (error) {
      console.error(`GetClassStudents: Error fetching students for classroom ${classroomId}:`, error);
      throw new Error(`Failed to fetch students for classroom ${classroomId}: ${error.message}`);
    }
  },
  
  /**
   * Get received messages for a user
   * @param {number} recipientId - The ID of the message recipient
   * @returns {Promise} Messages data
   */
  GetReceivedMessages: async (recipientId) => {
    try {
      // Sửa đường dẫn, loại bỏ /api/ duplicate
      const response = await apiClient.get(`/messages/received/${recipientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching received messages:', error);
      throw error;
    }
  },
    /**
   * Get classrooms by teacher ID
   * @param {number} teacherId - The ID of the teacher
   * @returns {Promise} Classrooms data
   */
  GetClassroomsByTeacher: async (teacherId) => {
    try {
      // Sửa đường dẫn, loại bỏ /api/ duplicate
      const response = await apiClient.get(`/teacher/courses`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classrooms by teacher:', error);
      throw error;
    }
  },  /**
   * Get conversation between two users
   * @param {number} userId1 - First user ID
   * @param {number} userId2 - Second user ID
   * @returns {Promise} Conversation data
   */
  GetConversation: async (userId1, userId2) => {
    try {
      console.log(`API GetConversation: Requesting conversation between ${userId1} and ${userId2}`);
      console.log(`Using endpoint: ${API_CONFIG.ENDPOINTS.MESSAGES_CONVERSATION(userId1, userId2)}`);
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.MESSAGES_CONVERSATION(userId1, userId2));
      console.log('API GetConversation: Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      console.error('Full error details:', JSON.stringify({
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response'
      }));
      throw error;
    }
  },
  /**
   * Send a message
   * @param {Object} messageData - Message data to send
   * @returns {Promise} Send result
   */
  SendMessage: async (messageData) => {
    try {
      console.log('API SendMessage: Sending message with data:', messageData);
      console.log(`Using endpoint: ${API_CONFIG.ENDPOINTS.MESSAGES_SEND}`);
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.MESSAGES_SEND, messageData);
      console.log('API SendMessage: Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Full error details:', JSON.stringify({
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response'
      }));
      throw error;
    }
  },

  /**
   * Mark a message as read
   * @param {number} messageId - The message ID to mark as read
   * @returns {Promise} Update result
   */
  MarkMessageAsRead: async (messageId) => {
    try {
      const response = await apiClient.patch(API_CONFIG.ENDPOINTS.MESSAGES_MARK_READ(messageId));
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }
};

/**
 * Lớp ApiService cung cấp các phương thức tương tác với API model-specific
 */
class ApiService {
  /**
   * Lấy thông điệp chào từ API
   * @returns {Promise<String>} Thông điệp chào
   */
  static async GetGreeting() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.GREETING);
      return response.data;
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  //  USER SERVICES 

  /**
   * Lấy danh sách người dùng
   * @returns {Promise<Array<UserModel>>} Danh sách người dùng
   */
  static async GetUsers() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS);
      
      // Kiểm tra cấu trúc dữ liệu phản hồi thực tế
      let users = [];
      if (response.data.content) {
        users = response.data.content;
      } else if (response.data.data) {
        users = response.data.data;
      } else {
        users = response.data;
      }
      
      return UserModel.fromApiArray(users);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết người dùng theo ID
   * @param {Number} userId - ID người dùng
   * @returns {Promise<UserModel>} Người dùng
   */
  static async GetUserById(userId) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.USERS_BY_ID(userId));
      return new UserModel(response.data);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Tạo người dùng mới
   * @param {Object} userData - Dữ liệu người dùng
   * @returns {Promise<UserModel>} Người dùng đã tạo
   */
  static async CreateUser(userData) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.USERS, userData);
      return new UserModel(response.data);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Xóa người dùng theo ID
   * @param {Number} userId - ID người dùng cần xóa
   * @returns {Promise<Object>} Kết quả xóa
   */
  static async DeleteUser(userId) {
    try {
      const response = await apiClient.delete(API_CONFIG.ENDPOINTS.USERS_BY_ID(userId));
      return response.data;
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Lấy thông tin người dùng hiện tại
   * @returns {Promise<UserModel>} Người dùng hiện tại
   */
  static async GetCurrentUser() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CURRENT_USER);
      return new UserModel(response.data);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Đăng ký người dùng mới
   * @param {Object} userData - Dữ liệu đăng ký
   * @returns {Promise<Object>} Kết quả đăng ký
   */
  static async RegisterUser(userData) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.USER_REGISTER, userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Đăng nhập người dùng
   * @param {Object} credentials - Thông tin đăng nhập
   * @returns {Promise<Object>} Kết quả đăng nhập
   */
  static async LoginUser(credentials) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.USER_LOGIN, credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Đăng xuất người dùng
   */
  static LogoutUser() {
    localStorage.removeItem('token');
  }

  /**
   * Lấy danh sách người dùng có phân trang
   * @param {Number} page - Số trang (bắt đầu từ 0)
   * @param {Number} size - Số lượng mục trên mỗi trang
   * @returns {Promise<Object>} Đối tượng phân trang
   */
  static async GetUsersPaginated(page = API_CONFIG.PAGINATION.DEFAULT_PAGE, size = API_CONFIG.PAGINATION.DEFAULT_SIZE) {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.USERS}?page=${page}&size=${size}`);
      const result = response.data;
      
      // Chuyển đổi content thành UserModel
      if (result.content) {
        result.content = UserModel.fromApiArray(result.content);
      }
      
      return result;
    } catch (error) {
      this.HandleError(error);
      throw error;
    }  }

  //  MESSAGE SERVICES 

  /**
   * Get received messages for a user
   * @param {Number} recipientId - ID of the message recipient
   * @returns {Promise<Array>} List of received messages
   */
  static async GetReceivedMessages(recipientId) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.MESSAGES_RECEIVED(recipientId));
      return response.data;
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Get sent messages for a user
   * @param {Number} senderId - ID of the message sender
   * @returns {Promise<Array>} List of sent messages
   */
  static async GetSentMessages(senderId) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.MESSAGES_SENT(senderId));
      return response.data;
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Get conversation between two users
   * @param {Number} userId1 - First user ID
   * @param {Number} userId2 - Second user ID
   * @returns {Promise<Array>} List of messages in the conversation
   */
  static async GetConversation(userId1, userId2) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.MESSAGES_CONVERSATION(userId1, userId2));
      return response.data;
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }
  /**
   * Send a new message
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} Sent message
   */
  static async SendMessage(messageData) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.MESSAGES_SEND, messageData);
      return response.data;
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Mark a message as read
   * @param {Number} messageId - ID of the message to mark as read
   * @returns {Promise<Object>} Response data
   */
  static async MarkMessageAsRead(messageId) {
    try {
      const response = await apiClient.patch(API_CONFIG.ENDPOINTS.MESSAGES_MARK_READ(messageId));
      return response.data;
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Get classrooms by teacher ID
   * @param {Number} teacherId - ID of the teacher
   * @returns {Promise<Array<ClassroomModel>>} List of teacher's classrooms
   */
  static async GetClassroomsByTeacher(teacherId) {
    try {
      const response = await apiClient.get(`/teacher/courses`);
      
      let classrooms = [];
      if (Array.isArray(response.data)) {
        classrooms = response.data;
      } else if (response.data && response.data.content) {
        classrooms = response.data.content;
      } else if (response.data && response.data.data) {
        classrooms = response.data.data;
      }
      
      return ClassroomModel.fromApiArray(classrooms);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  //  CLASSROOM SERVICES

  /**
   * Lấy danh sách lớp học
   * @returns {Promise<Array<ClassroomModel>>} Danh sách lớp học
   */
  static async GetClasses() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CLASSES);
      
      let classes = [];
      if (response.data.content) {
        classes = response.data.content;
      } else if (response.data.data) {
        classes = response.data.data;
      } else {
        classes = response.data;
      }
      
      return ClassroomModel.fromApiArray(classes);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết lớp học theo ID
   * @param {Number} classId - ID lớp học
   * @returns {Promise<ClassroomModel>} Lớp học
   */
  static async GetClassById(classId) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CLASSES_BY_ID(classId));
      return new ClassroomModel(response.data);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Tạo lớp học mới
   * @param {Object} classData - Dữ liệu lớp học
   * @returns {Promise<ClassroomModel>} Lớp học đã tạo
   */
  static async CreateClass(classData) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.CLASSES, classData);
      return new ClassroomModel(response.data);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Cập nhật lớp học
   * @param {Number} classId - ID lớp học
   * @param {Object} classData - Dữ liệu lớp học
   * @returns {Promise<ClassroomModel>} Lớp học đã cập nhật
   */
  static async UpdateClass(classId, classData) {
    try {
      const response = await apiClient.put(API_CONFIG.ENDPOINTS.CLASSES_BY_ID(classId), classData);
      return new ClassroomModel(response.data);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Xóa lớp học
   * @param {Number} classId - ID lớp học cần xóa
   * @returns {Promise<Object>} Kết quả xóa
   */
  static async DeleteClass(classId) {
    try {
      const response = await apiClient.delete(API_CONFIG.ENDPOINTS.CLASSES_BY_ID(classId));
      return response.data;
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Ghi danh học sinh vào lớp
   * @param {Number} classId - ID lớp học
   * @param {Number} studentId - ID học sinh
   * @returns {Promise<Object>} Kết quả ghi danh
   */
  static async EnrollStudent(classId, studentId) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.CLASS_ENROLL(classId), { studentId });
      return response.data;
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Lấy danh sách học sinh trong lớp
   * @param {Number} classId - ID lớp học
   * @returns {Promise<Array<UserModel>>} Danh sách học sinh
   */
  static async GetClassStudents(classId) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CLASS_STUDENTS(classId));
      return UserModel.fromApiArray(response.data);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Lấy danh sách lớp học có phân trang
   * @param {Number} page - Số trang (bắt đầu từ 0)
   * @param {Number} size - Số lượng mục trên mỗi trang
   * @returns {Promise<Object>} Đối tượng phân trang
   */
  static async GetClassesPaginated(page = API_CONFIG.PAGINATION.DEFAULT_PAGE, size = API_CONFIG.PAGINATION.DEFAULT_SIZE) {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.CLASSES}?page=${page}&size=${size}`);
      const result = response.data;
      
      if (result.content) {
        result.content = ClassroomModel.fromApiArray(result.content);
      }
      
      return result;
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  //  ASSIGNMENT SERVICES 

  /**
   * Lấy danh sách bài tập
   * @param {Number} classId - ID lớp học (optional)
   * @returns {Promise<Array<AssignmentModel>>} Danh sách bài tập
   */
  static async GetAssignments(classId) {
    try {
      const url = classId ? API_CONFIG.ENDPOINTS.ASSIGNMENTS_BY_CLASS(classId) : API_CONFIG.ENDPOINTS.ASSIGNMENTS;
      const response = await apiClient.get(url);
      
      let assignments = [];
      if (response.data.content) {
        assignments = response.data.content;
      } else if (response.data.data) {
        assignments = response.data.data;
      } else {
        assignments = response.data;
      }
      
      return AssignmentModel.fromApiArray(assignments);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết bài tập theo ID
   * @param {Number} assignmentId - ID bài tập
   * @returns {Promise<AssignmentModel>} Bài tập
   */
  static async GetAssignmentById(assignmentId) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.ASSIGNMENTS_BY_ID(assignmentId));
      return new AssignmentModel(response.data);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Tạo bài tập mới
   * @param {Object} assignmentData - Dữ liệu bài tập
   * @returns {Promise<AssignmentModel>} Bài tập đã tạo
   */
  static async CreateAssignment(assignmentData) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.ASSIGNMENTS, assignmentData);
      return new AssignmentModel(response.data);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Cập nhật bài tập
   * @param {Number} assignmentId - ID bài tập
   * @param {Object} assignmentData - Dữ liệu bài tập
   * @returns {Promise<AssignmentModel>} Bài tập đã cập nhật
   */
  static async UpdateAssignment(assignmentId, assignmentData) {
    try {
      const response = await apiClient.put(API_CONFIG.ENDPOINTS.ASSIGNMENTS_BY_ID(assignmentId), assignmentData);
      return new AssignmentModel(response.data);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Xóa bài tập
   * @param {Number} assignmentId - ID bài tập cần xóa
   * @returns {Promise<Object>} Kết quả xóa
   */
  static async DeleteAssignment(assignmentId) {
    try {
      const response = await apiClient.delete(API_CONFIG.ENDPOINTS.ASSIGNMENTS_BY_ID(assignmentId));
      return response.data;
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  //  SUBMISSION SERVICES 

  /**
   * Lấy danh sách bài nộp theo bài tập
   * @param {Number} assignmentId - ID bài tập
   * @returns {Promise<Array<SubmissionModel>>} Danh sách bài nộp
   */
  static async GetSubmissionsByAssignment(assignmentId) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.SUBMISSIONS_BY_ASSIGNMENT(assignmentId));
      return SubmissionModel.fromApiArray(response.data);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Lấy danh sách bài nộp của học sinh
   * @param {Number} studentId - ID học sinh
   * @returns {Promise<Array<SubmissionModel>>} Danh sách bài nộp
   */
  static async GetSubmissionsByStudent(studentId) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.SUBMISSIONS_BY_STUDENT(studentId));
      return SubmissionModel.fromApiArray(response.data);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Tạo bài nộp mới
   * @param {Object} submissionData - Dữ liệu bài nộp
   * @returns {Promise<SubmissionModel>} Bài nộp đã tạo
   */
  static async CreateSubmission(submissionData) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.SUBMISSIONS, submissionData);
      return new SubmissionModel(response.data);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Cập nhật điểm cho bài nộp
   * @param {Number} submissionId - ID bài nộp
   * @param {Object} gradeData - Dữ liệu điểm và phản hồi
   * @returns {Promise<SubmissionModel>} Bài nộp đã chấm điểm
   */
  static async GradeSubmission(submissionId, gradeData) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.SUBMISSION_GRADE(submissionId), gradeData);
      return new SubmissionModel(response.data);
    } catch (error) {
      this.HandleError(error);
      throw error;
    }
  }
  /**
   * Xử lý lỗi từ API
   * @param {Error} error Đối tượng lỗi 
   */
  static HandleError(error) {
    if (error.response) {
      // Lỗi từ phía server (status code không phải 2xx)
      console.error('Lỗi phản hồi:', error.response.status, error.response.data);
    } else if (error.request) {
      // Lỗi không nhận được phản hồi
      console.error('Lỗi không nhận được phản hồi:', error.request);
    } else {
      // Lỗi khi thiết lập request
      console.error('Lỗi:', error.message);
    }
  }

  /**
   * Lấy danh sách khóa học của giảng viên hiện tại
   * @returns {Promise<Array<ClassroomModel>>} Danh sách khóa học
   */
  static async GetTeacherCourses() {
    try {
      // Sửa đường dẫn, loại bỏ /api/ duplicate
      const response = await apiClient.get('/teacher/courses');
      
      // Log để debug
      console.log('GetTeacherCourses response:', response.data);
      
      let courses = [];
      if (Array.isArray(response.data)) {
        courses = response.data;
      } else if (response.data && response.data.content) {
        courses = response.data.content;
      } else if (response.data && response.data.data) {
        courses = response.data.data;
      }
      
      return ClassroomModel.fromApiArray(courses);
    } catch (error) {
      console.error('Error in GetTeacherCourses:', error);
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Lấy danh sách lớp học của giảng viên hiện tại
   * @returns {Promise<Array<ClassroomModel>>} Danh sách lớp học của giảng viên hiện tại
   */
  static async GetTeacherClasses() {
    try {
      // Sửa đường dẫn, loại bỏ /api/ duplicate
      const response = await apiClient.get('/classroom-management/classrooms/current-teacher');
      
      // Log để debug
      console.log('GetTeacherClasses response:', response.data);
      
      let classrooms = [];
      if (Array.isArray(response.data)) {
        classrooms = response.data;
      } else if (response.data && response.data.content) {
        classrooms = response.data.content;
      } else if (response.data && response.data.data) {
        classrooms = response.data.data;
      }
      
      return ClassroomModel.fromApiArray(classrooms);
    } catch (error) {
      console.error('Error in GetTeacherClasses:', error);
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tin nhắn đã nhận cho người dùng
   * @param {number} recipientId - ID của người nhận tin nhắn
   * @returns {Promise} Dữ liệu tin nhắn
   */  static async GetReceivedMessages(recipientId) {
    try {
      // Sửa đường dẫn, loại bỏ /api/ duplicate
      const response = await apiClient.get(`/messages/received/${recipientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching received messages:', error);
      this.HandleError(error);
      throw error;
    }
  }  /**
   * Lấy danh sách lớp học theo giảng viên
   * @param {number} teacherId - ID của giảng viên
   * @returns {Promise} Dữ liệu lớp học
   */
  static async GetClassroomsByTeacher(teacherId) {
    try {
      // Sửa đường dẫn, loại bỏ /api/ duplicate
      const response = await apiClient.get(`/teacher/courses`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classrooms by teacher:', error);
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Lấy dữ liệu điểm danh của học sinh
   * @returns {Promise} Dữ liệu điểm danh
   */
  static async GetStudentAttendance() {
    try {
      const userId = localStorage.getItem('userId');
      const config = {
        headers: {}
      };
      
      if (userId) {
        config.headers['X-User-Id'] = userId;
      }
      
      const response = await apiClient.get('/attendance/student/view', config);
      return response.data;
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      this.HandleError(error);
      throw error;
    }
  }

  /**
   * Lấy dữ liệu điểm danh theo user ID
   * @param {number} userId - ID của người dùng
   * @returns {Promise} Dữ liệu điểm danh
   */
  static async GetAttendanceByUser(userId) {
    try {
      const response = await apiClient.get(`/attendance/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance by user:', error);
      this.HandleError(error);
      throw error;
    }
  }
}

// Export both the direct API methods and the ApiService class
export { ApiService };
export default api;