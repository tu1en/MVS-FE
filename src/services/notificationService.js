import axios from 'axios';
import API_CONFIG from '../config/api-config';

const API_URL = API_CONFIG.BASE_URL;

export const notificationService = {
    // Tạo thông báo mới
    createNotification: async (data) => {
        const response = await axios.post(`${API_URL}/notifications`, data, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    // Lấy danh sách thông báo có phân trang và filter
    getNotifications: async (page = 0, size = 10, filters = {}) => {
        const { targetAudience, isRead } = filters;
        const response = await axios.get(`${API_URL}/notifications`, {
            params: {
                page,
                size,
                targetAudience,
                isRead
            },
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    // Đánh dấu thông báo đã đọc
    markAsRead: async (notificationId) => {
        const response = await axios.patch(`${API_URL}/notifications/${notificationId}/read`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    // Đánh dấu tất cả thông báo đã đọc
    markAllAsRead: async () => {
        const response = await axios.patch(`${API_URL}/notifications/read-all`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    // Lấy số lượng thông báo chưa đọc
    getUnreadCount: async () => {
        const response = await axios.get(`${API_URL}/notifications/unread/count`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    // Lấy danh sách thông báo chưa đọc
    getUnreadNotifications: async (limit = 5) => {
        const response = await axios.get(`${API_URL}/notifications/unread`, {
            params: { limit },
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }
};
