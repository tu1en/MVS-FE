import axiosInstance from '../config/axiosInstance';

const API_BASE_URL = '/api';

export const notificationTestService = {
  // Test attendance notification
  sendAttendanceNotification: async (data) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/n8n-webhook/attendance-submitted`, data);
      return response.data;
    } catch (error) {
      console.error('Error sending attendance notification:', error);
      throw error;
    }
  },

  // Test timetable notification
  sendTimetableNotification: async (data) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/n8n-webhook/timetable-event-created`, data);
      return response.data;
    } catch (error) {
      console.error('Error sending timetable notification:', error);
      throw error;
    }
  },

  // Send test notification via n8n
  sendTestNotification: async () => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/n8n-webhook/test-notification`);
      return response.data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  },

  // Send custom Zalo notification
  sendCustomZaloNotification: async (data) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/test/zalo-notification/send-custom`, data);
      return response.data;
    } catch (error) {
      console.error('Error sending custom Zalo notification:', error);
      throw error;
    }
  },

  // Send raw notification data
  sendRawNotification: async (data) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/test/zalo-notification/send-raw`, data);
      return response.data;
    } catch (error) {
      console.error('Error sending raw notification:', error);
      throw error;
    }
  },

  // Get notification status
  getNotificationStatus: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/test/zalo-notification/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting notification status:', error);
      throw error;
    }
  },

  // Get all classrooms
  getAllClassrooms: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/classrooms`);
      return response.data;
    } catch (error) {
      console.error('Error getting classrooms:', error);
      throw error;
    }
  },

  // Get students by classroom
  getStudentsByClassroom: async (classroomId) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/classrooms/${classroomId}/students`);
      return response.data;
    } catch (error) {
      console.error('Error getting students:', error);
      throw error;
    }
  },

  // Get all students
  getAllStudents: async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/v1/users/role/4`); // Role 4 = STUDENT
      return response.data;
    } catch (error) {
      console.error('Error getting all students:', error);
      throw error;
    }
  }
};

export default notificationTestService;
