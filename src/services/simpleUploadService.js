import axios from 'axios';
import { message } from 'antd';

/**
 * Simple file upload service using the new simple backend endpoint
 * Bypasses complex file storage services that are causing 500 errors
 */
const SimpleUploadService = {
  /**
   * Upload file for explanation request
   * @param {File} file - The file to upload
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<string>} - The uploaded file URL
   */
  async uploadFile(file, onProgress = null) {
    try {
      console.log('Starting simple backend file upload:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:8088/api/simple-upload/explanation', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable && onProgress) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(Math.round(progress));
          }
        },
        timeout: 30000 // 30 second timeout
      });

      if (response.data && response.data.url) {
        console.log('Simple backend upload successful:', response.data.url);
        message.success(`Tải file "${file.name}" thành công!`);
        return response.data.url;
      } else {
        throw new Error('Server không trả về URL file');
      }
    } catch (error) {
      console.error('Simple backend upload error:', error);
      
      let errorMessage = 'Lỗi không xác định khi tải file';
      if (error.response) {
        errorMessage = `Lỗi server: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`;
        console.error('Server response:', error.response.data);
      } else if (error.request) {
        errorMessage = 'Không thể kết nối tới server';
      } else {
        errorMessage = error.message;
      }
      
      message.error(`Lỗi tải file: ${errorMessage}`);
      throw error;
    }
  }
};

export default SimpleUploadService;
