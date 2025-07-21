import api from '../config/axiosInstance';

const teacherService = {
  // Get teacher messages
  getMessages: () => {
    return api.get('/teacher/messages');
  },

  // Get teacher teaching history
  getTeachingHistory: () => {
    return api.get('/teacher/teaching-history');
  },

  // Get teacher announcements
  getAnnouncements: () => {
    return api.get('/teacher/announcements');
  },

  // Get teacher leave requests
  getLeaveRequests: () => {
    return api.get('/teacher/leave-requests');
  },

  // Send message to student
  sendMessage: (data) => {
    return api.post('/teacher/messages', data);
  },

  // Get teacher dashboard stats
  getDashboardStats: () => {
    return api.get('/teacher/dashboard-stats');
  }
};

export default teacherService;
