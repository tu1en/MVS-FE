import axios from 'axios';
import { message } from 'antd';

/**
 * Simple file upload service specifically for explanation requests
 * Uses real backend upload with improved error handling
 */
const ExplanationFileUpload = {
  /**
   * Upload file for explanation request (REAL BACKEND)
   * @param {File} file - The file to upload
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<string>} - The uploaded file URL
   */
  async uploadFile(file, onProgress = null) {
    try {
      console.log('Starting REAL backend file upload:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'explanations');

      const response = await axios.post('http://localhost:8088/api/files/upload', formData, {
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
        console.log('REAL backend upload successful:', response.data.url);
        message.success(`Tải file "${file.name}" thành công!`);
        return response.data.url;
      } else {
        throw new Error('Server không trả về URL file');
      }
    } catch (error) {
      console.error('Real backend upload error:', error);
      
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
  },
  
  /**
   * Try real backend upload first, fallback to mock if it fails
   */
  async uploadFileWithFallback(file, onProgress = null) {
    try {
      console.log('Attempting real backend upload first...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'explanations');

      const response = await axios.post('http://localhost:8088/api/files/upload', formData, {
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
        timeout: 10000 // 10 second timeout
      });

      if (response.data && response.data.url) {
        console.log('Real backend upload successful:', response.data.url);
        message.success(`Tải file "${file.name}" thành công!`);
        return response.data.url;
      } else {
        throw new Error('Server không trả về URL file');
      }
    } catch (error) {
      console.warn('Backend upload failed, falling back to mock upload:', error.message);
      message.warning('Lỗi upload thật, chuyển sang chế độ thử nghiệm...');
      
      // Fallback to mock upload
      return await this.uploadFile(file, onProgress);
    }
  }
};

export default ExplanationFileUpload;
