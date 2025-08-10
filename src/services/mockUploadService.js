import { message } from 'antd';
import axiosInstance from '../config/axiosInstance';

/**
 * Real file upload service using backend API
 * Handles file uploads to the server with proper error handling
 */
const FileUploadService = {
  /**
   * Upload file to server
   * @param {File} file - The file to upload
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<string>} - The file URL from server
   */
  async uploadFile(file, onProgress = null) {
    try {
      console.log('Starting file upload:', file.name);
      
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
        'image/bmp', 'image/webp', 'image/svg+xml', 'image/tiff',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Loại file không được hỗ trợ: ${file.type}`);
      }
      
      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error('File quá lớn. Kích thước tối đa là 50MB.');
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'uploads'); // Optional folder organization
      
      // Upload with progress tracking
      const response = await axiosInstance.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });
      
      const fileUrl = response.data.url || response.data.data?.url;
      if (!fileUrl) {
        throw new Error('Server không trả về URL file');
      }
      
      console.log('File upload successful:', fileUrl);
      message.success(`Tải file "${file.name}" thành công!`);
      
      return fileUrl;
      
    } catch (error) {
      console.error('File upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi tải file không xác định';
      message.error(`Lỗi tải file: ${errorMessage}`);
      throw error;
    }
  },

  /**
   * Upload multiple files
   * @param {FileList} files - Files to upload
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Array>} - Array of file URLs
   */
  async uploadMultipleFiles(files, onProgress = null) {
    try {
      const uploadPromises = Array.from(files).map((file, index) => 
        this.uploadFile(file, (progress) => {
          if (onProgress) {
            const totalProgress = ((index * 100) + progress) / files.length;
            onProgress(Math.round(totalProgress));
          }
        })
      );
      
      const results = await Promise.all(uploadPromises);
      return results;
      
    } catch (error) {
      console.error('Multiple file upload error:', error);
      throw error;
    }
  },

  /**
   * Delete file from server
   * @param {string} fileUrl - URL of file to delete
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFile(fileUrl) {
    try {
      await axiosInstance.delete('/api/files/delete', {
        data: { fileUrl }
      });
      
      message.success('Xóa file thành công');
      return true;
      
    } catch (error) {
      console.error('File deletion error:', error);
      message.error('Lỗi xóa file');
      return false;
    }
  }
};

export default FileUploadService;
