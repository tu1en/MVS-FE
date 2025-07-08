import apiClient from './apiClient';

/**
 * Service để tương tác với API livestream
 */
const LivestreamService = {
  /**
   * Tạo phiên livestream mới cho bài giảng
   * @param {Object} data - Dữ liệu để tạo phiên livestream
   * @param {number} data.lectureId - ID của bài giảng
   * @param {string} data.title - Tiêu đề của phiên livestream (tùy chọn)
   * @returns {Promise<Object>} Thông tin phiên livestream đã tạo
   */
  createLivestream: async (data) => {
    try {
      const response = await apiClient.post('/livestream/create', data);
      return response.data;
    } catch (error) {
      console.error('Error creating livestream:', error);
      throw error;
    }
  },

  /**
   * Lấy phiên livestream đang hoạt động của bài giảng
   * @param {number} lectureId - ID của bài giảng
   * @returns {Promise<Object>} Thông tin phiên livestream đang hoạt động
   */
  getActiveLivestreamForLecture: async (lectureId) => {
    try {
      const response = await apiClient.get(`/livestream/lecture/${lectureId}/active`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 204) {
        return null; // Không có phiên livestream nào đang hoạt động
      }
      console.error('Error getting active livestream:', error);
      throw error;
    }
  },

  /**
   * Kết thúc phiên livestream
   * @param {number} livestreamId - ID của phiên livestream
   * @returns {Promise<Object>} Thông tin phiên livestream đã kết thúc
   */
  endLivestream: async (livestreamId) => {
    try {
      const response = await apiClient.post(`/livestream/${livestreamId}/end`);
      return response.data;
    } catch (error) {
      console.error('Error ending livestream:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phiên livestream của bài giảng
   * @param {number} lectureId - ID của bài giảng
   * @returns {Promise<Array>} Danh sách phiên livestream
   */
  getLivestreamsByLecture: async (lectureId) => {
    try {
      const response = await apiClient.get(`/livestream/lecture/${lectureId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting livestreams:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phiên livestream đang hoạt động
   * @returns {Promise<Array>} Danh sách phiên livestream đang hoạt động
   */
  getActiveLivestreams: async () => {
    try {
      const response = await apiClient.get('/livestream/active');
      return response.data;
    } catch (error) {
      console.error('Error getting active livestreams:', error);
      throw error;
    }
  },

  /**
   * Cập nhật URL ghi âm cho phiên livestream
   * @param {number} livestreamId - ID của phiên livestream
   * @param {string} recordingUrl - URL của bản ghi âm
   * @returns {Promise<Object>} Thông tin phiên livestream đã cập nhật
   */
  updateRecordingUrl: async (livestreamId, recordingUrl) => {
    try {
      const response = await apiClient.post(`/livestream/${livestreamId}/recording`, { recordingUrl });
      return response.data;
    } catch (error) {
      console.error('Error updating recording URL:', error);
      throw error;
    }
  }
};

export default LivestreamService; 