import api from '../config/axiosInstance';

const teacherService = {
  // ✅ Lấy danh sách lớp học của giảng viên
  getClasses: (signal) => {
    if (signal) {
      return api.get('/teacher/courses', { signal });
    }
    return api.get('/teacher/courses');
  },

  // ✅ Lấy lịch sử giảng dạy
  getTeachingHistory: () => api.get('/teacher/teaching-history'),

  // ✅ Lấy thông báo của giảng viên
  getAnnouncements: () => api.get('/teacher/announcements'),

  // ✅ Lấy yêu cầu nghỉ phép của giảng viên
  getLeaveRequests: () => api.get('/teacher/leave-requests'),

  // ✅ Gửi tin nhắn cho sinh viên
  sendMessage: (data) => api.post('/messages/teacher', data),

  // ✅ Thống kê dashboard
  getDashboardStats: () => api.get('/teacher/dashboard-stats'),

  // ✅ Lấy tin nhắn của giảng viên
  getMessages: () => api.get('/teacher/messages'),

  // ✅ Lấy lịch giảng dạy
  getSchedules: () => api.get('/teacher/schedules')
};

export default teacherService;