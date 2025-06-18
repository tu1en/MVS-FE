import api from './api';

const attendanceService = {
  // Lấy tất cả phiên điểm danh
  getAttendanceSessions: async () => {
    try {
      const response = await api.get('/api/attendance/sessions');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phiên điểm danh:', error);
      throw error;
    }
  },

  // Lấy phiên điểm danh theo ID
  getSessionById: async (sessionId) => {
    try {
      const response = await api.get(`/api/attendance/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy phiên điểm danh ${sessionId}:`, error);
      throw error;
    }
  },

  // Lấy danh sách sinh viên cho một phiên điểm danh
  getStudentsForSession: async (sessionId) => {
    try {
      const response = await api.get(`/api/attendance/session/${sessionId}/students`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách sinh viên cho phiên ${sessionId}:`, error);
      throw error;
    }
  },

  // Ghi nhận điểm danh cho sinh viên
  markAttendance: async (sessionId, attendanceData) => {
    try {
      const response = await api.post(`/api/attendance/mark/${sessionId}`, attendanceData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi ghi nhận điểm danh:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái điểm danh
  updateAttendanceStatus: async (attendanceId, status) => {
    try {
      const response = await api.put(`/api/attendance/${attendanceId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái điểm danh:', error);
      throw error;
    }
  },

  // Lấy thông tin điểm danh theo phiên học
  getAttendanceBySession: async (sessionId) => {
    try {
      const response = await api.get(`/api/attendance/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy điểm danh cho phiên ${sessionId}:`, error);
      throw error;
    }
  },

  // Tạo phiên điểm danh mới
  createAttendanceSession: async (sessionData) => {
    try {
      const response = await api.post('/api/attendance/sessions', sessionData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo phiên điểm danh mới:', error);
      throw error;
    }
  },

  // Bắt đầu một phiên điểm danh
  startAttendanceSession: async (sessionId) => {
    try {
      const response = await api.put(`/api/attendance/sessions/${sessionId}/start`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi bắt đầu phiên điểm danh ${sessionId}:`, error);
      throw error;
    }
  },

  // Kết thúc một phiên điểm danh
  endAttendanceSession: async (sessionId) => {
    try {
      const response = await api.put(`/api/attendance/sessions/${sessionId}/end`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi kết thúc phiên điểm danh ${sessionId}:`, error);
      throw error;
    }
  }
};

export default attendanceService; 